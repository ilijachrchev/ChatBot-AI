'use server'
import { client } from '@/lib/prisma'
import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { onCreateDomain } from '../domain';

async function ensureUserRow() {
  const cu = await currentUser()
  if (!cu) return null;

  const user = await client.user.upsert({
    where: { clerkId: cu.id },
    create: {
      clerkId: cu.id,
      fullname: cu.firstName || 'User',
      type: 'OWNER',
    },
    update: {
      fullname: cu.firstName || 'User',
    },
    select: {
      id: true,
      clerkId: true,
    },
  });
  return user;
}

function getPlanLimits(plan: string | null | undefined) {
  switch (plan) {
    case 'STANDARD':
      return 1;
    case 'PRO':
      return 5;
    case 'ULTIMATE':
      return 10;
    default:
      return 0;
  }
}

export const onIntegrateDomain = async (domain: string, icon: string) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const result = await onCreateDomain(domain, icon)
    return result
  } catch (error) {
    console.error(error)
    return {
      status: 500,
      message: 'Internal server error',
    }
  }
}

export const onGetSubscriptionPlan = async () => {
  try {
    const user = await currentUser()
    if (!user) return
    const plan = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
      },
    })
    if (plan) {
      return plan.subscription?.plan
    }
  } catch (error) {
    console.error(error)
  }
}

export const onGetAllAccountDomains = async () => {
  const user = await currentUser()
  if (!user) return
  try {
    const domains = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        domains: {
          select: {
            name: true,
            icon: true,
            id: true,
            verificationStatus: true,
            verificationMethod: true,
            verifiedAt: true,
            customer: {
              select: {
                chatRoom: {
                  select: {
                    id: true,
                    live: true,
                  },
                },
              },
            },
          },
        },
      },
    })
    return { ...domains }
  } catch (error) {
    console.error(error)
  }
}
export const onUpdatePassword = async (password: string) => {
  try {
    const user = await currentUser()

    if (!user) return null
    const client = await clerkClient()
    const update = await client.users.updateUser(user.id, { password })
    
    if (update) {
      return { status: 200, message: 'Password updated' }
    }
  } catch (error) {
    console.error(error)
  }
}

export const onGetCurrentDomainInfo = async (domain: string) => {
  const user = await currentUser()
  if (!user) return
  try {
    const userDomain = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        subscription: {
          select: {
            plan: true,
          },
        },
        domains: {
          where: {
            name: {
              contains: domain,
            },
          },
          select: {
            id: true,
            name: true,
            icon: true,
            userId: true,
            products: true,
            verificationMethod: true,
            verificationStatus: true,
            verifiedAt: true,
            timezone: true,
            realtimeEnabled: true,
            liveNotificationsEnabled: true,
            personaLastChangedAt: true,
            chatBot: {
              select: {
                id: true,
                welcomeMessage: true,
                icon: true,
                backgroundColor: true,
                persona: true,
                customPrompt: true,
                chatbotTitle: true,
                chatbotSubtitle: true,
                userBubbleColor: true,
                botBubbleColor: true,
                userTextColor: true,
                botTextColor: true,
                buttonStyle: true,
                bubbleStyle: true,
                showAvatars: true,
                widgetSize: true,
                widgetStyle: true,
                removeBranding: true,
                chatPosition: true,
                customCss: true,
                presenceMode: true,
                offlineBehavior: true,
                offlineCustomMessage: true,
                showPresenceBadge: true,
                teaserEnabled: true,
                teaserMessage: true,
                teaserDelay: true,
              },
            },
          },
        },
      },
    })
    if (userDomain) {
      return userDomain
    }
  } catch (error) {
    console.error(error)
  }
}

export const onUpdateDomain = async (id: string, name: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const domainOwned = await client.domain.findFirst({
      where: { id, User: { clerkId: user.id } },
      select: { id: true },
    })
    if (!domainOwned) return { status: 403, message: 'Unauthorized' }

    const domainExists = await client.domain.findFirst({
      where: {
        name: {
          contains: name,
        },
      },
    })

    if (!domainExists) {
      const domain = await client.domain.update({
        where: {
          id,
        },
        data: {
          name,
        },
      })

      if (domain) {
        return {
          status: 200,
          message: 'Domain updated',
        }
      }

      return {
        status: 400,
        message: 'Oops something went wrong!',
      }
    }

    return {
      status: 400,
      message: 'Domain with this name already exists',
    }
  } catch (error) {
    console.error(error)
  }
}

