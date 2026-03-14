import nodemailer from 'nodemailer'
import { client } from '@/lib/prisma'
import {
  getUserMonthlyUsageCost,
  getGlobalMonthlyUsageCost,
  getUserPlanLimitUsd,
  getGlobalTokensInWindow,
  GLOBAL_BUDGET_USD,
} from '@/lib/ai-usage'

export type AccessResult = {
  allowed: boolean
  reason?: string
  statusCode?: number
  retryAfter?: number
  code?: string
}


interface WindowCounter {
  count: number
  resetAt: number
}

interface IpRateLimits {
  minute: WindowCounter
  hour: WindowCounter
}

interface UserRateLimits {
  minute: WindowCounter
  hour: WindowCounter
  day: WindowCounter
}

const ipRateLimits = new Map<string, IpRateLimits>()
const userRateLimits = new Map<string, UserRateLimits>()


const ipRequestTimestamps = new Map<string, number[]>()
const ipBlocklist = new Map<string, number>()


const globalSecondTimestamps: number[] = []

let activeConcurrent = 0
const MAX_CONCURRENT = 2
const MAX_PER_SECOND = 2


interface CircuitBreaker {
  open: boolean
  openUntil: number
  code: string
  errorTimestamps: number[]
  consecutiveSlowResponses: number
}

const circuitBreaker: CircuitBreaker = {
  open: false,
  openUntil: 0,
  code: 'CIRCUIT_BREAKER',
  errorTimestamps: [],
  consecutiveSlowResponses: 0,
}


let globalBudgetAlertMonth = -1
let tokenSpikeAlertAt = 0


const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODE_MAILER_EMAIL,
    pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
  },
})

