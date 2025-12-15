'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export const onGetDomainWorkingHours = async (domainId: string) => {
  try {
    const user = await currentUser()
    if (!user) return null

    const workingHours = await client.workingHours.findUnique({
      where: { domainId },
      include: {
        domain: {
          select: {
            timezone: true,
          },
        },
      },
    })

    return workingHours
  } catch (error) {
    console.error('Error fetching working hours:', error)
    return null
  }
}

export const onUpdateDomainWorkingHours = async (
  domainId: string,
  data: {
    enabled: boolean
    mondayRanges?: string[]
    mondayClosed?: boolean
    tuesdayRanges?: string[]
    tuesdayClosed?: boolean
    wednesdayRanges?: string[]
    wednesdayClosed?: boolean
    thursdayRanges?: string[]
    thursdayClosed?: boolean
    fridayRanges?: string[]
    fridayClosed?: boolean
    saturdayRanges?: string[]
    saturdayClosed?: boolean
    sundayRanges?: string[]
    sundayClosed?: boolean
  }
) => {
  try {
    const user = await currentUser()
    if (!user) {
      return { status: 401, message: 'Unauthorized' }
    }

    const domain = await client.domain.findFirst({
      where: {
        id: domainId,
        User: {
          clerkId: user.id,
        },
      },
    })

    if (!domain) {
      return { status: 404, message: 'Domain not found' }
    }

    const workingHours = await client.workingHours.upsert({
      where: { domainId },
      update: data,
      create: {
        domainId,
        ...data,
      },
    })

    return {
      status: 200,
      message: 'Working hours updated successfully',
      workingHours,
    }
  } catch (error) {
    console.error('Error updating working hours:', error)
    return {
      status: 500,
      message: 'Failed to update working hours',
    }
  }
}

export const onUpdateDomainTimezone = async (
  domainId: string,
  timezone: string
) => {
  try {
    const user = await currentUser()
    if (!user) {
      return { status: 401, message: 'Unauthorized' }
    }

    const domain = await client.domain.update({
      where: {
        id: domainId,
        User: {
          clerkId: user.id,
        },
      },
      data: {
        timezone,
      },
    })

    return {
      status: 200,
      message: 'Timezone updated successfully',
      domain,
    }
  } catch (error) {
    console.error('Error updating timezone:', error)
    return {
      status: 500,
      message: 'Failed to update timezone',
    }
  }
}

export const onUpdateChatbotOfflineBehavior = async (
  domainId: string,
  data: {
    offlineBehavior: string
    offlineCustomMessage?: string
  }
) => {
  try {
    const user = await currentUser()
    if (!user) {
      return { status: 401, message: 'Unauthorized' }
    }

    const domain = await client.domain.findFirst({
      where: {
        id: domainId,
        User: {
          clerkId: user.id,
        },
      },
      include: {
        chatBot: true,
      },
    })

    if (!domain) {
      return { status: 404, message: 'Domain not found' }
    }

    if (!domain.chatBot) {
      return { status: 404, message: 'Chatbot not found' }
    }

    const chatbot = await client.chatBot.update({
      where: { id: domain.chatBot.id },
      data: {
        offlineBehavior: data.offlineBehavior,
        offlineCustomMessage: data.offlineCustomMessage,
      },
    })

    return {
      status: 200,
      message: 'Offline behavior updated successfully',
      chatbot,
    }
  } catch (error) {
    console.error('Error updating offline behavior:', error)
    return {
      status: 500,
      message: 'Failed to update offline behavior',
    }
  }
}