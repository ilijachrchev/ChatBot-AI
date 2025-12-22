"use server"
import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import Stripe from 'stripe'
import { getPlanPrice, getPlanCredits, type PlanType } from '@/lib/pricing-config'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
    typescript: true,
})

const PRICE_IDS = {
  PRO: process.env.STRIPE_PRO_PRICE_ID!,
  ULTIMATE: process.env.STRIPE_ULTIMATE_PRICE_ID!,
}

function getSubscriptionPeriodEndUnix(sub: Stripe.Subscription): number | null {
  const ends = 
    sub.items?.data
      ?.map((item) => item.current_period_end)
      .filter((v): v is number => typeof v === "number") ?? []

  if (ends.length === 0) return null
  return Math.max(...ends)
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
    if (!user) return { success: false, message: "Unauthorized" }

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
    const paymentIntent = (invoice as any)?.payment_intent as Stripe.PaymentIntent | undefined

    if (!paymentIntent?.client_secret) {
      return {
        success: false,
        message: 'Failed to create payment intent'
      }
    }

    const credits = getPlanCredits(plan)
    const currentPeriodEnd = getSubscriptionPeriodEndUnix(subscription)
    if (!currentPeriodEnd) {
      return { success: false, message: "Missing subscription period end" }
    }

    await client.billings.upsert({
      where: { userId: profile.id },
      create: {
        userId: profile.id,
        plan: plan,
        credits: credits,
        stripeSubscriptionId: subscription.id,
        stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
        stripePriceId: PRICE_IDS[plan],
        stripeCustomerId: stripeCustomerId,
        status: subscription.status,
      },
      update: {
        plan: plan,
        credits: credits,
        stripeSubscriptionId: subscription.id,
        stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
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

export const onCancelSubscription = async () => {
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
            plan: true,
          },
        },
      },
    })

    if (!profile?.subscription?.stripeSubscriptionId) {
      return { success: false, message: 'No active subscription found' }
    }

    const updatedSubscription = await stripe.subscriptions.update(
      profile.subscription.stripeSubscriptionId,
      {
        cancel_at_period_end: true,
      }
    )

    // Update database
    await client.billings.update({
      where: { userId: profile.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
        status: 'canceled',
      },
    })

    const subscriptionData = updatedSubscription as unknown as Stripe.Subscription
    const currentPeriodEnd = getSubscriptionPeriodEndUnix(updatedSubscription)
    const periodEndDate = currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null

    return {
      success: true,
      message: periodEndDate
        ? `Subscription canceled. You'll have access until ${periodEndDate.toLocaleDateString()}`
        : "Subscription canceled.",
      periodEnd: periodEndDate,
    }
  } catch (error: any) {
    console.error('Error canceling subscription:', error)
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
    const result = await onCreateSubscription(plan)
    if (result.success && result.clientSecret) {
      return { secret: result.clientSecret }
    }
    return null
  } catch (error) {
    console.log(error)
    return null
  }
}