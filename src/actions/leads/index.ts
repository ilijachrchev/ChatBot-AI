'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export type LeadItem = {
  id: string
  email: string | null
  domainId: string
  domainName: string
  conversationCount: number
  lastMessage: string | null
  lastMessageDate: Date | null
  lastSeen: boolean
  firstSeen: Date | null
}

export const onGetAllLeads = async (): Promise<LeadItem[]> => {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) return []

    const user = await client.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { id: true },
    })
    if (!user) return []

    const domains = await client.domain.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        customer: {
          select: {
            id: true,
            email: true,
            chatRoom: {
              orderBy: { createdAt: 'asc' },
              select: {
                id: true,
                createdAt: true,
                message: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                  select: {
                    message: true,
                    createdAt: true,
                    seen: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    const leads: LeadItem[] = []

    for (const domain of domains) {
      for (const customer of domain.customer) {
        if (!customer.chatRoom.length) continue

        const sortedRooms = [...customer.chatRoom].sort((a, b) => {
          const aTime = a.message[0]?.createdAt?.getTime() ?? a.createdAt.getTime()
          const bTime = b.message[0]?.createdAt?.getTime() ?? b.createdAt.getTime()
          return bTime - aTime
        })

        const latestRoom = sortedRooms[0]
        const latestMsg = latestRoom.message[0]

        leads.push({
          id: customer.id,
          email: customer.email,
          domainId: domain.id,
          domainName: domain.name,
          conversationCount: customer.chatRoom.length,
          lastMessage: latestMsg?.message ?? null,
          lastMessageDate: latestMsg?.createdAt ?? null,
          lastSeen: latestMsg?.seen ?? true,
          firstSeen: customer.chatRoom[0]?.createdAt ?? null,
        })
      }
    }

    leads.sort((a, b) => {
      const aTime = a.lastMessageDate?.getTime() ?? 0
      const bTime = b.lastMessageDate?.getTime() ?? 0
      return bTime - aTime
    })

    return leads
  } catch (error) {
    console.log(error)
    return []
  }
}

export const onGetLeadCount = async (): Promise<number> => {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) return 0

    const user = await client.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { id: true },
    })
    if (!user) return 0

    const domains = await client.domain.findMany({
      where: { userId: user.id },
      select: { id: true },
    })

    const domainIds = domains.map((d) => d.id)

    const count = await client.customer.count({
      where: {
        domainId: { in: domainIds },
        chatRoom: { some: {} },
      },
    })

    return count
  } catch (error) {
    console.log(error)
    return 0
  }
}
