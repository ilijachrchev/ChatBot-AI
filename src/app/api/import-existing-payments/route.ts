import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { client } from '@/lib/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
})

async function importPayments() {
  const user = await currentUser()
  if (!user) {
    return { error: 'Unauthorized', status: 401 }
  }

  const profile = await client.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true, fullname: true },
  })

  if (!profile) {
    return { error: 'User not found', status: 404 }
  }

  const allPayments = await stripe.paymentIntents.list({
    limit: 100,
  })

  const successfulPayments = allPayments.data.filter(
    payment => payment.status === 'succeeded'
  )

  console.log(`Found ${successfulPayments.length} successful payments`)

  const imported = []
  const skipped = []

  for (const payment of successfulPayments) {
    const existing = await client.paymentHistory.findUnique({
      where: { stripePaymentIntentId: payment.id },
    })

    if (existing) {
      console.log('Skipping existing payment:', payment.id)
      skipped.push(payment.id)
      continue
    }

    let plan = null
    if (payment.amount === 1500) plan = 'PRO'
    else if (payment.amount === 3500) plan = 'ULTIMATE'

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
        console.error('Could not get payment method for', payment.id)
      }
    }

    console.log('Creating payment history for:', payment.id)

    const created = await client.paymentHistory.create({
      data: {
        userId: profile.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        plan: plan as any,
        description: plan ? `${plan} Plan Subscription` : 'Payment',
        stripePaymentIntentId: payment.id,
        paymentMethod: paymentMethod,
        paymentBrand: paymentBrand,
        createdAt: new Date(payment.created * 1000),
      },
    })

    console.log('Created payment history:', created.id)

    imported.push({
      id: created.id,
      paymentIntentId: payment.id,
      amount: created.amount / 100,
      plan: created.plan,
      date: created.createdAt,
    })
  }

  return {
    success: true,
    totalFound: successfulPayments.length,
    imported: imported.length,
    skipped: skipped.length,
    payments: imported,
    status: 200,
  }
}

export async function GET() {
  try {
    const result = await importPayments()
    return NextResponse.json(result, { status: result.status || 200 })
  } catch (error: any) {
    console.error('Error in GET:', error)
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
  }
}

export async function POST() {
  try {
    const result = await importPayments()
    return NextResponse.json(result, { status: result.status || 200 })
  } catch (error: any) {
    console.error('Error in POST:', error)
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
  }
}