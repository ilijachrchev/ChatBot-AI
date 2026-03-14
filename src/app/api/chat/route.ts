import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import client from '@/lib/prisma'
import { callOpenAIWithProtection, isError } from '@/lib/openai-client'

const MAX_MESSAGE_LENGTH = 2000
const MAX_HISTORY_MESSAGES = 10
const TOKEN_LIMIT = 6000
const CHARS_PER_TOKEN = 4

function estimateTokens(content: string): number {
  return Math.ceil(content.length / CHARS_PER_TOKEN)
}

function extractIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    req.headers.get('cf-connecting-ip') ??
    '127.0.0.1'
  )
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Content-Type check
  const contentType = req.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 })
  }

  // 2. Auth
  const clerkUser = await currentUser()
  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 3. Parse body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('messages' in body) ||
    !('systemPrompt' in body)
  ) {
    return NextResponse.json(
      { error: 'Missing required fields: messages, systemPrompt' },
      { status: 400 }
    )
  }

  const { messages, systemPrompt, domainId } = body as {
    messages: unknown
    systemPrompt: unknown
    domainId?: unknown
  }

  // 4. Validate messages array
  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: 'messages must be an array' }, { status: 400 })
  }

  if (messages.length > MAX_HISTORY_MESSAGES) {
    return NextResponse.json(
      { error: `Conversation history must not exceed ${MAX_HISTORY_MESSAGES} messages` },
      { status: 400 }
    )
  }

  for (const msg of messages) {
    if (
      typeof msg !== 'object' ||
      msg === null ||
      typeof (msg as Record<string, unknown>).role !== 'string' ||
      typeof (msg as Record<string, unknown>).content !== 'string'
    ) {
      return NextResponse.json({ error: 'Invalid message format' }, { status: 400 })
    }

    const role = (msg as Record<string, string>).role
    const content = (msg as Record<string, string>).content

    if (!['user', 'assistant'].includes(role)) {
      return NextResponse.json({ error: 'Message role must be user or assistant' }, { status: 400 })
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message length must not exceed ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      )
    }
  }

  if (typeof systemPrompt !== 'string' || systemPrompt.trim().length === 0) {
    return NextResponse.json({ error: 'systemPrompt must be a non-empty string' }, { status: 400 })
  }

  // 5. Token estimate check
  const totalTokens =
    estimateTokens(systemPrompt as string) +
    messages.reduce(
      (sum, m) => sum + estimateTokens((m as Record<string, string>).content),
      0
    )

  if (totalTokens > TOKEN_LIMIT) {
    return NextResponse.json(
      { error: 'Total conversation token estimate exceeds limit' },
      { status: 400 }
    )
  }

  // 6. Look up internal user
  const dbUser = await client.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { id: true },
  })

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 401 })
  }

  // 7. Extract IP
  const ipAddress = extractIp(req)

  // 8. Call protected OpenAI client
  const result = await callOpenAIWithProtection({
    userId: dbUser.id,
    domainId: typeof domainId === 'string' ? domainId : undefined,
    ipAddress,
    systemPrompt: systemPrompt as string,
    messages: (messages as Array<Record<string, string>>).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  })

  if (isError(result)) {
    const res: Record<string, unknown> = { error: result.error }
    if (result.code) res.code = result.code
    if (result.retryAfter) res.retryAfter = result.retryAfter
    return NextResponse.json(res, { status: result.statusCode })
  }

  return NextResponse.json({
    content: result.content,
    usage: result.usage,
  })
}
