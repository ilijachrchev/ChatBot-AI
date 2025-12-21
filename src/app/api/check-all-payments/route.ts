import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
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

    const allPayments = await stripe.paymentIntents.list({
      limit: 20,
    })

    const paymentDetails = allPayments.data.map(payment => ({
      id: payment.id,
      amount: payment.amount / 100,
      status: payment.status,
      customer: payment.customer,
      created: new Date(payment.created * 1000).toISOString(),
      description: payment.description,
      metadata: payment.metadata,
    }))

    return NextResponse.json({
      total: allPayments.data.length,
      payments: paymentDetails,
      userEmail: user.emailAddresses[0]?.emailAddress,
    })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}