"use server"

import { currentUser } from "@clerk/nextjs/server"
import { client as db } from "@/lib/prisma"

const PLAN_LIMITS: Record<string, number | null> = {
  STANDARD: 10,
  PRO: 2000,
  ULTIMATE: null,
}

export const onGetConversationUsage = async () => {
  const user = await currentUser()
  if (!user) return null

  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
    select: {
      subscription: { select: { plan: true } },
      domains: {
        select: {
          id: true,
          name: true,
          conversationUsage: {
            where: { month, year },
            select: { count: true },
          },
        },
      },
    },
  })

  if (!dbUser) return null

  const plan = (dbUser.subscription?.plan as string) ?? 'STANDARD'
  const totalLimit = PLAN_LIMITS[plan] ?? PLAN_LIMITS.STANDARD

  const domains = dbUser.domains.map((domain) => {
    const count = domain.conversationUsage[0]?.count ?? 0
    const limit = totalLimit
    const percentUsed = limit !== null ? Math.round((count / limit) * 100) : null

    return {
      domainId: domain.id,
      domainName: domain.name,
      count,
      limit,
      percentUsed,
    }
  })

  const totalCount = domains.reduce((sum, d) => sum + d.count, 0)

  return {
    plan: plan as 'STANDARD' | 'PRO' | 'ULTIMATE',
    totalLimit,
    domains,
    totalCount,
  }
}
