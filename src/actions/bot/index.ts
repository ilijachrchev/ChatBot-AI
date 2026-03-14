"use server"

import { client as db } from "@/lib/prisma"
import { extractEmailsFromString, extractURLfromString } from "@/lib/utils"
import { onRealTimeChat, onNotifyDashboardNewLiveConversation } from "../conversation"
import { clerkClient } from "@clerk/nextjs/server"
import { onMailer } from "../mailer"
import { getPersonaSystemPrompt } from "@/constants/personas"
import { callOpenAIWithProtection, isError } from "@/lib/openai-client"
import { onGetChatbotPresence } from "../chatbot/presence"
import { getKnowledgeBaseContext } from "@/lib/knowledge-base/retrieve"
import { checkAndIncrementConversation } from "@/lib/conversation-usage"
import { sendLiveChatNotification } from "@/lib/email"
import { onCreateNotification } from "@/actions/notifications"

async function maybeSendHandoffEmail(chatRoomId: string, lastMessage: string) {
  try {
    const room = await db.chatRoom.findUnique({
      where: { id: chatRoomId },
      select: {
        Customer: { select: { email: true } },
        Domain: {
          select: {
            name: true,
            liveNotificationsEnabled: true,
            User: { select: { clerkId: true } },
          },
        },
      },
    })

    if (!room?.Domain?.liveNotificationsEnabled) return
    if (!room.Domain.User?.clerkId) return

    const clerk = await clerkClient()
    const clerkUser = await clerk.users.getUser(room.Domain.User.clerkId)
    const ownerEmail = clerkUser.emailAddresses[0]?.emailAddress
    if (!ownerEmail) return

    const ownerName = clerkUser.firstName || 'there'

    sendLiveChatNotification({
      ownerEmail,
      ownerName,
      customerEmail: room.Customer?.email ?? null,
      domainName: room.Domain.name,
      lastMessage,
    }).catch(console.error)
  } catch (err) {
    console.error('maybeSendHandoffEmail error:', err)
  }
}

class DomainNotFoundError extends Error {
  domainId: string
  constructor(domainId: string) {
    super(`Domain not found: ${domainId}`)
    this.name = 'DomainNotFoundError'
    this.domainId = domainId
  }
}

class ConversationLimitError extends Error {
  count: number
  limit: number
  constructor(count: number, limit: number) {
    super(`Monthly conversation limit reached: ${count}/${limit}`)
    this.name = 'ConversationLimitError'
    this.count = count
    this.limit = limit
  }
}

const ensureChatRoom = async (chatroomId: string, domainId: string, customerId?: string) => {
  console.log('🔧 ensureChatRoom called with:', { chatroomId, domainId })

  const domain = await db.domain.findUnique({
    where: { id: domainId },
    select: {
      id: true,
      name: true,
      User: {
        select: {
          id: true,
          subscription: { select: { plan: true } },
        },
      },
    },
  })

  if (!domain) {
    console.error('❌ Domain not found for domainId:', domainId)
    throw new DomainNotFoundError(domainId)
  }

  const existingRoom = await db.chatRoom.findUnique({
    where: { id: chatroomId },
    select: { id: true },
  })

  if (!existingRoom) {
    const plan = (domain.User?.subscription?.plan as string) ?? 'STANDARD'
    const result = await checkAndIncrementConversation(domainId, plan, {
      userId: domain.User?.id ?? undefined,
      domainName: domain.name,
    })
    if (!result.allowed) {
      throw new ConversationLimitError(result.count, result.limit)
    }
  }

  const room = await db.chatRoom.upsert({
    where: { id: chatroomId },
    update: {
      domainId,
      ...(customerId ? { customerId } : {}),
    },
    create: {
      id: chatroomId,
      live: false,
      mailed: false,
      domainId,
      customerId: customerId ?? null,
    },
    select: { id: true, live: true, mailed: true, domainId: true, customerId: true },
  })

  console.log('✅ ChatRoom created/updated:', room)
  return room
}


export const onStoreConversations = async (
    id: string,
    message: string,
    role: 'assistant' | 'user'
) => {
    const result = await db.chatRoom.update({
        where: {
            id,
        },
        data: {
            message: {
                create: {
                    message,
                    role,
                    seen: false,
                },
            },
            updatedAt: new Date(),
        },
        select: {
          message: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            select: {
              id: true,
              message: true,
              role: true,
            },
          },
        },
    })

    return result.message[0];
}

