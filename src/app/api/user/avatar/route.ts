import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ avatar: null }, { status: 401 })
    }

    const profile = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        avatar: true,
      },
    })

    return NextResponse.json({ avatar: profile?.avatar || null })
  } catch (error) {
    console.error('Error fetching avatar:', error)
    return NextResponse.json({ avatar: null }, { status: 500 })
  }
}