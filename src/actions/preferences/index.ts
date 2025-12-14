'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export type UserPreferences = {
  id: string
  userId: string
  language: string
  timezone: string
  dateFormat: string
  timeFormat: string
  emailNotifications: boolean
  desktopNotifications: boolean
  soundEnabled: boolean
  defaultView: string
  conversationSort: string
  itemsPerPage: number
  workingHoursEnabled: boolean
  workingHoursStart: string | null
  workingHoursEnd: string | null
  workingDays: string[]
}

export const onGetUserPreferences = async () => {
  try {
    const user = await currentUser()
    if (!user) return null

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) return null

    let preferences = await client.userPreferences.findUnique({
      where: { userId: dbUser.id },
    })

    if (!preferences) {
      preferences = await client.userPreferences.create({
        data: {
          userId: dbUser.id,
        },
      })
    }

    return preferences
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return null
  }
}

export const onUpdateUserPreferences = async (
  data: Partial<Omit<UserPreferences, 'id' | 'userId'>>
) => {
  try {
    const user = await currentUser()
    if (!user) throw new Error('Unauthorized')

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
    })

    if (!dbUser) throw new Error('User not found')

    const preferences = await client.userPreferences.upsert({
      where: { userId: dbUser.id },
      update: data,
      create: {
        userId: dbUser.id,
        ...data,
      },
    })

    return { success: true, preferences }
  } catch (error) {
    console.error('Error updating preferences:', error)
    return { success: false, error: 'Failed to update preferences' }
  }
}

export const onGetUserTimezone = async () => {
  try {
    const user = await currentUser()
    if (!user) return 'UTC'

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      include: {
        preferences: {
          select: {
            timezone: true,
          },
        },
      },
    })

    return dbUser?.preferences?.timezone || 'UTC'
  } catch (error) {
    console.error('Error fetching user timezone:', error)
    return 'UTC'
  }
}

export const onGetUserPreferencesForDomain = async (domainId: string) => {
  try {
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      include: {
        User: {
          include: {
            preferences: true,
          },
        },
      },
    })

    return domain?.User?.preferences || null
  } catch (error) {
    console.error('Error fetching domain user preferences:', error)
    return null
  }
}