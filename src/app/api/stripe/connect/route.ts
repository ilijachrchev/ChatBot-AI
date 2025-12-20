import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await currentUser()

    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(process.env.STRIPE_SECRET!, {
      typescript: true,
    })

    const account = await stripe.accounts.create({
      type: 'standard',
    })

    if (account) {
      const approve = await client.user.update({
        where: {
          clerkId: user.id,
        },
        data: {
          stripeId: account.id,
        },
      })

      if (approve) {
        const accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: `${process.env.NEXT_PUBLIC_URL}/callback/stripe/refresh`,
          return_url: `${process.env.NEXT_PUBLIC_URL}/callback/stripe/success`,
          type: 'account_onboarding',
          collection_options: {
            fields: 'currently_due',
          },
        })

        return NextResponse.json({
          url: accountLink.url,
        })
      }
    }
  } catch (error) {
    console.error('Error creating Stripe account:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}