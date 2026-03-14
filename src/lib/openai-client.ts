import OpenAI from 'openai'
import { client } from '@/lib/prisma'
import {
  checkOpenAIAccess,
  releaseOpenAIConcurrency,
  recordOpenAIError,
  recordOpenAIResponseTime,
  checkTokenSpike,
} from '@/lib/openai-protection'
import { getUserTokensInWindow } from '@/lib/ai-usage'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const MODEL = 'gpt-4o-mini'
const MAX_TOKENS = 800
const MAX_HISTORY_MESSAGES = 8
const TOKEN_LIMIT = 6000
const CHARS_PER_TOKEN = 4

const INPUT_TOKEN_RATE = 0.000150 / 1000
const OUTPUT_TOKEN_RATE = 0.000600 / 1000

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(?:previous|all)\s+instructions/i,
  /you\s+are\s+now\b/i,
  /\bact\s+as\b/i,
  /pretend\s+(?:you\s+are|to\s+be)\b/i,
  /forget\s+(?:your|all|previous)\s+instructions/i,
  /\bnew\s+persona\b/i,
  /\bjailbreak\b/i,
  /\bdan\s+mode\b/i,
  /(?:reveal|show|print|display|tell\s+me)\s+(?:your\s+)?system\s+prompt/i,
  /(?:what\s+is|repeat)\s+your\s+(?:system\s+)?(?:prompt|instructions)/i,
  /(?:override|disregard|bypass)\s+(?:your\s+)?(?:system\s+)?(?:prompt|instructions)/i,
]

const SPECIAL_CHAR_REPEAT = /([^a-zA-Z0-9\s])\1{9,}/

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ProtectedChatRequest {
  userId: string
  domainId?: string
  ipAddress: string
  systemPrompt: string
  messages: ChatMessage[]
}

export interface ProtectedChatSuccess {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    estimatedCostUsd: number
  }
}

export interface ProtectedChatError {
  error: string
  statusCode: number
  retryAfter?: number
  code?: string
}

export type ProtectedChatResult = ProtectedChatSuccess | ProtectedChatError

function isError(result: ProtectedChatResult): result is ProtectedChatError {
  return 'error' in result
}

export { isError }

function hasInjectionAttempt(text: string): boolean {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) return true
  }
  const specialMatch = SPECIAL_CHAR_REPEAT.exec(text)
  if (specialMatch && /[^a-zA-Z0-9\s]/.test(specialMatch[1])) return true
  return false
}

function estimateTokens(texts: string[]): number {
  return Math.ceil(texts.reduce((sum, t) => sum + t.length, 0) / CHARS_PER_TOKEN)
}

function trimHistory(messages: ChatMessage[], systemPrompt: string): ChatMessage[] {
  const systemTokens = estimateTokens([systemPrompt])
  let trimmed = messages.slice(-MAX_HISTORY_MESSAGES)

  while (
    trimmed.length > 1 &&
    estimateTokens(trimmed.map((m) => m.content)) + systemTokens > TOKEN_LIMIT
  ) {
    trimmed = trimmed.slice(1)
  }

  return trimmed
}

async function logUsage(data: {
  userId: string
  domainId?: string
  ipAddress: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCostUsd: number
  responseTimeMs: number
  blocked: boolean
  blockReason?: string
}): Promise<void> {
  try {
    await client.aIUsageLog.create({
      data: {
        userId: data.userId,
        domainId: data.domainId ?? null,
        ipAddress: data.ipAddress,
        promptTokens: data.promptTokens,
        completionTokens: data.completionTokens,
        totalTokens: data.totalTokens,
        estimatedCostUsd: data.estimatedCostUsd,
        responseTimeMs: data.responseTimeMs,
        model: MODEL,
        blocked: data.blocked,
        blockReason: data.blockReason ?? null,
      },
    })
  } catch (err) {
    console.error('[AI Client] Failed to log usage:', err)
  }
}

async function checkUserTokenAbuse(userId: string): Promise<void> {
  const tokensLastHour = await getUserTokensInWindow(userId, 3_600_000)
  if (tokensLastHour > 200_000) {
    const blockedUntil = new Date(Date.now() + 24 * 60 * 60_000)
    await client.user.update({
      where: { id: userId },
      data: { blockedUntil },
    })
  }
}

export async function callOpenAIWithProtection(
  request: ProtectedChatRequest
): Promise<ProtectedChatResult> {
  const { userId, domainId, ipAddress, systemPrompt, messages } = request
  const startTime = Date.now()

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
  if (lastUserMessage && hasInjectionAttempt(lastUserMessage.content)) {
    await logUsage({
      userId,
      domainId,
      ipAddress,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      responseTimeMs: Date.now() - startTime,
      blocked: true,
      blockReason: 'INJECTION_DETECTED',
    })
    return { error: 'Invalid request content', statusCode: 400 }
  }

  const access = await checkOpenAIAccess(userId, ipAddress)

  if (!access.allowed) {
    await logUsage({
      userId,
      domainId,
      ipAddress,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      responseTimeMs: Date.now() - startTime,
      blocked: true,
      blockReason: access.code ?? access.reason ?? 'ACCESS_DENIED',
    })
    return {
      error: access.reason ?? 'Request denied',
      statusCode: access.statusCode ?? 429,
      retryAfter: access.retryAfter,
      code: access.code,
    }
  }

  try {
    const trimmedMessages = trimHistory(messages, systemPrompt)

    const response = await openai.chat.completions.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        { role: 'system', content: systemPrompt },
        ...trimmedMessages.map((m) => ({ role: m.role, content: m.content })),
      ],
    })

    const responseTimeMs = Date.now() - startTime
    const usage = response.usage!
    const estimatedCostUsd =
      usage.prompt_tokens * INPUT_TOKEN_RATE + usage.completion_tokens * OUTPUT_TOKEN_RATE

    await logUsage({
      userId,
      domainId,
      ipAddress,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
      estimatedCostUsd,
      responseTimeMs,
      blocked: false,
    })

    recordOpenAIResponseTime(responseTimeMs)

    Promise.all([checkUserTokenAbuse(userId), checkTokenSpike()]).catch((err) =>
      console.error('[AI Client] Post-request check error:', err)
    )

    return {
      content: response.choices[0].message.content ?? '',
      usage: {
        promptTokens: usage.prompt_tokens,
        completionTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens,
        estimatedCostUsd,
      },
    }
  } catch (err) {
    const responseTimeMs = Date.now() - startTime
    recordOpenAIError()
    recordOpenAIResponseTime(responseTimeMs)

    await logUsage({
      userId,
      domainId,
      ipAddress,
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      responseTimeMs,
      blocked: true,
      blockReason: 'OPENAI_ERROR',
    })

    console.error('[AI Client] OpenAI call failed:', err)
    return { error: 'AI request failed', statusCode: 500 }
  } finally {
    releaseOpenAIConcurrency()
  }
}
