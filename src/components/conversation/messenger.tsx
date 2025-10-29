import { useChatWindow } from '@/hooks/conversation/use-conversation'
import React from 'react'

type Props = {}


const Messenger = (props: Props) => {
    const {
        messageWindowRef,
        chats,
        loading,
        chatRoom,
        onHandleSentMessage,
        register,
    } = useChatWindow()
  return (
    <div>Messenger</div>
  )
}

export default Messenger