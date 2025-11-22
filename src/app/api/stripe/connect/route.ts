import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
})

export async function GET() {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const existingUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (existingUser?.stripeId) {
      const accountLink = await stripe.accountLinks.create({
        account: existingUser.stripeId,
        refresh_url: 'http://localhost:3000/callback/stripe/refresh',
        return_url: 'http://localhost:3000/callback/stripe/success',
        type: 'account_onboarding',
      })

      return NextResponse.json({ url: accountLink.url })
    }

    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US',
      email: user.emailAddresses[0]?.emailAddress,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    })

    console.log('✅ Stripe Express account created:', account.id)

    await client.user.update({
      where: { clerkId: user.id },
      data: { stripeId: account.id },
    })

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: 'http://localhost:3000/callback/stripe/refresh',
      return_url: 'http://localhost:3000/callback/stripe/success',
      type: 'account_onboarding',
    })

    return NextResponse.json({ 
      url: accountLink.url,
      accountId: account.id 
    })

  } catch (error: any) {
    console.error('Stripe Connect error:', error)
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create Connect account',
        type: error.type 
      },
      { status: 400 }
    )
  }
}