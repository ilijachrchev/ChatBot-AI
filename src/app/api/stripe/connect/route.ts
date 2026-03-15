import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const profile = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { stripeId: true },
    })

    let accountId = profile?.stripeId

    if (!accountId) {
      const account = await stripe.accounts.create({ type: 'standard' })
      accountId = account.id
      await client.user.update({
        where: { clerkId: user.id },
        data: { stripeId: accountId },
      })
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/callback/stripe/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/callback/stripe/success`,
      type: 'account_onboarding',
      collection_options: {
        fields: 'currently_due',
      },
    })

    return NextResponse.json({ url: accountLink.url })
  } catch (error) {
    console.error('Error creating Stripe account:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}