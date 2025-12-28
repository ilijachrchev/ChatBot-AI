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
    console.log('1. Starting subscription creation for plan:', plan)
    const user = await currentUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    
    if (plan === 'STANDARD') {
      return { success: false, message: 'Cannot create subscription for free plan' }
    }
    
    if (!PRICE_IDS[plan]) {
      return {
        success: false,
        message: `Price ID not configured for ${plan} plan.`,
      }
    }
    
    const profile = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true, stripeCustomerId: true, subscription: true },
    })
    
    if (!profile) return { success: false, message: 'User profile not found' }
    
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

    console.log('2. Creating subscription with payment_behavior: default_incomplete')

    // Create subscription in incomplete state
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: PRICE_IDS[plan] }],
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription',
      },
      expand: ['latest_invoice', 'pending_setup_intent'],
      metadata: {
        userId: profile.id,
        plan,
      },
    })

    console.log('3. Subscription created:', subscription.id)
    console.log('3a. Subscription status:', subscription.status)

    let clientSecret: string | null = null

    // Check for pending_setup_intent first (for $0 trials or when payment_behavior is default_incomplete)
    if (subscription.pending_setup_intent) {
      const setupIntent = subscription.pending_setup_intent
      if (typeof setupIntent === 'string') {
        const si = await stripe.setupIntents.retrieve(setupIntent)
        clientSecret = si.client_secret
        console.log('4a. Using setup intent client secret')
      } else if (setupIntent.client_secret) {
        clientSecret = setupIntent.client_secret
        console.log('4b. Using expanded setup intent client secret')
      }
    }

    // If no setup intent, check for payment intent on the invoice
    if (!clientSecret && subscription.latest_invoice) {
      const latestInvoice = subscription.latest_invoice
      let invoiceObject: any = latestInvoice

      if (typeof latestInvoice === 'string') {
        invoiceObject = await stripe.invoices.retrieve(latestInvoice, {
          expand: ['payment_intent'],
        })
      }

      if (invoiceObject.payment_intent) {
        const paymentIntent = invoiceObject.payment_intent
        if (typeof paymentIntent === 'string') {
          const pi = await stripe.paymentIntents.retrieve(paymentIntent)
          clientSecret = pi.client_secret
          console.log('4c. Using payment intent client secret')
        } else if (paymentIntent.client_secret) {
          clientSecret = paymentIntent.client_secret
          console.log('4d. Using expanded payment intent client secret')
        }
      }
    }

    // If still no client secret, manually create a setup intent
    if (!clientSecret) {
      console.log('4e. No intent found, creating setup intent manually')
      const setupIntent = await stripe.setupIntents.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        usage: 'off_session',
        metadata: {
          subscription_id: subscription.id,
          plan,
          userId: profile.id,
        },
      })
      clientSecret = setupIntent.client_secret
      console.log('4f. Manual setup intent created:', setupIntent.id)
    }

    console.log('5. Client secret obtained:', !!clientSecret)

    if (!clientSecret) {
      return {
        success: false,
        message: 'Failed to create payment setup for subscription',
      }
    }

    // Store subscription in incomplete state
    const credits = getPlanCredits(plan)
    const currentPeriodEnd = getSubscriptionPeriodEndUnix(subscription)
    
    if (!currentPeriodEnd) {
      return { success: false, message: 'Missing subscription period end' }
    }

    await client.billings.upsert({
      where: { userId: profile.id },
      create: {
        userId: profile.id,
        plan,
        credits,
        stripeSubscriptionId: subscription.id,
        stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
        stripePriceId: PRICE_IDS[plan],
        stripeCustomerId: stripeCustomerId,
        status: subscription.status,
      },
      update: {
        plan,
        credits,
        stripeSubscriptionId: subscription.id,
        stripeCurrentPeriodEnd: new Date(currentPeriodEnd * 1000),
        stripePriceId: PRICE_IDS[plan],
        status: subscription.status,
      },
    })

    console.log('6. SUCCESS - subscription created in incomplete state')

    return {
      success: true,
      subscriptionId: subscription.id,
      clientSecret: clientSecret,
    }
  } catch (error: any) {
    console.error('SUBSCRIPTION ERROR:', error)
    return { success: false, message: error?.message || 'Unknown error' }
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