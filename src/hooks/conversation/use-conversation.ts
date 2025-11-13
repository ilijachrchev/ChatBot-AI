"use client"
import { onGetChatMessages, onGetDomainChatRooms, onOwnerSendMessage, onRealTimeChat, onViewUnReadMessages } from "@/actions/conversation"
import { useChatContext } from "@/context/user-chat-context"
import { getMonthName, pusherClient } from "@/lib/utils"
import { ConversationSearchSchema, ConversationSearchForm, ChatBotMessageSchema } from "@/schemas/conversation.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod";

type ConversationSearchFormTyped = z.infer<typeof ConversationSearchSchema>;
type ChatBotMessageForm = z.infer<typeof ChatBotMessageSchema>;

export const useConversation = () => {
    const { register, watch } = useForm<ConversationSearchFormTyped>({
      resolver: zodResolver(ConversationSearchSchema),
      mode:'onChange',
      defaultValues: { query: "", domain: "" },
    });
    const { setLoading: loadMessages, setChats, setChatRoom } = useChatContext()
    const [chatRooms, setChatRooms] = useState<
        {
            chatRoom: {
                id: string
                createdAt: Date
                message: {
                    message: string
                    createdAt: Date
                    seen: boolean
                }[]
            }[]
            email: string | null
        }[]
    >([])
    const [loading, setLoading] = useState<boolean>(false)
    useEffect(() => {
        const search = watch(async (value) => {
          if (!value.domain) return
            setLoading(true)
             try {
            const rooms = await onGetDomainChatRooms(value.domain!)
            if (rooms) {
                setLoading(false)
                setChatRooms(rooms.customer)
            }
        } catch (error) {
            console.log(error)
        }
        })
        return () => search.unsubscribe()
    }, [watch])

    const onGetActiveChatMessages = async (id: string) => {
        try {
          setChatRoom(id)
            loadMessages(true)

            const room = await onGetChatMessages(id)
            const msgs = room?.message ?? []

            if (room) {
                setChatRoom(id)
                loadMessages(false)
                setChats(msgs)

                await onViewUnReadMessages(id)

                setChatRooms(prev =>
                (prev || []).map(r => {
                  if (r.chatRoom?.[0]?.id === id) return r
                  const firstMsg = r.chatRoom[0]?.message?.[0]
                  return {
                    ...r,
                    chatRoom: [
                      {
                        ...r.chatRoom[0],
                        message: firstMsg
                          ? [{...firstMsg, seen: true}]
                          : [],
                      },
                    ],
                  }
                }
              ))
            }
        } catch (error) {
            console.log(error)
        }
    }
    return {
        register,
        chatRooms,
        loading,
        onGetActiveChatMessages,
    }
}
export const useChatTime = (createdAt: Date, roomId: string) => {
  const { chatRoom } = useChatContext()
  const [messageSentAt, setMessageSentAt] = useState<string>()
  const [urgent, setUrgent] = useState<boolean>(false)

  const onSetMessageRecievedDate = () => {
    const dt = new Date(createdAt)
    const current = new Date()
    const currentDate = current.getDate()
    const hr = dt.getHours()
    const min = dt.getMinutes()
    const date = dt.getDate()
    const month = dt.getMonth()
    const difference = currentDate - date

    if (difference <= 0) {
      setMessageSentAt(`${hr}:${min}${hr > 12 ? 'PM' : 'AM'}`)
      if (current.getHours() - dt.getHours() < 2) {
        setUrgent(true)
      }
    } else {
      setMessageSentAt(`${date} ${getMonthName(month)}`)
    }
  }

  useEffect(() => {
    const markSeen = async () => {
      if (chatRoom == roomId) {
        await onViewUnReadMessages(roomId)
      }
    }
    markSeen()
  }, [chatRoom, roomId])

  useEffect(() => {
    onSetMessageRecievedDate()
  }, [])

  return { messageSentAt, urgent }
}
  
export const useChatWindow = () => {
  const { chats, loading, setChats, chatRoom } = useChatContext()
  const messageWindowRef = useRef<HTMLDivElement | null>(null)
  const { register, handleSubmit, reset } = useForm<ChatBotMessageForm>({
    resolver: zodResolver(ChatBotMessageSchema as any) as any,
    mode: 'onChange',
  });
  const onScrollToBottom = () => {
    messageWindowRef.current?.scroll({
      top: messageWindowRef.current.scrollHeight,
      left: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    onScrollToBottom()
  }, [chats, messageWindowRef])

  useEffect(() => {
    if (chatRoom) {
      pusherClient.subscribe(chatRoom)
      pusherClient.bind('realtime-mode', (data: any) => {
        setChats((prev) => [...prev, data.chat])
      })

      return () => {
        pusherClient.unbind('realtime-mode')
        pusherClient.unsubscribe(chatRoom)
      }
    }
  }, [chatRoom])


  const onHandleSentMessage = handleSubmit(async (values) => {
    try {
      if (!values.content?.trim()) return
      reset()
      const message = await onOwnerSendMessage(
        chatRoom!,
        values.content,
        'assistant'
      )
      if (message) {

        await onRealTimeChat(
          chatRoom!,
          message.message,
          message.id,
          'assistant'
        )
      }
    } catch (error) {
      console.log(error)
    }
  })
  return {
    messageWindowRef,
    register,
    onHandleSentMessage,
    chats,
    loading,
    chatRoom,
  }
}