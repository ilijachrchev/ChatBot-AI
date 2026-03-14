import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { callOpenAIWithProtection, isError } from '@/lib/openai-client'

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { description } = await req.json()

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown'

    const result = await callOpenAIWithProtection({
      userId: user.id,
      ipAddress,
      systemPrompt:
        "You are an expert email copywriter. Write a professional, engaging marketing email body based on the user's description. Keep it under 200 words. Return only the email body text, no subject line.",
      messages: [{ role: 'user', content: description }],
    })

    if (isError(result)) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode })
    }

    return NextResponse.json({ text: result.content })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 })
  }
}