export const onChatBotImageUpdate = async (id: string, imageUrl: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const existing = await client.chatBot.findUnique({
      where: { id },
      select: { domainId: true },
    })
    if (!existing) return { status: 404, message: 'Chatbot not found' }

    const domain = await client.domain.findFirst({
      where: { id: existing.domainId!, User: { clerkId: user.id } },
      select: { id: true },
    })
    if (!domain) return { status: 403, message: 'Unauthorized' }

    const chatbot = await client.chatBot.update({
      where: { id },
      data: {
        icon: imageUrl,
      },
    })

    if (chatbot) {
      return {
        status: 200,
        message: 'Chatbot icon updated successfully',
      }
    }

    return {
      status: 400,
      message: 'Failed to update chatbot icon!',
    }
  } catch (error) {
    console.error(error)
  }
  return {
    status: 500,
    message: 'Internal server error!',
  }
}

export const onUpdateChatbotColor = async (id: string, color: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const existing = await client.chatBot.findUnique({
      where: { id },
      select: { domainId: true },
    })
    if (!existing) return { status: 404, message: 'Chatbot not found' }

    const domain = await client.domain.findFirst({
      where: { id: existing.domainId!, User: { clerkId: user.id } },
      select: { id: true },
    })
    if (!domain) return { status: 403, message: 'Unauthorized' }

    const chatbot = await client.chatBot.update({
      where: { id },
      data: {
        backgroundColor: color,
      }
    })

    if (chatbot) {
      return {
        status: 200,
        message: 'Chatbot color updated successfully',
      }
    }
    return {
      status: 400,
      message: 'Failed to update chatbot color',
    }
  } catch (error) {
    console.error(error)
    return {
      status: 500,
      message: 'Internal server error',
    }
  }
}

export const onUpdateWelcomeMessage = async (
  message: string,
  domainId: string
) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const domainOwned = await client.domain.findFirst({
      where: { id: domainId, User: { clerkId: user.id } },
      select: { id: true },
    })
    if (!domainOwned) return { status: 403, message: 'Unauthorized' }

    const update = await client.domain.update({
      where: {
        id: domainId,
      },
      data: {
        chatBot: {
          update: {
            data: {
              welcomeMessage: message,
            },
          },
        },
      },
    })

    if (update) {
      return { status: 200, message: 'Welcome message updated' }
    }
  } catch (error) {
    console.error(error)
  }
}

export const onDeleteUserDomain = async (id: string) => {
  const user = await currentUser()

  if (!user) return

  try {
    const validUser = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
      },
    })

    if (validUser) {
      const deletedDomain = await client.domain.delete({
        where: {
          userId: validUser.id,
          id,
        },
        select: {
          name: true,
        },
      })

      if (deletedDomain) {
        return {
          status: 200,
          message: `${deletedDomain.name} was deleted successfully`,
        }
      }
    }
  } catch (error) {
    console.error(error)
  }
}

export const onCreateHelpDeskQuestion = async (
  id: string,
  question: string,
  answer: string
) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const domainOwned = await client.domain.findFirst({
      where: { id, User: { clerkId: user.id } },
      select: { id: true },
    })
    if (!domainOwned) return { status: 403, message: 'Unauthorized' }

    const helpDeskQuestion = await client.domain.update({
      where: {
        id,
      },
      data: {
        helpdesk: {
          create: {
            question,
            answer,
          },
        },
      },
      include: {
        helpdesk: {
          select: {
            id: true,
            question: true,
            answer: true,
          },
        },
      },
    })

    if (helpDeskQuestion) {
      return {
        status: 200,
        message: 'New help desk question added',
        questions: helpDeskQuestion.helpdesk,
      }
    }

    return {
      status: 400,
      message: 'Oops! something went wrong',
    }
  } catch (error) {
    console.error(error)
  }
}

export const onGetAllHelpDeskQuestions = async (id: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized', questions: [] }

    const domainOwned = await client.domain.findFirst({
      where: { id, User: { clerkId: user.id } },
      select: { id: true },
    })
    if (!domainOwned) return { status: 403, message: 'Unauthorized', questions: [] }

    const questions = await client.helpDesk.findMany({
      where: {
        domainId: id,
      },
      select: {
        question: true,
        answer: true,
        id: true,
      },
    })

    return {
      status: 200,
      message: 'New help desk question added',
      questions: questions,
    }
  } catch (error) {
    console.error(error)
  }
}

