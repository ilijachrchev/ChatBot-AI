import { onAiChatBotAssistant, onGetCurrentChatBot } from "@/actions/bot"
import { postToParent, pusherClient } from "@/lib/utils"
import { ChatBotMessageProps, ChatBotMessageSchema } from "@/schemas/conversation.schema"
import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { UploadClient } from '@uploadcare/upload-client'
import { set } from "zod"
import { se } from "date-fns/locale"

const upload = new UploadClient({
    publicKey: process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY as string,
})

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
        resolver: zodResolver(ChatBotMessageSchema as any) as any,
    })
    const [currentBot, setCurrentBot] = useState<
        | {
            name: string
            chatBot: {
                id: string
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
    const requestedRef = useRef(false);
    const [onChats, setOnChats] = useState<
        { role: 'assistant' | 'user'; content: string; link?: string }[]
    >([])
    const [onAiTyping, setOnAiTyping] = useState<boolean>(false)
    const [currentBotId, setCurrentBotId] = useState<string>()
    const [onRealTime, setOnRealTime] = useState<
        { chatroom: string; mode: boolean } | undefined
    >(undefined)

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

        console.log('Received bot ID via postMessage:', e.data);
        const botid = e.data;
        if (typeof botid === 'string' && botid.length > 0 && !currentBotId) {
            console.log('Fetching chatbot for ID:', botid);
            setCurrentBotId(botid);
            onGetDomainChatBot(botid);
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
        if (!currentBotId) {
            console.error('Current bot ID is not set.');
            return;
        }

        reset()
        setImagePreview(null)

        const chatroomId = getOrCreateChatroomId();
        if (values.image && values.image.length) {
            try {
            const uploaded = await upload.uploadFile(values.image[0])

            if (!uploaded || !uploaded.uuid) {
                console.error('Upload failed')
                setOnAiTyping(false)
                setImagePreview(null)
                return
            }

            console.log('Uploaded image UUID:', uploaded.uuid)

            setOnChats((prev: any) => [
                ...prev,
                {
                    role: 'user',
                    content: uploaded.uuid,
                },
            ])
            setOnAiTyping(true)
            setImagePreview(null)

            const response = await onAiChatBotAssistant(
                currentBotId,
                onChats,
                'user',
                uploaded.uuid,
                chatroomId,
                false,
                false,
            )

            if (response) {
                if (response.chatRoom) setChatroomId(response.chatRoom);
                setOnAiTyping(false)
                if (response.live) {
                    setOnRealTime({
                        chatroom: response.chatRoom,
                        mode: response.live,
                    })
        } else if (response.response) {
                    setOnChats((prev: any) => [...prev, response.response])
                }
            }
        } catch (error) {
            console.error('Image upload error:', error)
            setOnAiTyping(false)
            setImagePreview(null)

            setOnChats((prev: any) => [
                ...prev,
                {
                    role: 'assistant',
                    content: 'Sorry, there was an error uploading your image. Please try again.',
                },
            ])
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
                currentBotId,
                onChats,
                'user',
                values.content,
                chatroomId,
                false,
                false,
            )

            if (response) {
                if (response.chatRoom) setChatroomId(response.chatRoom);
                setOnAiTyping(false)
                if (response.live) {
                    setOnRealTime({
                        chatroom: response.chatRoom,
                        mode: response.live,
                    })
                } else if (response.response) {
                    setOnChats((prev: any) => [...prev, response.response])
                }
            }
        }
    })

    const onImageChange = (E: React.ChangeEvent<HTMLInputElement>) => {
        const file = E.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }
    const removeImage = () => {
        setImagePreview(null)
        setValue('image', null as any)
    }


    const getOrCreateChatroomId = () => {
        let chatroomId: string | null = null;

        try {
            chatroomId = localStorage.getItem('chatroomId');
        } catch {}

        if (!chatroomId) {
            // chatroomId = self.crypto.randomUUID();
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
  const counterRef = useRef(1)

  useEffect(() => {
    pusherClient.subscribe(chatRoom)
    pusherClient.bind('realtime-mode', (data: any) => {
      console.log('✅', data)
      if (counterRef.current !== 1) {
        setChats((prev: any) => [
          ...prev,
          {
            role: data.chat.role,
            content: data.chat.message,
          },
        ])
      }
      counterRef.current += 1
    })
    return () => {
      pusherClient.unbind('realtime-mode')
      pusherClient.unsubscribe(chatRoom)
    }
  }, [])
}
