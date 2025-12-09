import { NextResponse } from 'next/server'
import { requireAuth } from '../_utils'

export async function GET() {
  const { user, response } = await requireAuth()

  if (response) return response

  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress ?? null

  return NextResponse.json({
    id: user!.id,
    name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim(),
    email: primaryEmail,
    avatarUrl: user?.imageUrl ?? null,
  })
}
