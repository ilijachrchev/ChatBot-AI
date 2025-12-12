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
    console.log(error)
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
    console.log(error)
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
    console.log(error)
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
    console.log(error)
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
    console.log(error)
  }
}

export const onUpdateDomain = async (id: string, name: string) => {
  try {
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
    console.log(error)
  }
}

export const onChatBotImageUpdate = async (id: string, imageUrl: string) => {
  try {
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
    console.log(error)
  }
  return {
    status: 500,
    message: 'Internal server error!',
  }
}

export const onUpdateChatbotColor = async (id: string, color: string) => {
  try {
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
    console.log(error)
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
    console.log(error)
  }
}

export const onCreateHelpDeskQuestion = async (
  id: string,
  question: string,
  answer: string
) => {
  try {
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
    console.log(error)
  }
}

export const onGetAllHelpDeskQuestions = async (id: string) => {
  try {
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
    console.log(error)
  }
}

export const onCreateFilterQuestions = async (id: string, question: string) => {
  try {
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
    console.log(error)
  }
}

export const onGetAllFilterQuestions = async (id: string) => {
  try {
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
    console.log(error)
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
    console.log(error)
  }
}

export const onCreateNewDomainProduct = async (
  id: string,
  name: string,
  image: string,
  price: string
) => {
  try {
    const product = await client.domain.update({
      where: {
        id,
      },
      data: {
        products: {
          create: {
            name,
            image,
            price: parseInt(price),
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
    console.log(error)
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
    console.log('Error fetching user profile:', error)
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
    console.log('Error updating profile:', error)
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
    console.log('Error updating avatar:', error)
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
  try {
    const chatbot = await client.chatBot.update({
      where: { id: chatBotId },
      data: {
        persona,
        customPrompt: persona === 'CUSTOM' ? customPrompt : null,
      },
    })

    if (chatbot) {
      return {
        status: 200,
        message: 'AI persona updated successfully',
      }
    }

    return {
      status: 400,
      message: 'Failed to update persona',
    }
  } catch (error) {
    console.error('Error updating persona:', error)
    return {
      status: 500,
      message: 'Internal server error',
    }
  }
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
  }
) => {
  try {
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