'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { PRICING_CONFIG, type PlanType } from '@/lib/pricing-config'
import Stripe from 'stripe'
import { de } from 'date-fns/locale'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
  apiVersion: '2025-10-29.clover',
})

export const onGetBillingInfo = async () => {
  try {
    const user = await currentUser()
    if (!user) return null

    const profile = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        fullname: true,
        subscription: {
          select: {
            plan: true,
            credits: true,
          },
        },
        stripeId: true,
        billingAddress: true,
      },
    })

    if (!profile) return null

    const plan = (profile.subscription?.plan || 'STANDARD') as PlanType
    const planDetails = PRICING_CONFIG[plan]

    let stripeBillingInfo = null
    if (profile.stripeId) {
      try {
        const customer = await stripe.customers.retrieve(profile.stripeId)
        if (customer && !customer.deleted) {
          stripeBillingInfo = {
            name: customer.name || profile.fullname,
            email: customer.email || user.emailAddresses[0]?.emailAddress,
            address: customer.address ? {
              street: customer.address.line1,
              city: customer.address.city,
              state: customer.address.state,
              country: customer.address.country,
              zipCode: customer.address.postal_code,
            } : null,
          }
        }
      } catch (error) {
        console.error('Error fetching Stripe customer:', error)
      }
    }

    return {
      userId: profile.id,
      fullname: profile.fullname,
      currentPlan: plan,
      credits: profile.subscription?.credits || 0,
      planDetails,
      stripeId: profile.stripeId,
      billingAddress: profile.billingAddress || stripeBillingInfo?.address || null,
      stripeBillingInfo,
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

export const onGetPaymentMethods = async () => {
  try {
    const user = await currentUser()
    if (!user) return []

    const profile = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        stripeId: true,
      },
    })

    if (!profile?.stripeId) {
      return { 
        success: true,
        methods: [],
        defaultPaymentMethodId: null
      }
    }

    const customer = await stripe.customers.retrieve(profile.stripeId) 
    const defaultPaymentMethodId = customer.deleted 
        ? null
        : (customer.invoice_settings.default_payment_method as string | null)

    const paymentMethods = await stripe.paymentMethods.list({
      customer: profile.stripeId,
      type: 'card',
    })

    const methods = paymentMethods.data.map((pm) => ({
      id: pm.id,
      brand: pm.card?.brand || 'card',
      last4: pm.card?.last4 || '****',
      expMonth: pm.card?.exp_month || 0,
      expYear: pm.card?.exp_year || 0,
      isDefault: false,
    }))

    return {
      success: true,
      methods,
      defaultPaymentMethodId,
    }
  } catch (error) {
    console.log(error)
    return {
      success: false,
      methods: [],
      defaultPaymentMethodId: null
    }
  }
}

export const onSetDefaultPaymentMethod = async (paymentMethodId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const profile = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        stripeId: true,
      },
    })

    if (!profile?.stripeId) {
      return { success: false, message: 'Stripe customer not found' }
    }

    await stripe.customers.update(profile.stripeId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    return { success: true, message: 'Default payment method updated successfully' }
  } catch (error) {
    console.log(error)
    return { success: false, message: 'Failed to update default payment method' }
  }
}

export const onDeletePaymentMethod = async (paymentMethodId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { success: false, message: 'Unauthorized' }
    const profile = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        stripeId: true,
      },
    })

    if (!profile?.stripeId) {
      return { success: false, message: 'Stripe customer not found' }
    }

    await stripe.paymentMethods.detach(paymentMethodId)

    return { success: true, message: 'Payment method deleted successfully' }
} catch (error) {
    console.log(error)
    return { success: false, message: 'Failed to delete payment method' }
  }
}

export const onCreateSetupIntent = async () => {
  try {
    const user = await currentUser()
    if (!user) return { success: false, clientSecret: null }
    const profile = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        stripeId: true,
      },
    })
    let stripeId = profile?.stripeId

    if (!stripeId) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0]?.emailAddress || undefined,
        name: user.fullName || 'User',
        metadata: {
          clerkId: user.id,
        },
      })
      stripeId = customer.id

      await client.user.update({
        where: {
          clerkId: user.id,
        },
        data: {
          stripeId: stripeId,
        },
      })
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeId,
      payment_method_types: ['card'],
    })

    return { success: true, clientSecret: setupIntent.client_secret }
  } catch (error) {
    console.log(error)
    return { success: false, clientSecret: null }
  }
}


export const onUpdateBillingAddress = async (data: {
  name: string
  street?: string
  city?: string
  state?: string
  country?: string
  zipCode?: string
  vatNumber?: string
}) => {
  try {
    const user = await currentUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    const profile = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        stripeId: true,
        billingAddress: true,
      },
    })

    if (!profile) return { success: false, message: 'User not found' }

    const billingAddress = await client.billingAddress.upsert({
      where: {
        userId: profile.id,
      },
      create: {
        userId: profile.id,
        name: data.name,
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode,
        vatNumber: data.vatNumber,
      },
      update: {
        name: data.name,
        street: data.street,
        city: data.city,
        state: data.state,
        country: data.country,
        zipCode: data.zipCode,
        vatNumber: data.vatNumber,
      },
    })

    if (profile.stripeId) {
      try {
        await stripe.customers.update(profile.stripeId, {
          name: data.name,
          address: {
            line1: data.street || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || '',
            postal_code: data.zipCode || '',
          },
        })
      } catch (error) {
        console.error('Error updating Stripe customer:', error)
      }
    }

    return { success: true, message: 'Billing address updated successfully' }
  } catch (error) {
    console.log(error)
    return { success: false, message: 'Failed to update billing address' }
  }
}