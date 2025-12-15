import { NextRequest, NextResponse } from 'next/server'
import { onGetChatbotPresence } from '@/actions/chatbot/presence'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const domainId = searchParams.get('domainId')

    if (!domainId) {
      return NextResponse.json(
        { error: 'Domain ID is required' },
        { status: 400 }
      )
    }

    const presence = await onGetChatbotPresence(domainId)

    if (!presence) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ presence })
  } catch (error) {
    console.error('Error in presence API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}