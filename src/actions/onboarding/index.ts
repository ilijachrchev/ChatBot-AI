'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export type OnboardingStep =
  | 'addedDomain'
  | 'customizedChatbot'
  | 'uploadedKnowledge'
  | 'copiedEmbedCode'
  | 'exploredPricing'

const PHASE_2_STEPS = [
  'customizedChatbot',
  'uploadedKnowledge',
  'copiedEmbedCode',
  'exploredPricing',
] as const

export const onGetOnboardingProgress = async () => {
  try {
    const user = await currentUser()
    if (!user) return null

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        onboardingCompleted: true,
        onboardingDismissed: true,
        onboardingProgress: true,
      },
    })

    if (!dbUser) return null

    const progress =
      dbUser.onboardingProgress ??
      (await client.onboardingProgress.create({
        data: { userId: dbUser.id },
      }))

    return {
      ...progress,
      onboardingCompleted: dbUser.onboardingCompleted,
      onboardingDismissed: dbUser.onboardingDismissed,
    }
  } catch (error) {
    console.error('Error fetching onboarding progress:', error)
    return null
  }
}

export const onUpdateOnboardingStep = async (step: OnboardingStep) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, allDone: false }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    })

    if (!dbUser) return { status: 404, allDone: false }

    const updated = await client.onboardingProgress.upsert({
      where: { userId: dbUser.id },
      create: { userId: dbUser.id, [step]: true },
      update: { [step]: true },
    })

    const allDone = PHASE_2_STEPS.every(
      (s) => Boolean(updated[s as keyof typeof updated])
    )

    if (allDone && !updated.completedAt) {
      await Promise.all([
        client.onboardingProgress.update({
          where: { userId: dbUser.id },
          data: { completedAt: new Date() },
        }),
        client.user.update({
          where: { id: dbUser.id },
          data: { onboardingCompleted: true },
        }),
      ])
    }

    return { status: 200, allDone }
  } catch (error) {
    console.error('Error updating onboarding step:', error)
    return { status: 500, allDone: false }
  }
}

export const onDismissOnboarding = async () => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401 }

    await client.user.update({
      where: { clerkId: user.id },
      data: { onboardingDismissed: true },
    })

    return { status: 200 }
  } catch (error) {
    console.error('Error dismissing onboarding:', error)
    return { status: 500 }
  }
}
