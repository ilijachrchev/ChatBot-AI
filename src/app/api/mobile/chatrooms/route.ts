import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '../_utils'
import { client } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { response } = await requireAuth()
  if (response) return response

  const url = new URL(req.url)
  const domainId = url.searchParams.get('domainId')

  if (!domainId) {
    return NextResponse.json(
      { error: 'domainId query param is required' },
      { status: 400 }
    )
  }

  try {
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: {
        customer: {
          select: {
            email: true,
            chatRoom: {
              orderBy: { updatedAt: 'desc' },
              select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                message: {
                  select: {
                    message: true,
                    createdAt: true,
                    seen: true,
                  },
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                },
              },
            },
          },
        },
      },
    })

    if (!domain || !domain.customer) {
      return NextResponse.json(
        { items: [], customerEmail: null },
        { status: 200 }
      )
    }

    const rawCustomer: any = (domain as any).customer
    const customers: any[] = Array.isArray(rawCustomer)
      ? rawCustomer
      : rawCustomer
      ? [rawCustomer]
      : []

    if (customers.length === 0) {
      return NextResponse.json(
        { items: [], customerEmail: null },
        { status: 200 }
      )
    }

    const mainCustomer = customers[0]

    const customerEmail: string | null = mainCustomer.email ?? null
    const rawRooms: any[] = mainCustomer.chatRoom ?? []

    const items = rawRooms.map((room) => {
      const last = (room.message && room.message[0]) || null
      return {
        id: room.id as string,
        createdAt: room.createdAt as Date,
        updatedAt: room.updatedAt as Date,
        lastMessagePreview: last?.message ?? null,
        lastMessageAt: last?.createdAt ?? null,
        lastMessageSeen: last?.seen ?? false,
      }
    })

    return NextResponse.json({
      customerEmail,
      items,
    })
  } catch (error: any) {
    console.error('[MOBILE_CHATROOMS_GET]', error)

    return NextResponse.json(
      {
        error: 'Failed to load chat rooms',
        details: error?.message ?? String(error),
      },
      { status: 500 }
    )
  }
}
