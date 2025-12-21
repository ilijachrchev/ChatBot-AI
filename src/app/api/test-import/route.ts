import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
})

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const profile = await client.user.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        fullname: true,
        stripeCustomerId: true,
      },
    })

    if (!profile?.stripeCustomerId) {
      return NextResponse.json({ 
        error: 'No Stripe customer found',
        stripeCustomerId: profile?.stripeCustomerId 
      })
    }

    console.log('Fetching payments for customer:', profile.stripeCustomerId)

    // Fetch payments from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      customer: profile.stripeCustomerId,
      limit: 10,
    })

    console.log('Found payments:', paymentIntents.data.length)

    // Import each payment
    const imported = []
    for (const payment of paymentIntents.data) {
      // Check if already exists
      const existing = await client.paymentHistory.findUnique({
        where: { stripePaymentIntentId: payment.id },
      })

      if (existing) {
        console.log('Payment already exists:', payment.id)
        continue
      }

      // Get payment method details
      let paymentMethod = null
      let paymentBrand = null

      if (payment.payment_method) {
        try {
          const pm = await stripe.paymentMethods.retrieve(
            payment.payment_method as string
          )
          paymentMethod = pm.card?.last4 || null
          paymentBrand = pm.card?.brand || null
        } catch (e) {
          console.error('Could not get payment method:', e)
        }
      }

      // Create payment history
      const created = await client.paymentHistory.create({
        data: {
          userId: profile.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          plan: payment.metadata?.plan as any || null,
          description: payment.description || 'Subscription Payment',
          stripePaymentIntentId: payment.id,
          paymentMethod: paymentMethod,
          paymentBrand: paymentBrand,
          createdAt: new Date(payment.created * 1000),
        },
      })

      imported.push({
        id: created.id,
        amount: created.amount,
        date: created.createdAt,
      })
    }

    return NextResponse.json({
      success: true,
      stripeCustomerId: profile.stripeCustomerId,
      totalPayments: paymentIntents.data.length,
      imported: imported.length,
      payments: imported,
    })
  } catch (error: any) {
    console.error('Error importing payments:', error)
    return NextResponse.json({ 
      error: error.message,
      details: error 
    }, { status: 500 })
  }
}
