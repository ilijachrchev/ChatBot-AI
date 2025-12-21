"use server"
import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { getPlanPrice, getPlanCredits, type PlanType } from '@/lib/pricing-config' 
import { success } from 'zod'
import { profileEnd } from 'console'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    typescript: true,
})

const PRICE_IDS = {
  PRO: process.env.STRIPE_PRO_PRICE_ID!,
  ULTIMATE: process.env.STRIPE_ULTIMATE_PRICE_ID!,
}

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

export const onCreateSubscription = async (plan: PlanType) => {
  try {
    const user = await currentUser()
    if (!user) return {success: false, message: "Unauthorized" }

    if (plan === 'STANDARD') {
      return {
        success: false,
        message: 'Cannot create subscription for free plan'
      }
    }

      const profile = await client.user.findUnique({
        where: { clerkId: user.id },
        select: { 
          id: true,
          stripeCustomerId: true,
          subscription: true, 
        },
      })  

      if (!profile) return { success: false, message: "User profile not found" }

      let stripeCustomerId = profile.stripeCustomerId

      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: user.emailAddresses[0]?.emailAddress,
          name: user.firstName && user.lastName 
            ? `${user.firstName} ${user.lastName}` 
            : user.firstName || 'User',
          metadata: {
            clerkId: user.id,
            userId: profile.id,
          },
        })

        stripeCustomerId = customer.id

        await client.user.update({
          where: { clerkId: user.id },
          data: { stripeCustomerId: customer.id },
        })
      }

      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: PRICE_IDS[plan] }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          userId: profile.id,
          plan: plan,
        },
      })
      
      const invoice = subscription.latest_invoice as Stripe.Invoice | null
      const paymentIntent =
       invoice && typeof invoice.payment_intent !== "string"
        ? invoice.payment_intent as Stripe.PaymentIntent
        : null

      const credits = getPlanCredits(plan)

    await client.billings.upsert({
      where: { userId: profile.id },
      create: {
        userId: profile.id,
        plan: plan,
        credits: credits,
        stripeSubscriptionId: subscription.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripePriceId: PRICE_IDS[plan],
        stripeCustomerId: stripeCustomerId,
        status: subscription.status,
      },
      update: {
        plan: plan,
        credits: credits,
        stripeSubscriptionId: subscription.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripePriceId: PRICE_IDS[plan],
        status: subscription.status,
      },
    })

    return {
      success: true,
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret,
    }
  } catch (error: any) {
    console.error('Error creating subscription:', error)
    return { success: false, message: error.message }
  }
}

export const onReactivateSubscription = async () => {
  try {
    const user = await currentUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    const profile = await client.user.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        subscription: {
          select: {
            stripeSubscriptionId: true,
          },
        },
      },
    })

    if (!profile?.subscription?.stripeSubscriptionId) {
      return { success: false, message: 'No subscription found' }
    }

    await stripe.subscriptions.update(
      profile.subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
      }
    )

    await client.billings.update({
      where: { userId: profile.id },
      data: {
        cancelAtPeriodEnd: false,
        status: 'active',
      },
    })

    return {
      success: true,
      message: 'Subscription reactivated successfully!',
    }
  } catch (error: any) {
    console.error('Error reactivating subscription:', error)
    return { success: false, message: error.message }
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