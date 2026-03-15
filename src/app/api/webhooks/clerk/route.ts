import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { client } from '@/lib/prisma'

const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const headersList = await headers()
  const svix_id = headersList.get('svix-id')
  const svix_timestamp = headersList.get('svix-timestamp')
  const svix_signature = headersList.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const payload = await req.text()
  const wh = new Webhook(CLERK_WEBHOOK_SECRET)

  let event: { type: string; data: Record<string, unknown> }
  try {
    event = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as typeof event
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type === 'user.deleted') {
    const clerkId = event.data.id as string
    if (!clerkId) return new Response('Missing id', { status: 400 })
    await client.user.deleteMany({ where: { clerkId } })
  }

  if (event.type === 'user.updated') {
    const clerkId = event.data.id as string
    const firstName = event.data.first_name as string | null
    const lastName = event.data.last_name as string | null
    const fullname = [firstName, lastName]
      .filter(Boolean)
      .join(' ')
      .trim()
    if (fullname) {
      await client.user.updateMany({
        where: { clerkId },
        data: { fullname },
      })
    }
  }

  return new Response('OK', { status: 200 })
}
