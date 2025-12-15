'use server'

import { client } from '@/lib/prisma'
import { determineChatbotPresence, ChatbotPresence } from '@/lib/chatbot-presence'
import { WorkingHoursConfig } from '@/lib/working-hours-utils'

export const onGetChatbotPresence = async (domainId: string): Promise<ChatbotPresence | null> => {
  try {
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      include: {
        chatBot: true,
        workingHours: true,
      },
    })

    if (!domain || !domain.chatBot) {
      return null
    }

    let workingHoursConfig: WorkingHoursConfig | null = null

    if (domain.workingHours && domain.workingHours.enabled) {
      workingHoursConfig = {
        enabled: true,
        timezone: domain.timezone,
        monday: {
          ranges: domain.workingHours.mondayRanges,
          closed: domain.workingHours.mondayClosed,
        },
        tuesday: {
          ranges: domain.workingHours.tuesdayRanges,
          closed: domain.workingHours.tuesdayClosed,
        },
        wednesday: {
          ranges: domain.workingHours.wednesdayRanges,
          closed: domain.workingHours.wednesdayClosed,
        },
        thursday: {
          ranges: domain.workingHours.thursdayRanges,
          closed: domain.workingHours.thursdayClosed,
        },
        friday: {
          ranges: domain.workingHours.fridayRanges,
          closed: domain.workingHours.fridayClosed,
        },
        saturday: {
          ranges: domain.workingHours.saturdayRanges,
          closed: domain.workingHours.saturdayClosed,
        },
        sunday: {
          ranges: domain.workingHours.sundayRanges,
          closed: domain.workingHours.sundayClosed,
        },
      }
    }

    // TODO: Check if agents are online (for now, assume 0)
    const agentsOnline = 0

    const presence = determineChatbotPresence(
      domain.chatBot.presenceMode as any,
      workingHoursConfig,
      domain.chatBot.offlineBehavior,
      domain.chatBot.offlineCustomMessage || undefined,
      agentsOnline
    )

    return presence
  } catch (error) {
    console.error('Error getting chatbot presence:', error)
    return null
  }
}

export const onCheckDomainAvailability = async (
  domainId: string
): Promise<{
  available: boolean
  presence: ChatbotPresence | null
}> => {
  try {
    const presence = await onGetChatbotPresence(domainId)

    if (!presence) {
      return { available: true, presence: null }
    }

    return {
      available: presence.status === 'ONLINE' || presence.status === 'AWAY',
      presence,
    }
  } catch (error) {
    console.error('Error checking domain availability:', error)
    return { available: true, presence: null }
  }
}