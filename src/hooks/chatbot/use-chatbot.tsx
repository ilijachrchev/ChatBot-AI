import { onAiChatBotAssistant, onGetCurrentChatBot } from "@/actions/bot"
import { getSocketClient, postToParent, } from "@/lib/utils"
import { ChatBotMessageProps, ChatBotMessageSchema } from "@/schemas/conversation.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { onGetChatRoomLiveStatus } from "@/actions/conversation"


const helperGenerateUUID = (): string => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const useChatBot = () => {
    const { register, handleSubmit, reset, setValue } = 
    useForm<ChatBotMessageProps>({
        resolver: zodResolver(ChatBotMessageSchema as any),
    })
    const [currentBot, setCurrentBot] = useState<
        | {
            name: string
            subscription: {
                plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
            }
            chatBot: {
                id: string
                icon: string | null
                welcomeMessage: string | null
                background: string | null
                backgroundColor: string | null
                textColor: string | null
                helpdesk: boolean
                persona?: string | null
                chatbotTitle?: string | null
                chatbotSubtitle?: string | null
                userBubbleColor?: string | null
                botBubbleColor?: string | null
                userTextColor?: string | null
                botTextColor?: string | null
                buttonStyle?: string | null
                bubbleStyle?: string | null
                showAvatars?: boolean | null
                widgetSize?: string | null
                widgetStyle?: string | null
                chatPosition?: string | null
                removeBranding?: boolean | null
                customCss?: string | null
                showPresenceBadge?: boolean | null
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
    const requestedRef = useRef(false);
    const [onChats, setOnChats] = useState<
        { role: 'assistant' | 'user'; content: string; link?: string }[]
    >([])
    const [onAiTyping, setOnAiTyping] = useState<boolean>(false)
    const [currentBotId, setCurrentBotId] = useState<string>()
    const [onRealTime, setOnRealTime] = useState<
        { chatroom: string; mode: boolean } | undefined
    >(undefined)
    const [activeChatRoomId, setActiveChatRoomId] = useState<string | undefined>(undefined)


    useEffect(() => {
        const checkSession = async () => {
            const chatroomId = getOrCreateChatroomId()

            if (!chatroomId) return

            const result = await onGetChatRoomLiveStatus(chatroomId)

            if (!result) return

            if (result.live && result.status === 'RESOLVED') {
                clearChatroomId()
                setOnRealTime(undefined)
                return
            }

            if (result.live && result.status !== 'RESOLVED') {
                setOnRealTime({
                    chatroom: chatroomId,
                    mode: true,
                })
                return
            }

            setOnRealTime({
                chatroom: chatroomId,
                mode: false,
            })
        }
        checkSession()
    }, [])

    
    const [imagePreview, setImagePreview] = useState<string | null>(null)

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
                width: 80,
                height: 80,
            })
        )
    }, [])

    useEffect(() => {
        postToParent(
            JSON.stringify({
                width: botOpened ? 550 : 80,
                height: botOpened ? 800 : 80,
            })
        )
    }, [botOpened])
    
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.source !== window.parent) return;

            console.log('Received bot ID vie postMessage:', e.data);
            const data = e.data;

            if (data === 'ready') return;

            try {
                const parsed = JSON.parse(data);
                if (parsed.width && parsed.height) {
                    return;
                }
            } catch {}

            if (typeof data === 'string' && data.length > 0 && !currentBotId) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (uuidRegex.test(data)) {
                console.log('Fetching chatbot for ID:', data);
                setCurrentBotId(data);
                onGetDomainChatBot(data);
            }
        }
    };

    window.addEventListener('message', handleMessage);

    if (window.parent !== window) {
        console.log('Requesting bot ID from parent window...');
        postToParent('ready');
    }

    return () => {
        window.removeEventListener('message', handleMessage);
    };
}, [currentBotId]);
    

    const onGetDomainChatBot = async (id: string) => {
        try {
            console.log('Fetching chatbot for ID:', id);
            const chatbot = await onGetCurrentChatBot(id);
            console.log('Fetched chatbot data:', chatbot);

            if (chatbot) {
                const welcome = chatbot.chatBot?.welcomeMessage ?? `Hi! I am ${chatbot.name}. How can I assist you today?`;
                setOnChats([
                    {
                        role: 'assistant',
                        content: welcome,
                    }
                 ]);
                 setCurrentBot(chatbot);
                 setLoading(false);
            } else {
                console.error('No chatbot found for ID:', id);
            }
        } catch (error) {
            console.error('Error fetching chatbot for ID:', id, error);
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
        const chatroomId = getOrCreateChatroomId()

        if (onRealTime?.mode && values.content) {
            setOnChats((prev: any) => [
                ...prev,
                {
                    role: 'user',
                    content: values.content,
                },
            ])

            reset()

            await fetch('/api/realtime/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatroomId,
                    message: values.content,
                }),
            })

            return
        }
        console.log('========== FORM SUBMITTED ==========')
        console.log('✅ FORM VALID - Values:', values)
        console.log('📋 Image:', values.image)
        console.log('📋 Image length:', values.image?.length)
        console.log('📋 Content:', values.content)
        console.log('====================================')
        
        if (!currentBotId) {
            console.error('Current bot ID is not set.');
            return;
        }

        if ((!values.image || !values.image.length) && !values.content) {
            return;
        } 
    

        if (values.image && values.image.length) {
            try {
                console.log('📤 Starting upload...', values.image[0])

                const formData = new FormData()
                formData.append('file', values.image[0])

                const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://localhost:4000'
                const uploadResponse = await fetch(`${socketUrl}/api/upload`, {
                    method: 'POST',
                    body: formData,
                })

                if (!uploadResponse.ok) {
                    throw new Error('Upload failed')
                }

                const { url } = await uploadResponse.json()
                console.log('✅ Upload complete:', url)

                reset()
                setImagePreview(null)

                setOnChats((prev: Array<{ role: 'assistant' | 'user'; content: string; link?: string }>) => [
                    ...prev,
                    {
                        role: 'user',
                        content: url,
                    },
                ])
                setOnAiTyping(true)

                const response = await onAiChatBotAssistant(
                    currentBotId,
                    onChats,
                    'user',
                    url,
                    chatroomId,
                    false,
                    false,
                    true,
                )

                if (response) {
                    if (response.chatRoom) { setChatroomId(response.chatRoom); setActiveChatRoomId(response.chatRoom); }
                    setOnAiTyping(false)
                    if (response.response) {
                        setOnChats((prev: any) => [...prev, response.response])
                    }
                    if (response.live) {
                        setOnRealTime({
                            chatroom: response.chatRoom,
                            mode: response.live,
                        })
                    }
                }
                return;
            } catch (error) {
                console.error('❌ Image upload error:', error)
                setOnAiTyping(false)
                setImagePreview(null)

                setOnChats((prev: any) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: 'Sorry, there was an error uploading your image. Please try again.',
                    },
                ])
                return;
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

            reset() 

            setOnAiTyping(true)

            const response = await onAiChatBotAssistant(
                currentBotId,
                onChats,
                'user',
                values.content,
                chatroomId,
                false,
                false,
            )

            if (response) {
                if (response.chatRoom) { setChatroomId(response.chatRoom); setActiveChatRoomId(response.chatRoom); }
                setOnAiTyping(false)
                if (response.response) {
                    setOnChats((prev: any) => [...prev, response.response])
                }
                if (response.live) {
                    setOnRealTime({
                        chatroom: response.chatRoom,
                        mode: response.live,
                    })
                }
            }
        }
    },
