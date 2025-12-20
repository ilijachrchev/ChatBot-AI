'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { PRICING_CONFIG, type PlanType } from '@/lib/pricing-config'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
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

    const formattedBillingAddress = profile.billingAddress ? {
      name: profile.billingAddress.name,
      street: profile.billingAddress.street,
      city: profile.billingAddress.city,
      state: profile.billingAddress.state,
      country: profile.billingAddress.country,
      zipCode: profile.billingAddress.zipCode,
      vatNumber: profile.billingAddress.vatNumber,
    } : null

    return {
      userId: profile.id,
      fullname: profile.fullname,
      currentPlan: plan,
      credits: profile.subscription?.credits || 0,
      planDetails,
      stripeId: profile.stripeId,
      billingAddress: formattedBillingAddress,
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
    if (!user) return { success: false, methods: [], defaultPaymentMethodId: null }

    const profile = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        stripeId: true,
      },
    })

    if (!profile?.stripeId) {
      return { success: true, methods: [], defaultPaymentMethodId: null }
    }

    const customer = await stripe.customers.retrieve(profile.stripeId)
    const defaultPaymentMethodId = customer.deleted 
      ? null 
      : (customer.invoice_settings?.default_payment_method as string | null)

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
      isDefault: pm.id === defaultPaymentMethodId,
    }))

    return { 
      success: true, 
      methods,
      defaultPaymentMethodId 
    }
  } catch (error) {
    console.log(error)
    return { success: false, methods: [], defaultPaymentMethodId: null }
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
      return { success: false, message: 'No Stripe customer found' }
    }

    await stripe.customers.update(profile.stripeId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    })

    return { success: true, message: 'Default payment method updated' }
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
      return { success: false, message: 'No Stripe customer found' }
    }

    await stripe.paymentMethods.detach(paymentMethodId)

    return { success: true, message: 'Payment method removed' }
  } catch (error) {
    console.log(error)
    return { success: false, message: 'Failed to remove payment method' }
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
        email: user.emailAddresses[0]?.emailAddress,
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}` 
          : user.firstName || 'User',
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
          stripeId: customer.id,
        },
      })
    }

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeId,
      payment_method_types: ['card'],
    })

    return { 
      success: true, 
      clientSecret: setupIntent.client_secret 
    }
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