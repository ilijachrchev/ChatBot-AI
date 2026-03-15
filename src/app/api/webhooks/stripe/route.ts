import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { client } from '@/lib/prisma'
import { Plans } from '@prisma/client'

function getPlanCredits(plan: string): number {
  const credits: Record<string, number> = {
    STANDARD: 10,
    PRO: 50,
    ULTIMATE: 500,
  }
  return credits[plan] ?? 10
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new NextResponse('Missing signature', { status: 400 })
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch {
    return new NextResponse('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as import('stripe').Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break
        const plan = ((sub.metadata?.plan as string) || 'STANDARD') as Plans
        const isActive =
          sub.status === 'active' || sub.status === 'trialing'
        const periodEnd = sub.items.data[0]?.current_period_end

        await client.billings.updateMany({
          where: { userId },
          data: {
            plan: isActive ? plan : 'STANDARD',
            credits: isActive
              ? getPlanCredits(plan)
              : getPlanCredits('STANDARD'),
            stripeSubscriptionId: sub.id,
            stripeCurrentPeriodEnd: periodEnd
              ? new Date(periodEnd * 1000)
              : null,
            status: sub.status,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
          },
        })
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as import('stripe').Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break
        await client.billings.updateMany({
          where: { userId },
          data: {
            plan: 'STANDARD',
            credits: getPlanCredits('STANDARD'),
            status: 'canceled',
            cancelAtPeriodEnd: false,
          },
        })
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice =
          event.data.object as import('stripe').Stripe.Invoice
        const subId = (invoice as any).subscription as string | null
        if (!subId) break
        const subscription =
          await stripe.subscriptions.retrieve(subId)
        const userId = subscription.metadata?.userId
        if (!userId) break
        const plan =
          (subscription.metadata?.plan as string) || 'STANDARD'
        await client.billings.updateMany({
          where: { userId },
          data: {
            credits: getPlanCredits(plan),
            status: 'active',
          },
        })
        break
      }

      case 'invoice.payment_failed': {
        const invoice =
          event.data.object as import('stripe').Stripe.Invoice
        const subId = (invoice as any).subscription as string | null
        if (!subId) break
        const subscription =
          await stripe.subscriptions.retrieve(subId)
        const userId = subscription.metadata?.userId
        if (!userId) break
        await client.billings.updateMany({
          where: { userId },
          data: { status: 'past_due' },
        })
        break
      }
    }
  } catch (err) {
    console.error('Stripe webhook processing error:', err)
    return new NextResponse('Processing error', { status: 500 })
  }

  return new NextResponse('OK', { status: 200 })
}
