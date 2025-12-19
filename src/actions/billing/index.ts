'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { PRICING_CONFIG, type PlanType } from '@/lib/pricing-config'

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
      },
    })

    if (!profile) return null

    const plan = (profile.subscription?.plan || 'STANDARD') as PlanType
    const planDetails = PRICING_CONFIG[plan]

    return {
      userId: profile.id,
      fullname: profile.fullname,
      currentPlan: plan,
      credits: profile.subscription?.credits || 0,
      planDetails,
      stripeId: profile.stripeId,
    }
  } catch (error) {
    console.log(error)
    return null
  }
}

export const onGetPaymentMethods = async () => {
  try {
    return []
  } catch (error) {
    console.log(error)
    return []
  }
}

export const onGetBillingAddress = async () => {
  try {
    const user = await currentUser()
    if (!user) return null

    return null
  } catch (error) {
    console.log(error)
    return null
  }
}