import React, { useEffect, useState } from 'react'
import { Card } from '../ui/card'
import { getSocketClient } from '@/lib/utils'

type Props = {
    chatRoomId: string
    setChats?: React.Dispatch<
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

const RealTimeMode = ({ chatRoomId, showBadge: initialShowBadge = false }: Props) => {
    const [showBadge, setShowBadge] = useState(initialShowBadge)

    useEffect(() => {
        setShowBadge(initialShowBadge)
    }, [initialShowBadge])

    useEffect(() => {
        const socket = getSocketClient()
        if (!socket) return

        const handleModeChange = (data: { mode: boolean }) => {
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