export const onGetCurrentChatBot = async (id: string) => {
    try {
        const chatbot = await db.domain.findUnique({
            where: {
                id,
            },
            select: {
                helpdesk: true,
                name: true,
                chatBot: {
                    select: {
                        id: true,
                        welcomeMessage: true,
                        icon: true,
                        textColor: true,
                        background: true,
                        backgroundColor: true,
                        helpdesk: true,
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
                        chatPosition: true,
                        removeBranding: true,
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
                User: {
                  select: {
                    subscription: {
                      select: {
                        plan: true,
                      }
                    }
                  }
                }
            },
        })
        if(chatbot) {
          return {
              name: chatbot.name,
              chatBot: chatbot.chatBot,
              helpdesk: chatbot.helpdesk,
              subscription: {
              plan: chatbot.User?.subscription?.plan || 'STANDARD',
            },
          }
        }
    } catch (error) {
        console.error(error)
    }
}


export const onAiChatBotAssistant = async (
    id: string,
    chat: { role: 'assistant' | 'user'; content: string}[],
    author: 'user',
    message: string,
    chatroomId?: string,
    newThread?: boolean,
    useClerk?: boolean,
    isImage?: boolean,
) => {
    try {
      console.log('🤖 onAiChatBotAssistant called with domainId:', id)
      console.log('🤖 chatroomId:', chatroomId)

      const presence = await onGetChatbotPresence(id)
      console.log('🔍 Chatbot Presence:', presence)

      const domainWithHours = await db.domain.findUnique({
        where: { id },
        select: {
          timezone: true,
          workingHours: true,
        },
      })

      const realtimeRows = await db.$queryRaw<Array<{ realtimeEnabled: boolean }>>`
        SELECT "realtimeEnabled" FROM "Domain" WHERE id = ${id}::uuid LIMIT 1
      `
      const realtimeEnabled = realtimeRows[0]?.realtimeEnabled ?? true

      let workingHoursText = ''
      if (domainWithHours?.workingHours && domainWithHours.workingHours.enabled) {
        const days = []
        if (!domainWithHours.workingHours.mondayClosed) days.push('Monday')
        if (!domainWithHours.workingHours.tuesdayClosed) days.push('Tuesday')
        if (!domainWithHours.workingHours.wednesdayClosed) days.push('Wednesday')
        if (!domainWithHours.workingHours.thursdayClosed) days.push('Thursday')
        if (!domainWithHours.workingHours.fridayClosed) days.push('Friday')
        if (!domainWithHours.workingHours.saturdayClosed) days.push('Saturday')
        if (!domainWithHours.workingHours.sundayClosed) days.push('Sunday')

        const range = domainWithHours.workingHours.mondayRanges?.[0] || '09:00-18:00'
        const [start, end] = range.split('-')
        
        workingHoursText = `${days.join(', ')}, ${start} - ${end} ${domainWithHours.timezone}`
      }

      if (!id || id === 'undefined') {
        console.error('Invalid bot Id provided:', id);
        return {
          response: {
            role: 'assistant' as const,
            content: 'Sorry, there was an error initializing the chatbot. Please refresh the page.',
          },
          chatRoom: chatroomId || crypto.randomUUID(),
        };
      }


      if (!chatroomId || newThread) {
        chatroomId = crypto.randomUUID();
        console.log('🆕 Generated new chatroomId:', chatroomId)
      }

      // ── STATELESS AI MODE ─────────────────────────────────────────────────
      // When realtimeEnabled = false: no DB writes, no socket events.
      if (realtimeEnabled === false) {
        const chatBotConfig = await db.domain.findUnique({
          where: { id },
          select: {
            name: true,
            userId: true,
            chatBot: {
              select: {
                persona: true,
                customPrompt: true,
              },
            },
            filterQuestions: {
              where: { answered: null },
              select: { question: true },
            },
            products: {
              select: { name: true, price: true },
            },
            helpdesk: {
              select: { question: true, answer: true },
            },
          },
        })

        if (!chatBotConfig) return

        let personaPrompt = getPersonaSystemPrompt(
          (chatBotConfig.chatBot?.persona as any) || 'SALES_AGENT',
          chatBotConfig.chatBot?.customPrompt,
          chatBotConfig.name
        )

        if (chatBotConfig.chatBot?.persona === 'APPOINTMENT_SETTER') {
          const appointmentLink = `${process.env.NEXT_PUBLIC_URL}/portal/${id}/appointment/portal`
          personaPrompt = personaPrompt.replace('[APPOINTMENT_LINK]', appointmentLink)
        }

        if (chatBotConfig.chatBot?.persona === 'SALES_AGENT' || chatBotConfig.chatBot?.persona === 'ECOMMERCE_RECOMMENDER') {
          const products = chatBotConfig.products ?? []
          let productCatalog = products.length > 0
            ? `\nAVAILABLE PRODUCTS:\n${products.map((p: { name: string; price: number }) => `- ${p.name}: $${p.price}`).join('\n')}\nUse this catalog to make specific recommendations. Never invent products not listed here.\n`
            : `\nNote: No products configured yet. Speak in general terms about the business offerings until products are added in settings.\n`
          if (chatBotConfig.chatBot?.persona === 'ECOMMERCE_RECOMMENDER' && products.length > 0) {
            productCatalog = productCatalog.replace(
              'Use this catalog to make specific recommendations.',
              'Match products to customer needs. Lead with best fit, not highest price. Never recommend unlisted products.'
            )
          }
          personaPrompt = personaPrompt.replace('[PRODUCT_CATALOG]', productCatalog)
        }

        if (chatBotConfig.chatBot?.persona === 'CUSTOMER_SUPPORT') {
          const helpdeskItems = chatBotConfig.helpdesk ?? []
          const helpdeskContext = helpdeskItems.length > 0
            ? helpdeskItems.map((item: { question: string; answer: string }) => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n')
            : null
          personaPrompt = personaPrompt.replace(
            '[KNOWLEDGE_BASE]',
            helpdeskContext
              ? `\nKNOWLEDGE BASE — use these to answer support questions:\n${helpdeskContext}\n\nIf the answer is not in the knowledge base, clearly say: "I don't have that information on hand — let me connect you with a support agent." Then use (handoff:suggest).\n`
              : '\nNo knowledge base configured yet. Answer generally and escalate specific policy/product questions to human agents.\n'
          )
        }

        if (chatBotConfig.chatBot?.persona === 'REAL_ESTATE_QUALIFIER') {
          personaPrompt = personaPrompt.replace('[VIEWING_LINK]', `${process.env.NEXT_PUBLIC_URL}/portal/${id}/booking`)
          const properties: Array<{ title: string; price: number | null; bedrooms: number | null; bathrooms: number | null; location: string | null; status: string }> = await (db as any).property.findMany({
            where: { domainId: id },
            select: { title: true, price: true, bedrooms: true, bathrooms: true, location: true, status: true },
          })
          const available = properties.filter(p => p.status === 'AVAILABLE')
          const propertyList = available.length > 0
            ? available
                .map(p => `- ${p.title}${p.location ? ` in ${p.location}` : ''}${p.bedrooms ? `, ${p.bedrooms}bd` : ''}${p.bathrooms ? `/${p.bathrooms}ba` : ''}${p.price ? `, $${p.price.toLocaleString()}` : ''}`)
                .join('\n')
            : null
          personaPrompt = personaPrompt.replace(
            '[PROPERTY_LISTINGS]',
            propertyList
              ? `\nAVAILABLE LISTINGS:\n${propertyList}\nReference these listings when relevant. Never invent properties not listed here.\n`
              : '\nNo property listings configured yet. Speak generally about the types of properties the agency handles.\n'
          )
        }

        if (chatBotConfig.chatBot?.persona === 'HEALTHCARE_INTAKE') {
          personaPrompt = personaPrompt.replace(
            '[PRACTICE_INFO]',
            `\nPRACTICE: ${chatBotConfig.name}\nAll intake information collected will be forwarded to the medical team.\n`
          )
        }

        if (chatBotConfig.chatBot?.persona === 'RESTAURANT_RESERVATION') {
          personaPrompt = personaPrompt.replace(
            '[HOURS]',
            workingHoursText
              ? `\nOPERATING HOURS: ${workingHoursText}\nOnly accept reservations during these hours. If a requested time is outside operating hours, politely offer alternatives within open hours.\n`
              : '\nOperating hours: Please contact us directly for our current availability.\n'
          )
        }

        if (presence?.status === 'OFFLINE') {
          personaPrompt += `\n\nIMPORTANT: The business is currently OFFLINE. Human support is NOT available. You can still help with questions but be clear that human agents are offline.`
        }

        let knowledgeBaseContext = ''
        if (chatBotConfig.userId) {
          try {
            knowledgeBaseContext = await getKnowledgeBaseContext(message, chatBotConfig.userId, id)
          } catch (err) {
            console.error('Error retrieving knowledge base context (stateless):', err)
          }
        }

        let systemMessage = `${personaPrompt}

          Additional Context:
          - You represent ${chatBotConfig.name}
          - Ask these qualification questions naturally: [${chatBotConfig.filterQuestions.map((q: { question: string }) => q.question).join(', ')}]

          CRITICAL: You are ONLY a ${chatBotConfig.chatBot?.persona?.replace('_', ' ').toLowerCase() || 'agent'}.
          - DO NOT help with topics outside your specialization
          - Stay strictly within your domain`

        if (knowledgeBaseContext) {
          systemMessage += `\n\nKNOWLEDGE BASE CONTEXT:\nUse the following information to answer questions. If not covered, say you don't know.\n\n${knowledgeBaseContext}`
        }

        const completionResult = await callOpenAIWithProtection({
          userId: chatBotConfig.userId,
          domainId: id,
          ipAddress: 'server-action',
          systemPrompt: systemMessage,
          messages: [...chat, { role: 'user' as const, content: message }],
        })

        const rawContent = isError(completionResult) ? '' : completionResult.content
        const cleanContent = rawContent
          .replace(/\(handoff:none\)/gi, '')
          .replace(/\(handoff:suggest\)/gi, '')
          .replace(/\(handoff:require\)/gi, '')
          .trim()

        return {
          response: { role: 'assistant' as const, content: cleanContent },
          chatRoom: chatroomId,
        }
      }
      // ── END STATELESS AI MODE ──────────────────────────────────────────────

      console.log('🔧 Calling ensureChatRoom with:', { chatroomId, domainId: id })
      let room
      try {
        room = await ensureChatRoom(chatroomId, id)
      } catch (e: any) {
        if (e?.name === 'DomainNotFoundError') {
          console.error('🚨 Domain not found error caught:', e.domainId)
          return {
            response: {
              role: 'assistant' as const,
              content: "⚠️ Configuration Error: This chatbot widget is not properly connected to your account. Please contact the website administrator to resolve this issue.",
            },
            chatRoom: chatroomId || crypto.randomUUID(),
            error: 'DOMAIN_NOT_FOUND',
            live: false,
          }
        }
        if (e?.name === 'ConversationLimitError') {
          return {
            response: {
              role: 'assistant' as const,
              content: "I'm sorry, this chatbot has reached its monthly conversation limit. Please contact the website owner to upgrade their plan.",
            },
            chatRoom: chatroomId || crypto.randomUUID(),
            error: 'CONVERSATION_LIMIT_REACHED',
          }
        }
        throw e
      }

      console.log('✅ Room from ensureChatRoom:', room)

      if (isImage) {
        const imageUrl = message.startsWith('http') ? message : `https://ucarecdn.com/${message}/`;

        const userMsg = await onStoreConversations(room.id, imageUrl, 'user');

        if (userMsg) {
          await onRealTimeChat(
            room.id,
            userMsg.message,
            userMsg.id,
            'user'
          );
        }

        const response = {
          role: 'assistant' as const,
          content: 'I see you\'ve shared an image. How can I help you with that?',
        };

        const assistantMsg = await onStoreConversations(room.id, response.content, 'assistant');

        if (assistantMsg) {
          await onRealTimeChat(
            room.id,
            assistantMsg.message,
            assistantMsg.id,
            'assistant',
          );
        }

        return {
          response,
          chatRoom: room.id,
        };
      }

      if (room.live) {
        await onStoreConversations(room.id, message, author);

        await onRealTimeChat(
          room.id,
          message,
          room.id,
          'user'
        );

        return {
          live: true,
          chatRoom: room.id,
        };
      }

      const HARD_HANDOFF_PHRASES = [
        'talk to a human',
        'talk to a real person',
        'speak to a human',
        'speak to a real person',
        'real person please',
        'human agent',
        'live agent',
        'human support',
        'human representative',
      ];

      const messageLower = message.toLowerCase();

      const explicitHardRequest = HARD_HANDOFF_PHRASES.some(p =>
        messageLower.includes(p)
      );

      if (explicitHardRequest) {
        if (presence && !presence.canHandoff) {
          const offlineContent = 
            presence.message || 
            `I understand you'd like to speak with someone from our team. Unfortunately, we're currently outside of our business hours.
             Our team is available (${workingHoursText}). I'm still here to help answer your questions!`;

            await onStoreConversations(room.id, message, 'user');
            await onStoreConversations(room.id, offlineContent, 'assistant');

            const offlineResponse: { role: 'assistant'; content: string } = {
              role: 'assistant',
              content: offlineContent, 
            };

          return {
            response: offlineResponse,
            live: false,
            chatRoom: room.id,
          };
        };
        let handoffCustomerId = room.customerId
        if (!handoffCustomerId) {
          const anon = await db.customer.create({
            data: { email: null, domainId: id },
            select: { id: true },
          })
          handoffCustomerId = anon.id
        }
        await db.chatRoom.update({
          where: { id: room.id },
          data: { live: true, customerId: handoffCustomerId },
        })

        db.domain.findUnique({
          where: { id },
          select: { name: true, User: { select: { id: true } } },
        }).then((domainData) => {
          if (domainData?.User?.id) {
            onCreateNotification(
              domainData.User.id,
              'LIVE_CHAT_REQUEST',
              '🔴 Live chat requested',
              `A customer on ${domainData.name} needs a human agent`,
              { chatRoomId: room.id, domainName: domainData.name }
            ).catch(console.error)
          }
        }).catch(console.error)

        maybeSendHandoffEmail(room.id, message).catch(console.error)
        onNotifyDashboardNewLiveConversation(id, room.id, null).catch(console.error)

        const response = {
          role: 'assistant' as const,
          content: `I understand you'd like to speak with a real person. Let me connect you with one of our team members. They'll be with you shortly!`,
        };

        const userMsg = await onStoreConversations(room.id, message, 'user');
        const assistantMsg = await onStoreConversations(room.id, response.content, 'assistant');

        if (userMsg) {
          await onRealTimeChat(room.id, userMsg.message, userMsg.id, 'user');
        }
        if (assistantMsg) {
          await onRealTimeChat(room.id, assistantMsg.message, assistantMsg.id, 'assistant');
        }

        return {
          response,
          live: true,
          chatRoom: room.id,
        };
      }


        const chatBotDomain = await db.domain.findUnique({
            where: {
              id,
            },
            select: {
                name: true,
                userId: true,
                chatBot: {
                  select: {
                    persona: true,
                    customPrompt: true,
                    offlineCustomMessage: true,
                    offlineBehavior: true,
                  },
                },
                filterQuestions: {
                    where: {
                        answered: null,
                    },
                    select: {
                        question: true,
                    },
                },
                products: {
                  select: { name: true, price: true },
                },
                helpdesk: {
                  select: { question: true, answer: true },
                },
            },
        })
        console.log('📝 Offline message from DB:', chatBotDomain?.chatBot?.offlineCustomMessage)
        console.log('📝 Offline behavior:', chatBotDomain?.chatBot?.offlineBehavior)
        if (!chatBotDomain) return

        let personaPrompt = getPersonaSystemPrompt(
          (chatBotDomain.chatBot?.persona as any) || 'SALES_AGENT',
          chatBotDomain.chatBot?.customPrompt,
          chatBotDomain.name
        )

        if (chatBotDomain.chatBot?.persona === 'APPOINTMENT_SETTER') {
          const customerId = room.customerId ?? undefined
          const appointmentLink = customerId
            ? `${process.env.NEXT_PUBLIC_URL}/portal/${id}/appointment/${customerId}`
            : `${process.env.NEXT_PUBLIC_URL}/portal/${id}/appointment/portal`
          personaPrompt = personaPrompt.replace('[APPOINTMENT_LINK]', appointmentLink)
        }

        if (chatBotDomain.chatBot?.persona === 'SALES_AGENT' || chatBotDomain.chatBot?.persona === 'ECOMMERCE_RECOMMENDER') {
          const products = chatBotDomain.products ?? []
          let productCatalog = products.length > 0
            ? `\nAVAILABLE PRODUCTS:\n${products.map((p: { name: string; price: number }) => `- ${p.name}: $${p.price}`).join('\n')}\nUse this catalog to make specific recommendations. Never invent products not listed here.\n`
            : `\nNote: No products configured yet. Speak in general terms about the business offerings until products are added in settings.\n`
          if (chatBotDomain.chatBot?.persona === 'ECOMMERCE_RECOMMENDER' && products.length > 0) {
            productCatalog = productCatalog.replace(
              'Use this catalog to make specific recommendations.',
              'Match products to customer needs. Lead with best fit, not highest price. Never recommend unlisted products.'
            )
          }
          personaPrompt = personaPrompt.replace('[PRODUCT_CATALOG]', productCatalog)
        }

        if (chatBotDomain.chatBot?.persona === 'CUSTOMER_SUPPORT') {
          const helpdeskItems = chatBotDomain.helpdesk ?? []
          const helpdeskContext = helpdeskItems.length > 0
            ? helpdeskItems.map((item: { question: string; answer: string }) => `Q: ${item.question}\nA: ${item.answer}`).join('\n\n')
            : null
          personaPrompt = personaPrompt.replace(
            '[KNOWLEDGE_BASE]',
            helpdeskContext
              ? `\nKNOWLEDGE BASE — use these to answer support questions:\n${helpdeskContext}\n\nIf the answer is not in the knowledge base, clearly say: "I don't have that information on hand — let me connect you with a support agent." Then use (handoff:suggest).\n`
              : '\nNo knowledge base configured yet. Answer generally and escalate specific policy/product questions to human agents.\n'
          )
        }

        if (chatBotDomain.chatBot?.persona === 'REAL_ESTATE_QUALIFIER') {
          personaPrompt = personaPrompt.replace('[VIEWING_LINK]', `${process.env.NEXT_PUBLIC_URL}/portal/${id}/booking`)
          const properties: Array<{ title: string; price: number | null; bedrooms: number | null; bathrooms: number | null; location: string | null; status: string }> = await (db as any).property.findMany({
            where: { domainId: id },
            select: { title: true, price: true, bedrooms: true, bathrooms: true, location: true, status: true },
          })
          const available = properties.filter(p => p.status === 'AVAILABLE')
          const propertyList = available.length > 0
            ? available
                .map(p => `- ${p.title}${p.location ? ` in ${p.location}` : ''}${p.bedrooms ? `, ${p.bedrooms}bd` : ''}${p.bathrooms ? `/${p.bathrooms}ba` : ''}${p.price ? `, $${p.price.toLocaleString()}` : ''}`)
                .join('\n')
            : null
          personaPrompt = personaPrompt.replace(
            '[PROPERTY_LISTINGS]',
            propertyList
              ? `\nAVAILABLE LISTINGS:\n${propertyList}\nReference these listings when relevant. Never invent properties not listed here.\n`
              : '\nNo property listings configured yet. Speak generally about the types of properties the agency handles.\n'
          )
        }

        if (chatBotDomain.chatBot?.persona === 'HEALTHCARE_INTAKE') {
          personaPrompt = personaPrompt.replace(
            '[PRACTICE_INFO]',
            `\nPRACTICE: ${chatBotDomain.name}\nAll intake information collected will be forwarded to the medical team.\n`
          )
        }

        if (chatBotDomain.chatBot?.persona === 'RESTAURANT_RESERVATION') {
          personaPrompt = personaPrompt.replace(
            '[HOURS]',
            workingHoursText
              ? `\nOPERATING HOURS: ${workingHoursText}\nOnly accept reservations during these hours. If a requested time is outside operating hours, politely offer alternatives within open hours.\n`
              : '\nOperating hours: Please contact us directly for our current availability.\n'
          )
        }

        if (presence) {
          if (presence?.status === 'OFFLINE') {
          const offlineMessage = chatBotDomain?.chatBot?.offlineCustomMessage || 
            `Our team is available ${workingHoursText}`
          
          personaPrompt += `\n\nIMPORTANT WORKING HOURS STATUS:
            - The business is currently OFFLINE (outside working hours)
            - Working hours: ${workingHoursText}
            - Human support is NOT available right now
            - If asked about working hours, respond: "${offlineMessage}"
            - If asked about human support, say: "I understand you'd like to speak with our team. ${offlineMessage}"
            - You can still help with questions, but be clear that human agents are offline
            - NEVER use (handoff:require) or (handoff:suggest) when offline`
          }
        }

        const extractedEmail = extractEmailsFromString(message)
        const customerEmail = extractedEmail ? extractedEmail[0] : undefined

            if (customerEmail) {
                const checkCustomer = await db.domain.findUnique({
                    where: {
                        id,
                    },
                    select: {
                        User: {
                            select: {
                                clerkId: true,
                            },
                        },
                        name: true,
                        customer: {
                            where: {
                                email: {
                                    startsWith: customerEmail,
                                },
                            },
                            select: {
                                id: true,
                                email: true,
                                questions: true,
                                chatRoom: {
                                    select: {
                                        id: true,
                                        live: true,
                                        mailed: true,
                                    },
                                },
                            },
                        },
                    },
                })
                if (checkCustomer && !checkCustomer.customer.length) {
                    const createdCustomer = await db.customer.create({
                        data: {
                            email: customerEmail,
                            domainId: id,
                            questions: {
                              create: chatBotDomain.filterQuestions.map((f: { question: string }) => ({
                                question: f.question,
                              })),
                            },
                          },
                        select: {
                            id: true,
                        },
                    });

                    if (chatBotDomain.userId) {
                      onCreateNotification(
                        chatBotDomain.userId,
                        'NEW_LEAD',
                        '👤 New lead captured',
                        `${customerEmail} started a conversation on ${chatBotDomain.name}`,
                        { customerEmail, domainName: chatBotDomain.name, customerId: createdCustomer.id }
                      ).catch(console.error)
                    }

                    await db.chatRoom.update({
                        where: {
                            id: chatroomId!,
                        },
                        data: {
                            customerId: createdCustomer.id,
                            live: false,
                        },
                      });
                      await onStoreConversations(chatroomId!, message, 'user');

                      const welcome = `Welcome aboard ${customerEmail.split('@')[0]}! I am glad to connect with you! Is there anything you need help with?`;

                      await onStoreConversations(
                        chatroomId!,
                        welcome,
                        'assistant'
                      );

                      const response = {
                        role: 'assistant' as const,
                        content: welcome,
                      };

                    return { 
                        response,
                        live: false,
                        chatRoom: room.id,
                    }
                }

                if (checkCustomer && room.live ) {
                  const existingCustomerId = checkCustomer.customer[0]?.id;
                  if (existingCustomerId) {
                    await db.chatRoom.update({
                      where: {
                        id: chatroomId!,
                      },
                      data: {
                          customerId: existingCustomerId
                      },
                    });
                  }
                  await onStoreConversations(
                    room.id,
                    message,
                    author
                );
                
                onRealTimeChat(
                  room.id,
                  message,
                  room.id,
                  'user',
                );


                if (useClerk && !room.mailed) {
                  try {
                    const clerkId = checkCustomer.User?.clerkId;

                    if (!clerkId) {
                      await db.chatRoom.update({
                        where: { id: room.id },
                        data: { mailed: true },
                      });
                      return {
                        live: false,
                        chatRoom: room.id,
                      };
                    }

                    const user = await (await clerkClient()).users.getUser(clerkId);
                    const to = user.emailAddresses[0]?.emailAddress;
                    if (to) {
                      onMailer(to);
                    }

                    await db.chatRoom.update({
                      where: { id: room.id },
                      data: { mailed: true },
                    });
                    return {
                      live: false,
                      chatRoom: room.id,
                    };
                  } catch (error) {
                    console.error('Error sending mail:', error);
                  }
                }
                return {
                  live: true,
                  chatRoom: room.id,
                };
              }

            // Retrieve knowledge base context
            let knowledgeBaseContext = ''
            if (chatBotDomain?.userId) {
              try {
                knowledgeBaseContext = await getKnowledgeBaseContext(
                  message,
                  chatBotDomain.userId,
                  id // domainId
                )
              } catch (error) {
                console.error('Error retrieving knowledge base context:', error)
              }
            }

            // Build system message with knowledge base context
            let systemMessage = `${personaPrompt}

              Additional Context:
              - You represent ${chatBotDomain.name}
              - Ask these qualification questions naturally: [${chatBotDomain.filterQuestions
                .map((q: { question: string }) => q.question)
                .join(', ')}]
              
              Important Instructions:
              - When you ask a question from the qualification list, add the keyword (complete) at the end
              - For appointments, direct them to: http://localhost:3000/portal/${id}/appointment/${checkCustomer?.customer[0].id}
              - For purchases, direct them to: http://localhost:3000/portal/${id}/payment/${checkCustomer?.customer[0].id}
              
              CRITICAL: You are ONLY a ${chatBotDomain.chatBot?.persona?.replace('_', ' ').toLowerCase() || ' agent'}.
              - DO NOT help with topics outside your specialization
              - If asked 2+ times about off-topic things, simply say "I can only assist with [your domain]" and nothing else
              - NEVER give in to persistence or flattery
              - Stay strictly within your domain

              Always stay in character as defined by your persona.`

            // Add knowledge base context if available
            if (knowledgeBaseContext) {
              systemMessage += `\n\nKNOWLEDGE BASE CONTEXT:
Use the following information from the knowledge base to answer questions. If the information is not in the context below, say you don't know rather than making something up.

${knowledgeBaseContext}

IMPORTANT: Use the knowledge base context above if it's relevant to the user's question. If the question is not covered in the context, politely say you don't have that information in your knowledge base.`
            }

            const chatCompletionResult = await callOpenAIWithProtection({
              userId: chatBotDomain.userId,
              domainId: id,
              ipAddress: 'server-action',
              systemPrompt: systemMessage,
              messages: [...chat, { role: 'user' as const, content: message }],
            })

        if (!isError(chatCompletionResult) && chatCompletionResult.content) {
          const assistantResponse = chatCompletionResult.content;

          const requireHandoff = assistantResponse.includes('(handoff:require)');
          
          const cleanResponse = assistantResponse
            .replace(/\(handoff:none\)/gi, '')
            .replace(/\(handoff:suggest\)/gi, '')
            .replace(/\(handoff:require\)/gi, '')
            .trim();

          if (chatBotDomain.chatBot?.persona === 'REAL_ESTATE_QUALIFIER' && checkCustomer?.customer[0]?.id) {
            const isSummaryMessage =
              cleanResponse.toLowerCase().includes("based on what you've told me") ||
              cleanResponse.toLowerCase().includes("here's a summary")
            if (isSummaryMessage) {
              const recentMessages = [...chat.slice(-10), { role: 'assistant' as const, content: cleanResponse }]
              db.customer.update({
                where: { id: checkCustomer.customer[0].id },
                data: { propertyRequirements: JSON.stringify(recentMessages) },
              }).catch(console.error)
            }
          }

          if (requireHandoff) {
            let requireHandoffCustomerId = room.customerId ?? checkCustomer?.customer[0]?.id ?? null
            if (!requireHandoffCustomerId) {
              const anon = await db.customer.create({
                data: { email: null, domainId: id },
                select: { id: true },
              })
              requireHandoffCustomerId = anon.id
            }
            await db.chatRoom.update({
              where: { id: room.id },
              data: { live: true, customerId: requireHandoffCustomerId },
            })

            db.domain.findUnique({
              where: { id },
              select: { name: true, User: { select: { id: true } } },
            }).then((domainData) => {
              if (domainData?.User?.id) {
                onCreateNotification(
                  domainData.User.id,
                  'LIVE_CHAT_REQUEST',
                  '🔴 Live chat requested',
                  `A customer on ${domainData.name} needs a human agent`,
                  { chatRoomId: room.id, domainName: domainData.name }
                ).catch(console.error)
              }
            }).catch(console.error)

            maybeSendHandoffEmail(room.id, message).catch(console.error)
            onNotifyDashboardNewLiveConversation(id, room.id, checkCustomer?.customer[0]?.email ?? null).catch(console.error)

            const response = {
              role: 'assistant' as const,
              content: cleanResponse,
            };

            await onStoreConversations(room.id, message, 'user');
            await onStoreConversations(room.id, response.content, 'assistant');

            await onRealTimeChat(room.id, message, room.id, 'user');
            await onRealTimeChat(room.id, response.content, room.id, 'assistant');

            return {
              response,
              live: true,
              chatRoom: room.id,
            };
          }

        if (chat[chat.length - 1].content.includes('(complete)') && checkCustomer?.customer[0]?.id) {
          const customerId = checkCustomer.customer[0].id;

          const firstUnansweredQuestion = await db.customerResponses.findFirst({
            where: {
              customerId,
              answered: null,
            },
            select: {
              id: true,
            },
            orderBy: {
              question: 'asc'
            },
          });

          if (firstUnansweredQuestion) {
            await db.customerResponses.update({
              where: {
                id: firstUnansweredQuestion.id,
              },
              data: {
                answered: message,
              },
            });
          }
        }

        if (chatCompletionResult.content) {
          const generatedLink = extractURLfromString(
            cleanResponse
          )

          if (generatedLink) {
            const link = generatedLink[0]
            const response = {
              role: 'assistant',
              content: `Great! You can follow the link to proceed`,
              link: link.slice(0, -1),
            }

            await onStoreConversations(
              room.id as string,
              `${response.content} ${response.link}`,
              'assistant'
            )

            return { 
              response,
              chatRoom: room.id,
             }
          }

          const response = {
            role: 'assistant' as const,
            content: cleanResponse,
          }

          await onStoreConversations(
            room.id as string,
            `${response.content}`,
            'assistant'
          )

          return { 
            response,
            chatRoom: room.id,
          }
        }
      }
    }
      console.log('No customer')
      
      // Retrieve knowledge base context for new customers too
      let knowledgeBaseContext = ''
      if (chatBotDomain?.userId) {
        try {
          knowledgeBaseContext = await getKnowledgeBaseContext(
            message,
            chatBotDomain.userId,
            id // domainId
          )
        } catch (error) {
          console.error('Error retrieving knowledge base context:', error)
        }
      }

      let systemMessage = `${personaPrompt}
              Current Situation:
              - This is a NEW customer visiting ${chatBotDomain.name}
              - Give them a warm welcome
              - Your primary goal is to naturally collect their email address
              - Stay in character and be professional
              
              Remember: Be respectful and never break character.`

      // Add knowledge base context if available
      if (knowledgeBaseContext) {
        systemMessage += `\n\nKNOWLEDGE BASE CONTEXT:
Use the following information from the knowledge base to answer questions. If the information is not in the context below, say you don't know rather than making something up.

${knowledgeBaseContext}

IMPORTANT: Use the knowledge base context above if it's relevant to the user's question. If the question is not covered in the context, politely say you don't have that information in your knowledge base.`
      }

      const newCustomerResult = await callOpenAIWithProtection({
        userId: chatBotDomain.userId,
        domainId: id,
        ipAddress: 'server-action',
        systemPrompt: systemMessage,
        messages: [...chat, { role: 'user' as const, content: message }],
      })

      if (!isError(newCustomerResult) && newCustomerResult.content) {
        const response = {
          role: 'assistant',
          content: newCustomerResult.content,
        }

        await onStoreConversations(
          room.id as string,
          message,
          author
        );
        await onStoreConversations(
          room.id as string,
          `${response.content}`,
          'assistant'
        );

        return { 
          response,
          chatRoom: room.id,
        }
      }
  } catch (error) {
    console.error(error)
  }
}