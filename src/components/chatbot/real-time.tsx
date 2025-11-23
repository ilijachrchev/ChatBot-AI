import React, { useEffect, useState } from 'react'
import { Card } from '../ui/card'
import { useRealTime } from '@/hooks/chatbot/use-chatbot'
import { getSocketClient } from '@/lib/utils'

type Props = {
    chatRoomId: string
    setChats: React.Dispatch<
        React.SetStateAction<
            {
                role: 'user' | 'assistant'
                content: string
                link?: string | undefined
            }[]
        >
    >
    showBadge?: boolean
}

const RealTimeMode = ({ chatRoomId, setChats, showBadge: initialShowBadge = false }: Props) => {
    const [showBadge, setShowBadge] = useState(initialShowBadge)

    useRealTime(chatRoomId, setChats)

    useEffect(() => {
        setShowBadge(initialShowBadge)
    }, [initialShowBadge])

    useEffect(() => {
            const socket = getSocketClient()
            
            const handleModeChange = (data: any) => {
                console.log('🔄 Mode changed:', data.mode)
                setShowBadge(data.mode)
            }
            
            socket.on('mode-change', handleModeChange)
            
            return () => {
                socket.off('mode-change', handleModeChange)
            }
    }, [chatRoomId])

    return (
        <>
            {showBadge && (
                <Card className='px-3 rounded-full py-1 bg-orange font-bold text-white text-sm'>
                    Real Time
                </Card>
            )}
        </>
    )
}

export default RealTimeMode