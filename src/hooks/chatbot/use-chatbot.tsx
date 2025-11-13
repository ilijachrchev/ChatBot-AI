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
    const { register, handleSubmit, reset } = 
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

    // useEffect(() => {
    //     window.addEventListener("message", (e) => {
    //         const botid = e.data
    //         if (limitRequest < 1 && typeof botid == 'string') {
    //         onGetDomainChatBot(botid)
    //         limitRequest++
    //         }
    //     }) 
    // }, [])

    // useEffect(() => {
    //     const handler = (e: MessageEvent) => {
    //         if (e.origin !== "http://localhost:3000") return;
    //         if (requestedRef.current) return;

    //         const botid = e.data
    //         console.log('Received bot ID via postMessage:', botid);
    //         if (typeof botid == 'string' && botid.length > 0) {
    //             requestedRef.current = true;
    //             onGetDomainChatBot(botid)
    //         }
    //     }
    //     window.addEventListener("message", handler, false);
    //     return () => {
    //         window.removeEventListener("message", handler, false);
    //     };
    // }, [])

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

    // const onGetDomainChatBot = async (id: string) => {
    //     setCurrentBotId(id)
    //     const chatbot = await onGetCurrentChatBot(id);
    //     console.log('Fetched chatbot data:', chatbot);
    //     if (chatbot) {
    //         const welcome = chatbot.chatBot?.welcomeMessage ?? `Hi! I am ${chatbot.name}. How can I assist you today?`;
    //         setOnChats((prev) => [
    //             ...prev,
    //             {
    //                 role: 'assistant',
    //                 content: welcome,
    //             }
    //         ]);
    //         setCurrentBot(chatbot);
    //         setLoading(false)
    //     }
    // }
    
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

    // const onStartChatting = handleSubmit(async (values) => {
    //     reset()

    //     const chatroomId = getOrCreateChatroomId();

    //     if(values.image.length) {
    //         const uploaded = await upload.uploadFile(values.image[0])
    //         setOnChats((prev: any) => [
    //             ...prev,
    //             {
    //                 role: 'user',
    //                 content: uploaded.uuid,
    //             },
    //         ])
    //         setOnAiTyping(true)

    //         const isIframe = typeof window !== 'undefined' && window.self !== window.top;
    //         const response = await onAiChatBotAssistant(
    //             currentBotId!,
    //             onChats,
    //             'user',
    //             uploaded.uuid,
    //             chatroomId,
    //             !isIframe,
    //         )

    //         if (response) {
    //             if (response.chatRoom) setChatroomId(response.chatRoom);
    //             setOnAiTyping(false)
    //             if (response.live) {
    //                 setOnRealTime((prev) => ({
    //                     ...prev,
    //                     chatroom: response.chatRoom,
    //                     mode: response.live,
    //                 }))
    //             } else {
    //                 setOnChats((prev: any) => [...prev, response.response])
    //             }
    //         }
    //     }

    //     if (values.content) {
    //         setOnChats((prev: any) => [
    //             ...prev,
    //             {
    //                 role: 'user',
    //                 content: values.content,
    //             },
    //         ])
    //         setOnAiTyping(true)

    //         const response = await onAiChatBotAssistant(
    //             currentBotId!,
    //             onChats,
    //             'user',
    //             values.content,
    //             chatroomId,
    //         )
            
    //         if (response) {
    //             if (response.chatRoom) setChatroomId(response.chatRoom);
    //             setOnAiTyping(false)
    //             if (response.live) {
    //                 setOnRealTime((prev) => ({
    //                     ...prev,
    //                     chatroom: response.chatRoom,
    //                     mode: response.live,
    //                 }))
    //             } else {
    //                 setOnChats((prev: any) => [...prev, response.response])
    //             }
    //         }
    //     }
    // })

    const onStartChatting = handleSubmit(async (values) => {
        if (!currentBotId) {
            console.error('Current bot ID is not set.');
            return;
        }
        reset()

        const chatroomId = getOrCreateChatroomId();
        if (values.image && values.image.length) {
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

    // const getOrCreateChatroomId = () => {
    //     if (onChats.length === 0) {
    //         const id = crypto.randomUUID();
    //         try { localStorage.setItem('chatroomId', id); } catch {}
    //         return id;
    //     }

    //     let chatroomId = localStorage.getItem('chatroomId');
    //     if (!chatroomId) {
    //         chatroomId = crypto.randomUUID();
    //         try { localStorage.setItem('chatroomId', chatroomId); } catch {}
    //     }
    //     return chatroomId;
    // };

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