import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../../../_utils'
import { client } from '@/lib/prisma'

type Params = {
  params: { chatroomId: string }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { response } = await requireAuth()
  if (response) return response

  const { chatroomId } = params

  if (!chatroomId) {
    return NextResponse.json(
      { error: 'chatroomId is required' },
      { status: 400 }
    )
  }

  try {
    const room = await client.chatRoom.findUnique({
      where: { id: chatroomId },
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
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      )
    }

    await client.chatMessage.updateMany({
      where: {
        chatRoomId: chatroomId,
      },
      data: {
        seen: true,
      },
    })

    return NextResponse.json({
      id: room.id,
      live: room.live,
      messages: room.message.map((m) => ({
        id: m.id,
        role: m.role,
        text: m.message,
        createdAt: m.createdAt,
        seen: m.seen,
      })),
    })
  } catch (error) {
    console.error('[MOBILE_MESSAGES_GET]', error)
    return NextResponse.json(
      { error: 'Failed to load messages' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { user, response } = await requireAuth()
  if (response) return response

  const { chatroomId } = params
  if (!chatroomId) {
    return NextResponse.json(
      { error: 'chatroomId is required' },
      { status: 400 }
    )
  }

  const body = await req.json().catch(() => null)
  const text: string | undefined = body?.text

  if (!text || !text.trim()) {
    return NextResponse.json(
      { error: 'text is required' },
      { status: 400 }
    )
  }

  try {
    const updated = await client.chatRoom.update({
      where: { id: chatroomId },
      data: {
        message: {
          create: {
            message: text,
            role: 'assistant', 
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
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    const newMessage = updated.message[0]

    if (!newMessage) {
      return NextResponse.json(
        { error: 'Failed to retrieve created message' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        id: newMessage.id,
        conversationId: chatroomId,
        role: newMessage.role,
        text: newMessage.message,
        createdAt: newMessage.createdAt,
        seen: newMessage.seen,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[MOBILE_MESSAGES_POST]', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