export const onCreateFilterQuestions = async (id: string, question: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const domainOwned = await client.domain.findFirst({
      where: { id, User: { clerkId: user.id } },
      select: { id: true },
    })
    if (!domainOwned) return { status: 403, message: 'Unauthorized' }

    const filterQuestion = await client.domain.update({
      where: {
        id,
      },
      data: {
        filterQuestions: {
          create: {
            question,
          },
        },
      },
      include: {
        filterQuestions: {
          select: {
            id: true,
            question: true,
          },
        },
      },
    })

    if (filterQuestion) {
      return {
        status: 200,
        message: 'Filter question added',
        questions: filterQuestion.filterQuestions,
      }
    }
    return {
      status: 400,
      message: 'Oops! something went wrong',
    }
  } catch (error) {
    console.error(error)
  }
}

export const onGetAllFilterQuestions = async (id: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized', questions: [] }

    const domainOwned = await client.domain.findFirst({
      where: { id, User: { clerkId: user.id } },
      select: { id: true },
    })
    if (!domainOwned) return { status: 403, message: 'Unauthorized', questions: [] }

    const questions = await client.filterQuestions.findMany({
      where: {
        domainId: id,
      },
      select: {
        question: true,
        id: true,
      },
      orderBy: {
        question: 'asc',
      },
    })

    return {
      status: 200,
      message: '',
      questions: questions,
    }
  } catch (error) {
    console.error(error)
  }
}

export const onGetPaymentConnected = async () => {
  try {
    const user = await currentUser()
    if (user) {
      const connected = await client.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          stripeId: true,
        },
      })
      if (connected) {
        return connected.stripeId
      }
    }
  } catch (error) {
    console.error(error)
  }
}

export const onCreateNewDomainProduct = async (
  id: string,
  name: string,
  image: string,
  price: string
) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const domainOwned = await client.domain.findFirst({
      where: { id, User: { clerkId: user.id } },
      select: { id: true },
    })
    if (!domainOwned) return { status: 403, message: 'Unauthorized' }

    const parsedPrice = parseInt(price)
    if (isNaN(parsedPrice)) return { status: 400, message: 'Invalid price' }

    const product = await client.domain.update({
      where: {
        id,
      },
      data: {
        products: {
          create: {
            name,
            image,
            price: parsedPrice,
          },
        },
      },
    })

    if (product) {
      return {
        status: 200,
        message: 'Product successfully created',
      }
    }
  } catch (error) {
    console.error(error)
  }
}

export const onGetUserProfile = async () => {
  try {
    const user = await currentUser()
    if (!user) return null

    let profile = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
        fullname: true,
        clerkId: true,
        type: true,
        createdAt: true,
        avatar: true,
        lastNameChange: true, 
      },
    })

    if (!profile || profile.fullname === 'User') {
      const clerkFullName = user.firstName 
        ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
        : 'User'

      if (!profile) {
        profile = await client.user.create({
          data: {
            clerkId: user.id,
            fullname: clerkFullName,
            type: 'OWNER',
            avatar: user.imageUrl,
          },
          select: {
            id: true,
            fullname: true,
            clerkId: true,
            type: true,
            createdAt: true,
            avatar: true,
            lastNameChange: true,
          },
        })
      } else {
        profile = await client.user.update({
          where: { clerkId: user.id },
          data: {
            fullname: clerkFullName,
            avatar: profile.avatar || user.imageUrl,
          },
          select: {
            id: true,
            fullname: true,
            clerkId: true,
            type: true,
            createdAt: true,
            avatar: true,
            lastNameChange: true,
          },
        })
      }
    }

    if (profile) {
      const email = user.emailAddresses?.[0]?.emailAddress || ''
      
      return {
        ...profile,
        email,
        imageUrl: profile.avatar || user.imageUrl,
      }
    }

    return null
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