async function sendAdminAlert(subject: string, body: string): Promise<void> {
  const to = process.env.ADMIN_EMAIL
  if (!to) return
  try {
    await mailer.sendMail({
      from: `"SendWise AI Alerts" <${process.env.NODE_MAILER_EMAIL}>`,
      to,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #dc2626; margin-top: 0;">${subject}</h2>
          ${body}
          <hr style="margin: 24px 0; border-color: #e2e8f0;" />
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">SendWise AI &mdash; Automated Alert System</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('[AI Protection] Admin alert failed:', err)
  }
}


function incrementCounter(counter: WindowCounter, windowMs: number): number {
  const now = Date.now()
  if (now >= counter.resetAt) {
    counter.count = 0
    counter.resetAt = now + windowMs
  }
  return ++counter.count
}

function getOrCreateIpLimits(ip: string): IpRateLimits {
  if (!ipRateLimits.has(ip)) {
    const now = Date.now()
    ipRateLimits.set(ip, {
      minute: { count: 0, resetAt: now + 60_000 },
      hour: { count: 0, resetAt: now + 3_600_000 },
    })
  }
  return ipRateLimits.get(ip)!
}

function getOrCreateUserLimits(userId: string): UserRateLimits {
  if (!userRateLimits.has(userId)) {
    const now = Date.now()
    userRateLimits.set(userId, {
      minute: { count: 0, resetAt: now + 60_000 },
      hour: { count: 0, resetAt: now + 3_600_000 },
      day: { count: 0, resetAt: now + 86_400_000 },
    })
  }
  return userRateLimits.get(userId)!
}


function trackAndMaybeBlockIp(ip: string): void {
  const now = Date.now()
  const windowStart = now - 5 * 60_000

  const timestamps = ipRequestTimestamps.get(ip) ?? []
  const recent = timestamps.filter((t) => t > windowStart)
  recent.push(now)
  ipRequestTimestamps.set(ip, recent)

  if (recent.length > 30 && !ipBlocklist.has(ip)) {
    const blockUntil = now + 60 * 60_000
    ipBlocklist.set(ip, blockUntil)
    sendAdminAlert(
      'SendWise AI: IP Auto-Blocked',
      `
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>IP Address:</strong> ${ip}</p>
        <p><strong>Requests in last 5 minutes:</strong> ${recent.length}</p>
        <p><strong>Blocked until:</strong> ${new Date(blockUntil).toISOString()}</p>
        <p><strong>Suggested action:</strong> Review logs for this IP and consider a permanent firewall rule if abuse continues.</p>
      `
    )
  }
}


function checkGlobalPerSecond(): boolean {
  const now = Date.now()
  const cutoff = now - 1_000
  while (globalSecondTimestamps.length > 0 && globalSecondTimestamps[0] < cutoff) {
    globalSecondTimestamps.shift()
  }
  if (globalSecondTimestamps.length >= MAX_PER_SECOND) return false
  globalSecondTimestamps.push(now)
  return true
}


export function recordOpenAIError(): void {
  const now = Date.now()
  const cutoff = now - 60_000
  circuitBreaker.errorTimestamps = circuitBreaker.errorTimestamps.filter((t) => t > cutoff)
  circuitBreaker.errorTimestamps.push(now)

  if (circuitBreaker.errorTimestamps.length > 10 && !circuitBreaker.open) {
    circuitBreaker.open = true
    circuitBreaker.openUntil = now + 10 * 60_000
    circuitBreaker.code = 'CIRCUIT_BREAKER'
    sendAdminAlert(
      'SendWise AI: Circuit Breaker Activated — Excessive Errors',
      `
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Errors in last 60 seconds:</strong> ${circuitBreaker.errorTimestamps.length}</p>
        <p><strong>AI disabled until:</strong> ${new Date(circuitBreaker.openUntil).toISOString()}</p>
        <p><strong>Suggested action:</strong> Check OpenAI API status dashboard and review server error logs.</p>
      `
    )
  }
}

export function recordOpenAIResponseTime(ms: number): void {
  if (ms > 45_000) {
    circuitBreaker.consecutiveSlowResponses++
    if (circuitBreaker.consecutiveSlowResponses >= 3 && !circuitBreaker.open) {
      const now = Date.now()
      circuitBreaker.open = true
      circuitBreaker.openUntil = now + 5 * 60_000
      circuitBreaker.code = 'CIRCUIT_BREAKER'
      sendAdminAlert(
        'SendWise AI: Circuit Breaker Activated — Slow Responses',
        `
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Consecutive slow responses:</strong> ${circuitBreaker.consecutiveSlowResponses}</p>
          <p><strong>Last response time:</strong> ${ms}ms</p>
          <p><strong>AI disabled until:</strong> ${new Date(circuitBreaker.openUntil).toISOString()}</p>
          <p><strong>Suggested action:</strong> Check OpenAI API performance and consider reducing max_tokens.</p>
        `
      )
    }
  } else {
    circuitBreaker.consecutiveSlowResponses = 0
  }
}

export async function checkTokenSpike(): Promise<void> {
  const now = Date.now()
  const [currentTokens, previousTokens] = await Promise.all([
    getGlobalTokensInWindow(3_600_000),
    getGlobalTokensInWindow(7_200_000).then((total) =>
      getGlobalTokensInWindow(3_600_000).then((current) => total - current)
    ),
  ])

  const spikeDetected =
    previousTokens > 0 &&
    currentTokens > previousTokens * 4 &&
    !circuitBreaker.open &&
    now - tokenSpikeAlertAt > 3_600_000

  if (spikeDetected) {
    circuitBreaker.open = true
    circuitBreaker.openUntil = now + 15 * 60_000
    circuitBreaker.code = 'CIRCUIT_BREAKER'
    tokenSpikeAlertAt = now
    await sendAdminAlert(
      'SendWise AI: Token Usage Spike Detected',
      `
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>Current hour tokens:</strong> ${currentTokens.toLocaleString()}</p>
        <p><strong>Previous hour tokens:</strong> ${previousTokens.toLocaleString()}</p>
        <p><strong>Spike factor:</strong> ${previousTokens > 0 ? (currentTokens / previousTokens).toFixed(1) : 'N/A'}x</p>
        <p><strong>AI disabled until:</strong> ${new Date(circuitBreaker.openUntil).toISOString()}</p>
        <p><strong>Suggested action:</strong> Review usage logs immediately for abuse patterns.</p>
      `
    )
  }
}

function getCircuitBreakerStatus(): { open: boolean; retryAfter: number } {
  if (!circuitBreaker.open) return { open: false, retryAfter: 0 }
  const now = Date.now()
  if (now >= circuitBreaker.openUntil) {
    circuitBreaker.open = false
    circuitBreaker.consecutiveSlowResponses = 0
    circuitBreaker.errorTimestamps = []
    return { open: false, retryAfter: 0 }
  }
  return { open: true, retryAfter: Math.ceil((circuitBreaker.openUntil - now) / 1000) }
}


export function releaseOpenAIConcurrency(): void {
  if (activeConcurrent > 0) activeConcurrent--
}


export async function checkOpenAIAccess(
  userId: string,
  ipAddress: string
): Promise<AccessResult> {
  if (process.env.AI_ENABLED === 'false') {
    return {
      allowed: false,
      reason: 'AI temporarily disabled',
      statusCode: 503,
      code: 'KILL_SWITCH',
    }
  }

  const cb = getCircuitBreakerStatus()
  if (cb.open) {
    return {
      allowed: false,
      reason: 'AI temporarily unavailable',
      statusCode: 503,
      retryAfter: cb.retryAfter,
      code: 'CIRCUIT_BREAKER',
    }
  }

  const ipBlockedUntil = ipBlocklist.get(ipAddress)
  if (ipBlockedUntil) {
    if (Date.now() < ipBlockedUntil) {
      return { allowed: false, reason: 'Access denied', statusCode: 403 }
    }
    ipBlocklist.delete(ipAddress)
  }

  trackAndMaybeBlockIp(ipAddress)

  const ipLimits = getOrCreateIpLimits(ipAddress)
  const ipMinute = incrementCounter(ipLimits.minute, 60_000)
  if (ipMinute > 5) {
    return {
      allowed: false,
      reason: 'Too many requests',
      statusCode: 429,
      retryAfter: Math.ceil((ipLimits.minute.resetAt - Date.now()) / 1000),
    }
  }
  const ipHour = incrementCounter(ipLimits.hour, 3_600_000)
  if (ipHour > 50) {
    return {
      allowed: false,
      reason: 'Too many requests',
      statusCode: 429,
      retryAfter: Math.ceil((ipLimits.hour.resetAt - Date.now()) / 1000),
    }
  }

  const uLimits = getOrCreateUserLimits(userId)
  const uMinute = incrementCounter(uLimits.minute, 60_000)
  if (uMinute > 20) {
    return {
      allowed: false,
      reason: 'Too many requests',
      statusCode: 429,
      retryAfter: Math.ceil((uLimits.minute.resetAt - Date.now()) / 1000),
    }
  }
  const uHour = incrementCounter(uLimits.hour, 3_600_000)
  if (uHour > 200) {
    return {
      allowed: false,
      reason: 'Too many requests',
      statusCode: 429,
      retryAfter: Math.ceil((uLimits.hour.resetAt - Date.now()) / 1000),
    }
  }
  const uDay = incrementCounter(uLimits.day, 86_400_000)
  if (uDay > 500) {
    return {
      allowed: false,
      reason: 'Too many requests',
      statusCode: 429,
      retryAfter: Math.ceil((uLimits.day.resetAt - Date.now()) / 1000),
    }
  }

  if (!checkGlobalPerSecond()) {
    return { allowed: false, reason: 'Too many requests', statusCode: 429, retryAfter: 1 }
  }

  if (activeConcurrent >= MAX_CONCURRENT) {
    return { allowed: false, reason: 'Too many requests', statusCode: 429, retryAfter: 5 }
  }

  const [dbUser, userCost, userLimit, globalCost] = await Promise.all([
    client.user.findUnique({
      where: { id: userId },
      select: { blockedUntil: true },
    }),
    getUserMonthlyUsageCost(userId),
    getUserPlanLimitUsd(userId),
    getGlobalMonthlyUsageCost(),
  ])

  if (dbUser?.blockedUntil && dbUser.blockedUntil > new Date()) {
    return { allowed: false, reason: 'Access denied', statusCode: 403 }
  }

  if (globalCost >= GLOBAL_BUDGET_USD) {
    const month = new Date().getMonth()
    if (globalBudgetAlertMonth !== month) {
      globalBudgetAlertMonth = month
      sendAdminAlert(
        'SendWise AI: Global Monthly AI Budget Exceeded',
        `
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Total cost this month:</strong> $${globalCost.toFixed(4)}</p>
          <p><strong>Budget limit:</strong> $${GLOBAL_BUDGET_USD.toFixed(2)}</p>
          <p><strong>Suggested action:</strong> Increase the budget in environment config or wait for the next billing month.</p>
        `
      )
    }
    return {
      allowed: false,
      reason: 'AI temporarily disabled due to system usage limit',
      statusCode: 503,
      code: 'SYSTEM_LIMIT',
    }
  }

  if (userCost >= userLimit) {
    return {
      allowed: false,
      reason: 'Monthly AI limit reached. Please upgrade your plan.',
      statusCode: 429,
      code: 'QUOTA_EXCEEDED',
    }
  }

  activeConcurrent++
  return { allowed: true }
}
