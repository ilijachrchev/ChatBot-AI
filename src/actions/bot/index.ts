"use server"

import { client as db } from "@/lib/prisma"
import { extractEmailsFromString, extractURLfromString } from "@/lib/utils"
import { onRealTimeChat } from "../conversation"
import { clerkClient } from "@clerk/nextjs/server"
import { onMailer } from "../mailer"
import OpenAi from "openai"
import { getPersonaSystemPrompt } from "@/constants/personas"
import { onGetChatbotPresence } from "../chatbot/presence"
import { off } from "process"
import { getKnowledgeBaseContext } from "@/lib/knowledge-base/retrieve"

const openai = new OpenAi({
    apiKey: process.env.OPEN_AI_KEY,
})

const ensureChatRoom = async (chatroomId: string, domainId: string, customerId?: string) => {
  console.log('🔧 ensureChatRoom called with:', { chatroomId, domainId })

  const room = await db.chatRoom.upsert({
    where: { id: chatroomId },
    update: {
      domainId: domainId,
    },
    create: {
       id: chatroomId ,
       live: false,
       mailed: false,
       domainId: domainId,
       customerId: customerId,
      },
    select: { id: true, live: true, mailed: true, domainId: true },
  });

  console.log('✅ ChatRoom created/updated:', room)
  return room;
};

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
        console.log(error)
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

      console.log('🔧 Calling ensureChatRoom with:', { chatroomId, domainId: id })
      const room = await ensureChatRoom(chatroomId, id);
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
        await db.chatRoom.update({
          where: { id: room.id },
          data: { live: true },
        });

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
                    console.log('Error sending mail:', error);
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

            const messages: any[] = [
              {
                role: 'assistant',
                content: systemMessage,
              },
            ]

            // Add knowledge base context as a separate message if available (alternative approach)
            if (knowledgeBaseContext) {
              messages.push({
                role: 'system',
                content: `Knowledge Base Context:\n${knowledgeBaseContext}`,
              })
            }

            messages.push(...chat)
            messages.push({
              role: 'user',
              content: message,
            })

            const chatCompletion = await openai.chat.completions.create({
              messages,
              model: 'gpt-3.5-turbo',
            })

        if (chatCompletion.choices[0].message.content) {
          const assistantResponse = chatCompletion.choices[0].message.content;

          const requireHandoff = assistantResponse.includes('(handoff:require)');
          
          const cleanResponse = assistantResponse
            .replace(/\(handoff:none\)/gi, '')
            .replace(/\(handoff:suggest\)/gi, '')
            .replace(/\(handoff:require\)/gi, '')
            .trim();

          if (requireHandoff) {
            await db.chatRoom.update({
              where: { id: room.id },
              data: { live: true },
            });

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

        if (chatCompletion) {
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

      const messages: any[] = [
        {
          role: 'assistant',
          content: systemMessage,
        },
      ]

      if (knowledgeBaseContext) {
        messages.push({
          role: 'system',
          content: `Knowledge Base Context:\n${knowledgeBaseContext}`,
        })
      }

      messages.push(...chat)
      messages.push({
        role: 'user',
        content: message,
      })

      const chatCompletion = await openai.chat.completions.create({
        messages,
        model: 'gpt-3.5-turbo',
      })

      if (chatCompletion) {
        const response = {
          role: 'assistant',
          content: chatCompletion.choices[0].message.content,
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
    console.log(error)
  }
}