export const onUpdateUserProfile = async (fullname: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 400, message: 'User not found' }

    const currentProfile = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        lastNameChange: true,
      },
    })

    if (currentProfile?.lastNameChange) {
      const daysSinceLastChange = Math.floor(
        (Date.now() - new Date(currentProfile.lastNameChange).getTime()) / (1000 * 60 * 60 * 24)
      )
      
      if (daysSinceLastChange < 14) {
        const daysRemaining = 14 - daysSinceLastChange
        return {
          status: 400,
          message: `You can change your name again in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
        }
      }
    }

    const updated = await client.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        fullname,
        lastNameChange: new Date(), 
      },
    })

    const clerk = await clerkClient()
    await clerk.users.updateUser(user.id, {
      firstName: fullname.split(' ')[0],
      lastName: fullname.split(' ').slice(1).join(' ') || undefined,
    })

    if (updated) {
      return {
        status: 200,
        message: 'Profile updated successfully',
      }
    }

    return {
      status: 400,
      message: 'Failed to update profile',
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    return {
      status: 500,
      message: 'Internal server error',
    }
  }
}

export const onUpdateUserAvatar = async (imageUrl: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 400, message: 'User not found' }

    const updated = await client.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        avatar: imageUrl,
      },
    })

    if (updated) {
      return {
        status: 200,
        message: 'Profile picture updated successfully',
        imageUrl,
      }
    }

    return {
      status: 400,
      message: 'Failed to update profile picture',
    }
  } catch (error) {
    console.error('Error updating avatar:', error)
    return {
      status: 500,
      message: 'Failed to update profile picture',
    }
  }
}

export const onUpdateChatbotPersona = async (
  chatBotId: string,
  persona: string,
  customPrompt?: string | null
) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  const chatbot = await client.chatBot.findUnique({
    where: { id: chatBotId },
    select: { persona: true, domainId: true },
  })

  if (!chatbot) return { status: 404, message: 'Chatbot not found' }

  const domainOwned = await client.domain.findFirst({
    where: { id: chatbot.domainId!, User: { clerkId: user.id } },
    select: { id: true },
  })
  if (!domainOwned) return { status: 403, message: 'Unauthorized' }

  const isSamePersona = chatbot.persona === persona

  if (!isSamePersona && chatbot.domainId) {
    const domain = await client.domain.findUnique({
      where: { id: chatbot.domainId },
      select: { personaLastChangedAt: true },
    })
    if (domain?.personaLastChangedAt) {
      const hoursSince =
        (Date.now() - new Date(domain.personaLastChangedAt).getTime()) / (1000 * 60 * 60)
      if (hoursSince < 24) {
        const hoursRemaining = Math.ceil(24 - hoursSince)
        return {
          status: 429,
          message: `You can change your persona again in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}`,
          hoursRemaining,
        }
      }
    }
  }

  await client.chatBot.update({
    where: { id: chatBotId },
    data: {
      persona,
      customPrompt: persona === 'CUSTOM' ? customPrompt : null,
    },
  })

  if (!isSamePersona && chatbot.domainId) {
    await client.domain.update({
      where: { id: chatbot.domainId },
      data: { personaLastChangedAt: new Date() },
    })
  }

  return { status: 200, message: 'AI persona updated successfully' }
}

export const onUpdateChatbotCustomization = async (
  chatBotId: string,
  customization: {
    chatbotTitle?: string
    chatbotSubtitle?: string
    userBubbleColor?: string
    botBubbleColor?: string
    userTextColor?: string
    botTextColor?: string
    buttonStyle?: string
    bubbleStyle?: string
    showAvatars?: boolean
    widgetSize?: string
    widgetStyle?: string
    removeBranding?: boolean
    chatPosition?: string
    customCss?: string
    teaserEnabled?: boolean
    teaserMessage?: string
    teaserDelay?: number
  }
) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const existing = await client.chatBot.findUnique({
      where: { id: chatBotId },
      select: { domainId: true },
    })
    if (!existing) return { status: 404, message: 'Chatbot not found' }

    const domain = await client.domain.findFirst({
      where: { id: existing.domainId!, User: { clerkId: user.id } },
      select: { id: true },
    })
    if (!domain) return { status: 403, message: 'Unauthorized' }

    const chatbot = await client.chatBot.update({
      where: { id: chatBotId },
      data: customization,
    })

    if (chatbot) {
      return {
        status: 200,
        message: 'Chatbot customization updated successfully',
      }
    }

    return {
      status: 400,
      message: 'Failed to update customization',
    }
  } catch (error) {
    console.error('Error updating customization:', error)
    return {
      status: 500,
      message: 'Internal server error',
    }
  }
}

export const onGetUserSessions = async () => {
  try {
    const user = await currentUser()
    if (!user) return null

    const clerk = await clerkClient()
    
    const sessions = await clerk.users.getUserList({
      userId: [user.id],
    })

    const userSessions = await clerk.sessions.getSessionList({
      userId: user.id,
    })

    return userSessions
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
}

export const onRevokeSession = async (sessionId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const clerk = await clerkClient()

    const userSessions = await clerk.sessions.getSessionList({ userId: user.id })
    const sessionBelongsToUser = userSessions.data.some((s) => s.id === sessionId)
    if (!sessionBelongsToUser) return { status: 403, message: 'Unauthorized' }

    await clerk.sessions.revokeSession(sessionId)

    return {
      status: 200,
      message: 'Session revoked successfully',
    }
  } catch (error) {
    console.error('Error revoking session:', error)
    return {
      status: 500,
      message: 'Failed to revoke session',
    }
  }
}

export const onUpdateKeepMeLoggedIn = async (keepMeLoggedIn: boolean) => {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { status: 401, message: 'Unauthorized' }
    }

    const updated = await client.user.update({
      where: {
        clerkId: user.id,
      },
      data: {
        keepMeLoggedIn,
      },
    })

    if (updated) {
      return { status: 200, message: 'Preference updated successfully' }
    }

    return { status: 400, message: 'Failed to update preference' }
  } catch (error) {
    console.error('Error updating keep me logged in preference:', error)
    return { status: 500, message: 'Failed to update preference' }
  }
}

export const onGetKeepMeLoggedInPreference = async () => {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { status: 401, keepMeLoggedIn: true }
    }

    const dbUser = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        keepMeLoggedIn: true,
      },
    })

    return { 
      status: 200, 
      keepMeLoggedIn: dbUser?.keepMeLoggedIn ?? true 
    }
  } catch (error) {
    console.error('Error fetching keep me logged in preference:', error)
    return { status: 500, keepMeLoggedIn: true }
  }
}

export const onUpdateDomainRealtimeEnabled = async (
  domainId: string,
  realtimeEnabled: boolean
) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const domainOwned = await client.domain.findFirst({
      where: { id: domainId, User: { clerkId: user.id } },
      select: { id: true },
    })
    if (!domainOwned) return { status: 403, message: 'Unauthorized' }

    const updated = await client.domain.update({
      where: { id: domainId },
      data: { realtimeEnabled },
    })

    if (updated) {
      return {
        status: 200,
        message: realtimeEnabled ? 'Realtime mode enabled' : 'Realtime mode disabled',
      }
    }

    return { status: 400, message: 'Failed to update setting' }
  } catch (error) {
    console.error(error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const onUpdateLiveNotificationsEnabled = async (
  domainId: string,
  enabled: boolean
) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const domain = await client.domain.findFirst({
      where: { id: domainId, User: { clerkId: user.id } },
      select: { id: true },
    })

    if (!domain) return { status: 403, message: 'Unauthorized' }

    await client.domain.update({
      where: { id: domainId },
      data: { liveNotificationsEnabled: enabled },
    })

    return { status: 200, message: 'Notification preference saved' }
  } catch (error) {
    console.error(error)
    return { status: 500, message: 'Failed to update' }
  }
}

export const onGetPersonaSidebarItems = async () => {
  const user = await currentUser()
  if (!user) return []

  const dbUser = await client.user.findUnique({
    where: { clerkId: user.id },
    select: {
      domains: {
        select: {
          id: true,
          name: true,
          chatBot: {
            select: { persona: true },
          },
        },
      },
    },
  })

  if (!dbUser) return []

  const items: {
    persona: string
    domainId: string
    domainName: string
    label: string
    path: string
    icon: string
  }[] = []

  for (const domain of dbUser.domains) {
    const persona = domain.chatBot?.persona
    if (!persona) continue

    switch (persona) {
      case 'SALES_AGENT':
        items.push({
          persona,
          domainId: domain.id,
          domainName: domain.name,
          label: 'Sales Pipeline',
          path: `sales-pipeline?domain=${domain.id}`,
          icon: 'BRIEFCASE',
        })
        break
      case 'CUSTOMER_SUPPORT':
        items.push({
          persona,
          domainId: domain.id,
          domainName: domain.name,
          label: 'Support Tickets',
          path: `support-tickets?domain=${domain.id}`,
          icon: 'HEADPHONES',
        })
        break
      case 'REAL_ESTATE_QUALIFIER':
        items.push({
          persona,
          domainId: domain.id,
          domainName: domain.name,
          label: 'Properties',
          path: `properties?domain=${domain.id}`,
          icon: 'HOME',
        })
        break
      case 'RESTAURANT_RESERVATION':
        items.push({
          persona,
          domainId: domain.id,
          domainName: domain.name,
          label: 'Reservations',
          path: `reservations?domain=${domain.id}`,
          icon: 'UTENSILS',
        })
        break
      case 'HEALTHCARE_INTAKE':
        items.push({
          persona,
          domainId: domain.id,
          domainName: domain.name,
          label: 'Patient Intake',
          path: `patient-intake?domain=${domain.id}`,
          icon: 'STETHOSCOPE',
        })
        break
      case 'APPOINTMENT_SETTER':
        items.push({
          persona,
          domainId: domain.id,
          domainName: domain.name,
          label: 'Appointments',
          path: `appointment?domain=${domain.id}`,
          icon: 'CALENDAR',
        })
        break
      case 'ECOMMERCE_RECOMMENDER':
        items.push({
          persona,
          domainId: domain.id,
          domainName: domain.name,
          label: 'Products',
          path: `products?domain=${domain.id}`,
          icon: 'SHOPPING_BAG',
        })
        break
    }
  }

  return items
}

export const onGetDomainName = async (domainId: string) => {
  try {
    const domain = await client.domain.findUnique({
      where: { id: domainId },
      select: { name: true },
    })
    return domain?.name ?? ''
  } catch {
    return ''
  }
}

export const onGetDomainProducts = async (domainId: string) => {
  const user = await currentUser()
  if (!user) return []

  const domainOwned = await client.domain.findFirst({
    where: { id: domainId, User: { clerkId: user.id } },
    select: { id: true },
  })
  if (!domainOwned) return []

  return await client.product.findMany({
    where: { domainId },
    orderBy: { createdAt: 'desc' },
  })
}

export const onUpdateDomainProduct = async (
  id: string,
  data: {
    name?: string
    description?: string
    price?: number
    image?: string
    status?: string
  }
) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const existing = await client.product.findUnique({
      where: { id },
      select: { domainId: true },
    })
    if (!existing) return { status: 404, message: 'Product not found' }

    const domainOwned = await client.domain.findFirst({
      where: { id: existing.domainId, User: { clerkId: user.id } },
      select: { id: true },
    })
    if (!domainOwned) return { status: 403, message: 'Unauthorized' }

    const product = await client.product.update({
      where: { id },
      data,
    })

    if (product) {
      return { status: 200, message: 'Product updated' }
    }
    return { status: 400, message: 'Failed to update product' }
  } catch (error) {
    console.error(error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const onDeleteDomainProduct = async (id: string, domainId: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    })

    if (!dbUser) return { status: 401, message: 'Unauthorized' }

    const domain = await client.domain.findFirst({
      where: { id: domainId, userId: dbUser.id },
      select: { id: true },
    })

    if (!domain) return { status: 403, message: 'Unauthorized' }

    await client.product.delete({ where: { id } })

    return { status: 200, message: 'Product deleted' }
  } catch (error) {
    console.error(error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const onSaveKeepMeLoggedInOnLogin = async (keepMeLoggedIn: boolean) => {
  try {
    const user = await currentUser()
    
    if (!user) {
      return { status: 401, message: 'Unauthorized' }
    }

    const updated = await client.user.upsert({
      where: {
        clerkId: user.id,
      },
      create: {
        clerkId: user.id,
        fullname: user.firstName || 'User',
        type: 'OWNER',
        keepMeLoggedIn,
      },
      update: {
        keepMeLoggedIn,
      },
    })

    if (updated) {
      return { status: 200, message: 'Preference saved' }
    }

    return { status: 400, message: 'Failed to save preference' }
  } catch (error) {
    console.error('Error saving keep me logged in preference:', error)
    return { status: 500, message: 'Failed to save preference' }
  }
}