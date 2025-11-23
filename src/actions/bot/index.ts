"use server"

import { client as db } from "@/lib/prisma"
import { extractEmailsFromString, extractURLfromString } from "@/lib/utils"
import { onRealTimeChat } from "../conversation"
import { clerkClient } from "@clerk/nextjs/server"
import { onMailer } from "../mailer"
import OpenAi from "openai"

const openai = new OpenAi({
    apiKey: process.env.OPEN_AI_KEY,
})

const ensureChatRoom = async (chatroomId: string) => {
  return db.chatRoom.upsert({
    where: { id: chatroomId },
    update: {},
    create: {
       id: chatroomId ,
       live: false,
       mailed: false,
      },
    select: { id: true, live: true, mailed: true },
  });
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
                        helpdesk: true,
                    },
                },
            },
        })
        if(chatbot) {
            return chatbot
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
      }
      const room = await ensureChatRoom(chatroomId);

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

      const realtimeKeywords = [
        'manager', 'human', 'real person', 'speak to someone',
        'talk to someone', 'customer service', 'representatiive', 'agent', 'support', 'help me', 'assistance'
      ];

      const messagelower = message.toLowerCase();
      const needsRealtime = realtimeKeywords.some(keyword =>
        messagelower.includes(keyword)
      );

      if (needsRealtime) {
        await db.chatRoom.update({
          where: {
            id: room.id,
          },
          data: {
            live: true,
          },
        });

        const response = {
          role: 'assistant' as const,
          content: 'I understand you\'d like to speak with a real person. Let me connect you with one of our team members. They\'ll be with you shortly!' 
        };
        const userMsg = await onStoreConversations(room.id, message, 'user');

        const assistantMsg = await onStoreConversations(room.id, response.content, 'assistant');

        if (userMsg) {
          await onRealTimeChat(
            room.id,
            userMsg.message,
            userMsg.id,
            'user'
          );
        }
        if (assistantMsg) {
          await onRealTimeChat(
            room.id,
            assistantMsg.message,
            assistantMsg.id,
            'assistant'
          );
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
        if (!chatBotDomain) return
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
                              create: chatBotDomain.filterQuestions.map(f => ({
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

             const chatCompletion = await openai.chat.completions.create({
          messages: [
            {
              role: 'assistant',
              content: `
              You will get an array of questions that you must ask the customer. 
              
              Progress the conversation using those questions. 
              
              Whenever you ask a question from the array i need you to add a keyword at the end of the question (complete) this keyword is extremely important. 
              
              Do not forget it.

              only add this keyword when your asking a question from the array of questions. No other question satisfies this condition

              Always maintain character and stay respectfull.

              The array of questions : [${chatBotDomain.filterQuestions
                .map((questions) => questions.question)
                .join(', ')}]

              if the customer says something out of context or inapporpriate. Simply say this is beyond you and you will get a real user to continue the conversation. And add a keyword (realtime) at the end.

              if the customer agrees to book an appointment send them this link http://localhost:3000/portal/${id}/appointment/${
                checkCustomer?.customer[0].id
              }

              if the customer wants to buy a product redirect them to the payment page http://localhost:3000/portal/${id}/payment/${
                checkCustomer?.customer[0].id
              }
          `,
            },
            ...chat,
            {
              role: 'user',
              content: message,
            },
          ],
          model: 'gpt-3.5-turbo',
        })

        if (chatCompletion.choices[0].message.content?.includes('(realtime)')) {
          await db.chatRoom.update({
            where: { id: room.id },
            data: { live: true },
          });

          const response = {
            role: 'assistant',
            content: chatCompletion.choices[0].message.content.replace('(realtime)', ''),
          };

          await onStoreConversations(
            room.id as string,
            response.content,
            'assistant'
          );

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
            chatCompletion.choices[0].message.content as string
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
            content: chatCompletion.choices[0].message.content,
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
      console.log('No customer')
      const chatCompletion = await openai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: `
            You are a highly knowledgeable and experienced sales representative for a ${chatBotDomain.name} that offers a valuable product or service. Your goal is to have a natural, human-like conversation with the customer in order to understand their needs, provide relevant information, and ultimately guide them towards making a purchase or redirect them to a link if they havent provided all relevant information.
            Right now you are talking to a customer for the first time. Start by giving them a warm welcome on behalf of ${chatBotDomain.name} and make them feel welcomed.

            Your next task is lead the conversation naturally to get the customers email address. Be respectful and never break character

          `,
          },
          ...chat,
          {
            role: 'user',
            content: message,
          },
        ],
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