(errors) => {
    console.log('❌ FORM VALIDATION FAILED - Errors:', errors)
  }
)

    const onImageChange = (E: React.ChangeEvent<HTMLInputElement>) => {
        const file = E.target.files?.[0]
        if (file) {
            setValue('image', E.target.files)
            const reader = new FileReader()
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }
    const removeImage = () => {
        setImagePreview(null)
        setValue('image', null as unknown as FileList)
    }


    const getOrCreateChatroomId = () => {
        let chatroomId: string | null = null;

        try {
            chatroomId = localStorage.getItem('chatroomId');
        } catch {}

        if (!chatroomId) {
            chatroomId = helperGenerateUUID();
            try {
                 localStorage.setItem('chatroomId', chatroomId); 
                } catch {}
    }
        return chatroomId;
    };


    const startNewChat: () => void = () => {
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
        imagePreview,
        onImageChange,
        removeImage,
        currentBotId,
        activeChatRoomId,
    }
}

export const useRealTime = (
  chatRoom: string,
  setChats: React.Dispatch<
    React.SetStateAction<
      {
        role: 'user' | 'assistant'
        content: string
        link?: string | undefined
      }[]
    >
  >
) => {
    useEffect(() => {
        if (!chatRoom || chatRoom.length === 0) return
        const socket = getSocketClient()
        if (!socket) return

        socket.emit('join-chatroom', chatRoom)
        console.log(' Joined chatroom:', chatRoom)

        const handleRealtimeMessage = (data: any) => {
            console.log('✅ Received message:', data)

            setChats((prev: any) => {
                const lastMessage = prev[prev.length - 1]
                
                if (lastMessage && 
                    lastMessage.content === data.chat.message && 
                    lastMessage.role === data.chat.role) {
                console.log('⏭️ Duplicate of last message, skipping')
                return prev
            }
                
                return [...prev, {
                    role: data.chat.role,
                    content: data.chat.message,
                }]
            })
        }

        socket.on('realtime-mode', handleRealtimeMessage)

        return () => {
            socket.off('realtime-mode', handleRealtimeMessage)
            socket.emit('leave-chatroom', chatRoom)
            console.log('left chatroom:', chatRoom)
        }
    }, [chatRoom, setChats])
}
