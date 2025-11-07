import { onAiChatBotAssistant, onGetCurrentChatBot } from "@/actions/bot"
import { postToParent, pusherClient } from "@/lib/utils"
import { ChatBotMessageProps, ChatBotMessageSchema } from "@/schemas/conversation.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { string } from "zod"
import { UploadClient } from '@uploadcare/upload-client'

const upload = new UploadClient({
    publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
})

export const useChatBot = () => {
    //WIP setup real time with pusher
    const { register, handleSubmit, reset } = 
    useForm<ChatBotMessageProps>({
        resolver: zodResolver(ChatBotMessageSchema as any) as any,
    })
    const [currentBot, setCurrentBot] = useState<
        | {
            name: string
            chatBot: {
                id: string | null
                icon: string | null
                welcomeMessage: string | null
                background: string | null
                textColor: string | null
                helpdesk: boolean
            } | null
            helpdesk: {
                id: string
                question: string
                answer: string
                domainId: string | null
            }[]
        }
        | undefined
    >()
    const messageWindowRef = useRef<HTMLDivElement | null>(null)
    const [botOpened, setBotOpened] = useState<boolean>(false)
    const onOpenChatBot = () => setBotOpened((prev) => !prev)
    const [loading, setLoading] = useState<boolean>(true)
    const [onChats, setOnChats] = useState<
        { role: 'assistant' | 'user'; content: string; link?: string }[]
    >([])
    const [onAiTyping, setOnAiTyping] = useState<boolean>(false)
    const [currentBotId, setCurrentBotId] = useState<string>()
    const [onRealTime, setOnRealTime] = useState<
        { chatroom: string; mode: boolean } | undefined
    >(undefined)

    const onScrollToBottom = () => {
        messageWindowRef.current?.scroll({
            top: messageWindowRef.current.scrollHeight,
            left: 0,
            behavior: 'smooth'
        })
    }

    useEffect(() => {
        onScrollToBottom()
    }, [onChats, messageWindowRef])

    useEffect(() => {
        postToParent(
            JSON.stringify({
                width: botOpened ? 550 : 80,
                height: botOpened ? 800 : 80,
            })
        )
    }, [botOpened])

    let limitRequest = 0;

    useEffect(() => {
        window.addEventListener("message", (e) => {
            const botid = e.data
            if (limitRequest < 1 && typeof botid == 'string') {
            onGetDomainChatBot(botid)
            limitRequest++
            }
        })
        
    }, [])

    const onGetDomainChatBot = async (id: string) => {
        setCurrentBotId(id)
        const chatbot = await onGetCurrentChatBot(id)
        if (chatbot) {
            setOnChats((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    content: chatbot.chatBot?.welcomeMessage!,
                },
            ])
            setCurrentBot(chatbot)
            setLoading(false)
        }
    }
    
        const setChatroomId = (id?: string) => {
            if (!id) return;
            try {
                localStorage.setItem('chatroomId', id!)
            } catch {}
        };

        const clearChatroomId = () => {
            try {
                localStorage.removeItem('chatroomId')
            } catch {}
        };

    const onStartChatting = handleSubmit(async (values) => {
        reset()

        const chatroomId = getOrCreateChatroomId();

        if(values.image.length) {
            const uploaded = await upload.uploadFile(values.image[0])
            setOnChats((prev: any) => [
                ...prev,
                {
                    role: 'user',
                    content: uploaded.uuid,
                },
            ])
            setOnAiTyping(true)

            const response = await onAiChatBotAssistant(
                currentBotId!,
                onChats,
                'user',
                uploaded.uuid,
                chatroomId,
            )

            if (response) {
                if (response.chatRoom) setChatroomId(response.chatRoom);
                setOnAiTyping(false)
                if (response.live) {
                    setOnRealTime((prev) => ({
                        ...prev,
                        chatroom: response.chatRoom,
                        mode: response.live,
                    }))
                } else {
                    setOnChats((prev: any) => [...prev, response.response])
                }
            }
        }

        if (values.content) {
            setOnChats((prev: any) => [
                ...prev,
                {
                    role: 'user',
                    content: values.content,
                },
            ])
            setOnAiTyping(true)

            const response = await onAiChatBotAssistant(
                currentBotId!,
                onChats,
                'user',
                values.content,
                chatroomId,
            )
            
            if (response) {
                if (response.chatRoom) setChatroomId(response.chatRoom);
                setOnAiTyping(false)
                if (response.live) {
                    setOnRealTime((prev) => ({
                        ...prev,
                        chatroom: response.chatRoom,
                        mode: response.live,
                    }))
                } else {
                    setOnChats((prev: any) => [...prev, response.response])
                }
            }
        }
    })

    const getOrCreateChatroomId = () => {
        if (onChats.length === 0) {
            const id = crypto.randomUUID();
            try { localStorage.setItem('chatroomId', id); } catch {}
            return id;
        }

        let chatroomId = localStorage.getItem('chatroomId');
        if (!chatroomId) {
            chatroomId = crypto.randomUUID();
            try { localStorage.setItem('chatroomId', chatroomId); } catch {}
        }
        return chatroomId;
    };

    const startNewChat = () => {
        clearChatroomId();
        setOnChats([]);
        setOnRealTime(undefined);
    };

    return {
        botOpened,
        onOpenChatBot,
        onStartChatting,
        onChats,
        register,
        onAiTyping,
        messageWindowRef,
        currentBot,
        loading,
        setOnChats,
        onRealTime,
        startNewChat,
    }
}

// export const useRealTime = (
//   chatRoom: string,
//   setChats: React.Dispatch<
//     React.SetStateAction<
//       {
//         role: 'user' | 'assistant'
//         content: string
//         link?: string | undefined
//       }[]
//     >
//   >
// ) => {
//   const counterRef = useRef(1)

//   useEffect(() => {
//     pusherClient.subscribe(chatRoom)
//     pusherClient.bind('realtime-mode', (data: any) => {
//       console.log('✅', data)
//       if (counterRef.current !== 1) {
//         setChats((prev: any) => [
//           ...prev,
//           {
//             role: data.chat.role,
//             content: data.chat.message,
//           },
//         ])
//       }
//       counterRef.current += 1
//     })
//     return () => {
//       pusherClient.unbind('realtime-mode')
//       pusherClient.unsubscribe(chatRoom)
//     }
//   }, [])
// }