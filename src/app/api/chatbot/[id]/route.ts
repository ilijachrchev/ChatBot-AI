import { NextRequest, NextResponse } from 'next/server'
import { client } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const bot = await client.chatBot.findUnique({
      where: { id },
      select: {
        id: true,
        welcomeMessage: true,
        icon: true,
        backgroundColor: true,
      },
    })

    if (!bot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(bot, { status: 200 })
  } catch (err) {
    console.error('Error fetching chatbot config:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
