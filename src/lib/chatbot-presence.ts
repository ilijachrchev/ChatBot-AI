import { isWithinWorkingHours, getOfflineMessage, WorkingHoursConfig } from './working-hours-utils'

export type PresenceMode = 'AUTO' | 'ONLINE' | 'AWAY' | 'OFFLINE'

export type ChatbotPresence = {
  status: 'ONLINE' | 'AWAY' | 'OFFLINE'
  canHandoff: boolean
  message?: string
  badge: {
    text: string
    color: string
  }
}

export function determineChatbotPresence(
  presenceMode: PresenceMode,
  workingHours: WorkingHoursConfig | null,
  offlineBehavior: string,
  offlineCustomMessage?: string,
  agentsOnline: number = 0
): ChatbotPresence {
  if (presenceMode !== 'AUTO') {
    return getPresenceFromMode(presenceMode, offlineBehavior, offlineCustomMessage, workingHours)
  }

  if (!workingHours || !workingHours.enabled) {
    return {
      status: 'ONLINE',
      canHandoff: true,
      badge: {
        text: 'Online',
        color: 'green',
      },
    }
  }

  const isOpen = isWithinWorkingHours(workingHours)

  if (!isOpen) {
    const message = getOfflineMessage(
      workingHours,
      offlineBehavior as any,
      offlineCustomMessage
    )

    return {
      status: 'OFFLINE',
      canHandoff: false,
      message,
      badge: {
        text: 'Offline',
        color: 'red',
      },
    }
  }

  if (agentsOnline > 0) {
    return {
      status: 'ONLINE',
      canHandoff: true,
      badge: {
        text: 'Online',
        color: 'green',
      },
    }
  }

  return {
    status: 'AWAY',
    canHandoff: true, 
    message: "Our team will respond shortly. Leave your email for a faster response.",
    badge: {
      text: 'Away',
      color: 'yellow',
    },
  }
}

function getPresenceFromMode(
  mode: PresenceMode,
  offlineBehavior: string,
  offlineCustomMessage?: string,
  workingHours?: WorkingHoursConfig | null
): ChatbotPresence {
  switch (mode) {
    case 'ONLINE':
      return {
        status: 'ONLINE',
        canHandoff: true,
        badge: { text: 'Online', color: 'green' },
      }

    case 'AWAY':
      return {
        status: 'AWAY',
        canHandoff: true,
        message: "Our team will respond shortly. Leave your email for a faster response.",
        badge: { text: 'Away', color: 'yellow' },
      }

    case 'OFFLINE':
      const message = workingHours
        ? getOfflineMessage(workingHours, offlineBehavior as any, offlineCustomMessage)
        : offlineCustomMessage || "We're currently offline. Please leave your email and we'll get back to you."

      return {
        status: 'OFFLINE',
        canHandoff: false,
        message,
        badge: { text: 'Offline', color: 'red' },
      }

    default:
      return {
        status: 'ONLINE',
        canHandoff: true,
        badge: { text: 'Online', color: 'green' },
      }
  }
}

export function getPresenceResponse(
  presence: ChatbotPresence,
  offlineBehavior: string
): {
  shouldShowMessage: boolean
  shouldCollectEmail: boolean
  shouldContinueAI: boolean
} {
  if (presence.status === 'ONLINE') {
    return {
      shouldShowMessage: false,
      shouldCollectEmail: false,
      shouldContinueAI: true,
    }
  }

  if (presence.status === 'AWAY') {
    return {
      shouldShowMessage: true,
      shouldCollectEmail: true,
      shouldContinueAI: true,
    }
  }

  switch (offlineBehavior) {
    case 'AI_ONLY':
      return {
        shouldShowMessage: true,
        shouldCollectEmail: false,
        shouldContinueAI: true,
      }

    case 'COLLECT_EMAIL':
      return {
        shouldShowMessage: true,
        shouldCollectEmail: true,
        shouldContinueAI: false,
      }

    case 'SHOW_HOURS_AND_EMAIL':
      return {
        shouldShowMessage: true,
        shouldCollectEmail: true,
        shouldContinueAI: true,
      }

    case 'SHOW_OFFLINE_MESSAGE':
    default:
      return {
        shouldShowMessage: true,
        shouldCollectEmail: false,
        shouldContinueAI: false,
      }
  }
}