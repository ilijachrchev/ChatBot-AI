import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function requireAuth() {
  const authResult = await auth()
  const userId = authResult.userId

  if (!userId) {
    return {
      userId: null as string | null,
      user: null,
      response: new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    }
  }

  const user = await currentUser()

  if (!user) {
    return {
      userId: null as string | null,
      user: null,
      response: new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    }
  }

  return {
    userId,
    user,
    response: null as NextResponse | null,
  }
}
