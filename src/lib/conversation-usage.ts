import { client as db } from "@/lib/prisma"
import { onCreateNotification } from "@/actions/notifications"

const PLAN_LIMITS: Record<string, number | null> = {
  STANDARD: 10,
  PRO: 2000,
  ULTIMATE: null,
}

export const getConversationUsage = async (domainId: string) => {
  const now = new Date()
  const month = now.getMonth() + 1
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
  plan: string,
  options?: { userId?: string; domainName?: string }
): Promise<{ allowed: true; count: number; limit: number | null } | { allowed: false; count: number; limit: number }> => {
  const limit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.STANDARD

  if (limit === null) {
    return { allowed: true, count: 0, limit: null }
  }

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const result = await db.conversationUsage.updateMany({
    where: {
      domainId,
      month,
      year,
      count: { lt: limit },
    },
    data: { count: { increment: 1 } },
  })

  if (result.count === 0) {
    try {
      await db.conversationUsage.create({
        data: { domainId, month, year, count: 1 },
      })
      return { allowed: true, count: 1, limit }
    } catch {
      const current = await db.conversationUsage.findUnique({
        where: { domainId_month_year: { domainId, month, year } },
        select: { count: true },
      })
      return {
        allowed: false,
        count: current?.count ?? limit,
        limit,
      }
    }
  }

  return { allowed: true, count: result.count, limit }
}
