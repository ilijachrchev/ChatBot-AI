import { client as db } from "@/lib/prisma"

const PLAN_LIMITS: Record<string, number | null> = {
  STANDARD: 10,
  PRO: 2000,
  ULTIMATE: null,
}

export const getConversationUsage = async (domainId: string) => {
  const now = new Date()
  const month = now.getMonth() + 1 // 1–12
  const year = now.getFullYear()

  const usage = await db.conversationUsage.upsert({
    where: { domainId_month_year: { domainId, month, year } },
    create: { domainId, month, year, count: 0 },
    update: {},
    select: { count: true, month: true, year: true, domainId: true },
  })

  return usage
}

export const checkAndIncrementConversation = async (
  domainId: string,
  plan: string
): Promise<{ allowed: true; count: number; limit: number | null } | { allowed: false; count: number; limit: number }> => {
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.STANDARD

  if (limit === null) {
    return { allowed: true, count: 0, limit: null }
  }

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const existing = await db.conversationUsage.findUnique({
    where: { domainId_month_year: { domainId, month, year } },
    select: { count: true },
  })

  const currentCount = existing?.count ?? 0

  if (currentCount >= limit) {
    return { allowed: false, count: currentCount, limit }
  }

  const updated = await db.conversationUsage.upsert({
    where: { domainId_month_year: { domainId, month, year } },
    create: { domainId, month, year, count: 1 },
    update: { count: { increment: 1 } },
    select: { count: true },
  })

  return { allowed: true, count: updated.count, limit }
}
