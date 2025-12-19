"use server"
import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { getPlanPrice, getPlanCredits, type PlanType } from '@/lib/pricing-config' 

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    typescript: true,
    apiVersion: '2025-10-29.clover',
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
    const amount = getPlanPrice(plan)
    
    const paymentIntent = await stripe.paymentIntents.create({
      currency: 'usd',
      amount: amount,
      automatic_payment_methods: {
        enabled: true,
      },
    })
    
    if (paymentIntent) {
      return { secret: paymentIntent.client_secret }
    }
  } catch (error) {
    console.log(error)
  }
}