import { client } from '@/lib/prisma'
import { Plans } from '@prisma/client'

export const GLOBAL_BUDGET_USD = 50.0

export const PLAN_LIMITS_USD: Record<Plans, number> = {
  STANDARD: 1.0,
  PRO: 20.0,
  ULTIMATE: 100.0,
}

function startOfCurrentMonth(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1)
}

export async function getUserMonthlyUsageCost(userId: string): Promise<number> {
  const result = await client.aIUsageLog.aggregate({
    where: {
      userId,
      blocked: false,
      createdAt: { gte: startOfCurrentMonth() },
    },
    _sum: { estimatedCostUsd: true },
  })
  return result._sum.estimatedCostUsd ?? 0
}

export async function getGlobalMonthlyUsageCost(): Promise<number> {
  const result = await client.aIUsageLog.aggregate({
    where: {
      blocked: false,
      createdAt: { gte: startOfCurrentMonth() },
    },
    _sum: { estimatedCostUsd: true },
  })
  return result._sum.estimatedCostUsd ?? 0
}

export async function getUserPlanLimitUsd(userId: string): Promise<number> {
  const user = await client.user.findUnique({
    where: { id: userId },
    select: { subscription: { select: { plan: true } } },
  })
  const plan = user?.subscription?.plan ?? Plans.STANDARD
  return PLAN_LIMITS_USD[plan]
}

export async function getUserTokensInWindow(
  userId: string,
  windowMs: number
): Promise<number> {
  const since = new Date(Date.now() - windowMs)
  const result = await client.aIUsageLog.aggregate({
    where: {
      userId,
      blocked: false,
      createdAt: { gte: since },
    },
    _sum: { totalTokens: true },
  })
  return result._sum.totalTokens ?? 0
}

export async function getGlobalTokensInWindow(windowMs: number): Promise<number> {
  const since = new Date(Date.now() - windowMs)
  const result = await client.aIUsageLog.aggregate({
    where: {
      blocked: false,
      createdAt: { gte: since },
    },
    _sum: { totalTokens: true },
  })
  return result._sum.totalTokens ?? 0
}
