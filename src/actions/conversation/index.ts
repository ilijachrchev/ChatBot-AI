'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'


export const onToggleRealtime = async (id: string, state: boolean) => {
  try {
    const chatRoom = await client.chatRoom.update({
      where: {
        id,
      },
      data: {
        live: state,
      },
      select: {
        id: true,
        live: true,
      },
    })

    if (chatRoom) {
      const socketUrl = process.env.SOCKET_SERVER_URL || 'http://localhost:4000'

      await fetch(`${socketUrl}/api/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatroomId: id,
          event: 'mode-change',
          data: {
            mode: state,
          },
        }),
      })

      return {
        status: 200,
        message: chatRoom.live
          ? 'Realtime mode enabled'
          : 'Realtime mode disabled',
        chatRoom,
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onGetConversationMode = async (id: string) => {
  try {
    const mode = await client.chatRoom.findUnique({
      where: {
        id,
      },
      select: {
        live: true,
      },
    })
    console.log(mode)
    return mode
  } catch (error) {
    console.log(error)
  }
}

export const onGetDomainRealtimeStatus = async (domainId: string): Promise<boolean> => {
  try {
    const rows = await client.$queryRaw<Array<{ realtimeEnabled: boolean }>>`
      SELECT "realtimeEnabled" FROM "Domain" WHERE id = ${domainId}::uuid LIMIT 1
    `
    return rows[0]?.realtimeEnabled ?? true
  } catch (error) {
    console.log(error)
    return true
  }
}

export const onGetDomainChatRooms = async (id: string) => {
  try {
    const domains = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        customer: {
          select: {
            email: true,
            chatRoom: {
              orderBy: { updatedAt: 'desc' },
              select: {
                createdAt: true,
                id: true,
                starred: true,
                status: true,
                message: {
                  select: {
                    message: true,
                    createdAt: true,
                    seen: true,
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                  take: 1,
                },
              },
            },
          },
        },
      },
    })

    if (domains) {
      return domains
    }
  } catch (error) {
    console.log(error)
  }
}


export const onGetChatMessages = async (id: string) => {
  try {
    const room = await client.chatRoom.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        live: true,
        message: {
          select: {
            id: true,
            role: true,
            message: true,
            createdAt: true,
            seen: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

      return room
  } catch (error) {
    console.log(error)
  }
}

export const onViewUnReadMessages = async (id: string) => {
  try {
    await client.chatMessage.updateMany({
      where: {
        chatRoomId: id,
      },
      data: {
        seen: true,
      },
    })
  } catch (error) {
    console.log(error)
  }
}

export const onRealTimeChat = async (
  chatroomId: string,
  message: string,
  id: string,
  role: 'assistant' | 'user'
) => {
  try {
    const socketUrl = process.env.SOCKET_sERVER_URL || 'http://localhost:4000'

    const response = await fetch(`${socketUrl}/api/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatroomId,
        event: 'realtime-mode',
        data: {
          chat: {
            message,
            id,
            role,
          },
        },
      }),
    })
    if (!response.ok) {
      console.error('Failed to trigger Socket.IO event:', response.statusText)
    }
  } catch (error) {
    console.error('Error triggering Socket.IO event:', error)
  }
}

export const onOwnerSendMessage = async (
  chatroom: string,
  message: string,
  role: 'assistant' | 'user'
) => {
  try {
    const chat = await client.chatRoom.update({
      where: {
        id: chatroom,
      },
      data: {
        message: {
          create: {
            message,
            role,
            seen: false,
          },
        },
        updatedAt: new Date(),
      },
      select: {
        message: {
          select: {
            id: true,
            role: true,
            message: true,
            createdAt: true,
            seen: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

      return chat?.message?.[0] ?? null;
  } catch (error) {
    console.log(error)
  }
}

export const onToggleStarredChatRoom = async (chatRoomId: string, starred: boolean) => {
  try {
    await client.chatRoom.update({
      where: { id: chatRoomId },
      data: { starred },
    })
    return { status: 200, starred }
  } catch (error) {
    console.log(error)
  }
}

export const onUpdateChatRoomStatus = async (
  chatRoomId: string,
  status: 'OPEN' | 'RESOLVED' | 'PENDING'
) => {
  try {
    await client.chatRoom.update({
      where: { id: chatRoomId },
      data: { status },
    })
    return { status: 200, roomStatus: status }
  } catch (error) {
    console.log(error)
  }
}

export const onGetUnreadConversationCount = async () => {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) return { count: 0 }

    const user = await client.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { id: true },
    })
    if (!user) return { count: 0 }

    const domains = await client.domain.findMany({
      where: { userId: user.id },
      select: { id: true },
    })

    const domainIds = domains.map((d) => d.id)

    const chatRooms = await client.chatRoom.findMany({
      where: { domainId: { in: domainIds } },
      select: {
        message: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { seen: true, role: true },
        },
      },
    })

    const count = chatRooms.filter((room) => {
      const latest = room.message[0]
      return latest && !latest.seen && latest.role === 'user'
    }).length

    return { count }
  } catch (error) {
    console.log(error)
    return { count: 0 }
  }
}

export const onGetChatRoomInfo = async (id: string) => {
  try {
    const room = await client.chatRoom.findUnique({
      where: { id },
      select: {
        id: true,
        starred: true,
        status: true,
        createdAt: true,
        Customer: { select: { email: true } },
        Domain: { select: { name: true } },
      },
    })
    return room
  } catch (error) {
    console.log(error)
  }
}
