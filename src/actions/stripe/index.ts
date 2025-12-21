"use server"
import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { getPlanPrice, getPlanCredits, type PlanType } from '@/lib/pricing-config' 

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    typescript: true,
})

export const onCreateCustomerPaymentIntentSecret = async (
    amount: number,
    stripeId: string
) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create(
            {
                currency: 'usd',
                amount: amount * 100,
                automatic_payment_methods: {
                    enabled: true,
                },
            },
        )
        if (paymentIntent) {
            return {
                secret: paymentIntent.client_secret
            }
        } 
    } catch (error) {
        console.log(error)
    }
}

export const onUpdateSubscription = async (
  plan: PlanType
) => {
  try {
    const user = await currentUser()
    if (!user) return
    
    const credits = getPlanCredits(plan)
    
    const update = await client.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        subscription: {
          update: {
            data: {
              plan,
              credits,
            },
          },
        },
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    })
    
    if (update) {
      return {
        status: 200,
        message: 'subscription updated',
        plan: update.subscription?.plan,
      }
    }
  } catch (error) {
    console.log(error)
  }
}

export const onGetStripeClientSecret = async (
  plan: PlanType
) => {
  try {
    const user = await currentUser()
    if (!user) return null

    const profile = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { 
        id: true,
        stripeCustomerId: true 
      },
    })

    let stripeCustomerId = profile?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0]?.emailAddress,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || 'User',
        metadata: {
          clerkId: user.id,
        },
      })

      stripeCustomerId = customer.id

      await client.user.update({
        where: { clerkId: user.id },
        data: { stripeCustomerId: customer.id },
      })
    }

    const amount = getPlanPrice(plan)
    
    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'usd',
      amount: amount,
      customer: stripeCustomerId, 
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: { 
        plan: plan,
        userId: profile?.id || '',
      },
    })
    
    if (paymentIntent) {
      return { secret: paymentIntent.client_secret }
    }
  } catch (error) {
    console.log(error)
  }
}