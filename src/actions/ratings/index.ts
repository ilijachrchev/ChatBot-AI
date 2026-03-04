'use server'

import { client as db } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export const onSubmitConversationRating = async (
  chatRoomId: string,
  domainId: string,
  rating: 'POSITIVE' | 'NEGATIVE',
  feedback?: string
) => {
  try {
    const existing = await db.conversationRating.findUnique({
      where: { chatRoomId },
      select: { id: true },
    })

    if (existing) {
      return { status: 409 }
    }

    await db.conversationRating.create({
      data: {
        chatRoomId,
        domainId,
        rating,
        feedback: feedback ?? null,
      },
    })

    return { status: 200, message: 'Rating submitted' }
  } catch {
    return { status: 500 }
  }
}

export const onGetDomainRatings = async (domainId: string) => {
  try {
    const ratings = await db.conversationRating.findMany({
      where: { domainId },
      select: {
        id: true,
        rating: true,
        feedback: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = ratings.length
    const positive = ratings.filter((r) => r.rating === 'POSITIVE').length
    const negative = total - positive
    const satisfactionRate = total > 0 ? Math.round((positive / total) * 100) : 0

    const recentFeedback = ratings
      .filter((r) => r.rating === 'NEGATIVE' && r.feedback)
      .slice(0, 10)
      .map((r) => ({ id: r.id, feedback: r.feedback!, createdAt: r.createdAt }))

    return { total, positive, negative, satisfactionRate, recentFeedback }
  } catch {
    return { total: 0, positive: 0, negative: 0, satisfactionRate: 0, recentFeedback: [] }
  }
}

export const onGetAllDomainsRatings = async () => {
  try {
    const user = await currentUser()
    if (!user) return { total: 0, positive: 0, negative: 0, satisfactionRate: 0, recentFeedback: [] }

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    })
    if (!dbUser) return { total: 0, positive: 0, negative: 0, satisfactionRate: 0, recentFeedback: [] }

    const domains = await db.domain.findMany({
      where: { userId: dbUser.id },
      select: { id: true },
    })

    const domainIds = domains.map((d) => d.id)
    if (domainIds.length === 0) {
      return { total: 0, positive: 0, negative: 0, satisfactionRate: 0, recentFeedback: [] }
    }

    const ratings = await db.conversationRating.findMany({
      where: { domainId: { in: domainIds } },
      select: {
        id: true,
        rating: true,
        feedback: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = ratings.length
    const positive = ratings.filter((r) => r.rating === 'POSITIVE').length
    const negative = total - positive
    const satisfactionRate = total > 0 ? Math.round((positive / total) * 100) : 0

    const recentFeedback = ratings
      .filter((r) => r.rating === 'NEGATIVE' && r.feedback)
      .slice(0, 10)
      .map((r) => ({ id: r.id, feedback: r.feedback!, createdAt: r.createdAt }))

    return { total, positive, negative, satisfactionRate, recentFeedback }
  } catch {
    return { total: 0, positive: 0, negative: 0, satisfactionRate: 0, recentFeedback: [] }
  }
}

export const onGetAllRatings = async () => {
  try {
    const user = await currentUser()
    if (!user) return []

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    })
    if (!dbUser) return []

    const domains = await db.domain.findMany({
      where: { userId: dbUser.id },
      select: { id: true, name: true },
    })

    const domainIds = domains.map((d) => d.id)
    const domainNameMap = new Map(domains.map((d) => [d.id, d.name]))

    if (domainIds.length === 0) return []

    const ratings = await db.conversationRating.findMany({
      where: { domainId: { in: domainIds } },
      select: {
        id: true,
        chatRoomId: true,
        domainId: true,
        rating: true,
        feedback: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return ratings.map((r) => ({
      ...r,
      domainName: domainNameMap.get(r.domainId) ?? 'Unknown',
    }))
  } catch {
    return []
  }
}

export const onGetNewFeedbackCount = async () => {
  try {
    const user = await currentUser()
    if (!user) return 0

    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    })
    if (!dbUser) return 0

    const domains = await db.domain.findMany({
      where: { userId: dbUser.id },
      select: { id: true },
    })

    const domainIds = domains.map((d) => d.id)
    if (domainIds.length === 0) return 0

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const count = await db.conversationRating.count({
      where: {
        domainId: { in: domainIds },
        rating: 'NEGATIVE',
        feedback: { not: null },
        createdAt: { gte: sevenDaysAgo },
      },
    })

    return count
  } catch {
    return 0
  }
}
