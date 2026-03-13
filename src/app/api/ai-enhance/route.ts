import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { currentUser } from '@clerk/nextjs/server'

const openai = new OpenAI()

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { description } = await req.json()

    if (!description?.trim()) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert email copywriter. Write a professional, engaging marketing email body based on the user\'s description. Keep it under 200 words. Return only the email body text, no subject line.',
        },
        {
          role: 'user',
          content: description,
        },
      ],
    })

    return NextResponse.json({ text: completion.choices[0].message.content })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate email' }, { status: 500 })
  }
}
