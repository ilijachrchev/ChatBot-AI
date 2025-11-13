"use client"
import { useChatWindow } from '@/hooks/conversation/use-conversation'
import React, { useState, useEffect } from 'react'
import { Loader } from '../loader'
import Bubble from '../chatbot/bubble'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Paperclip, X, MessageSquare } from 'lucide-react'
import { Switch } from '../ui/switch'
import { onToggleRealtime, onGetConversationMode } from '@/actions/conversation'
import { cn } from '@/lib/utils'

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

    const [isRealtime, setIsRealtime] = useState(false)
    const [toggling, setToggling] = useState(false)

    useEffect(() => {
        const checkMode = async () => {
            if (chatRoom) {
                const mode = await onGetConversationMode(chatRoom)
                if (mode) {
                    setIsRealtime(mode.live)
                }
            }
        }
        checkMode()
    }, [chatRoom])

    const handleToggleRealtime = async () => {
        if (!chatRoom) return
        
        setToggling(true)
        const newState = !isRealtime
        const result = await onToggleRealtime(chatRoom, newState)
        
        if (result) {
            setIsRealtime(newState)
        }
        setToggling(false)
    }

  return (
    <div className='flex-1 flex flex-col h-0 relative'>
      {chatRoom && (
        <div className='flex items-center justify-between px-5 py-3 border-b bg-muted/50'>
          <div className='flex items-center gap-3'>
            <div className={cn(
              'w-2 h-2 rounded-full',
              isRealtime ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            )} />
            <span className='text-sm font-medium'>
              {isRealtime ? 'Real-Time Mode' : 'AI Bot Mode'}
            </span>
          </div>
          
          <div className='flex items-center gap-2'>
            <span className='text-xs text-muted-foreground'>
              {isRealtime ? 'You are chatting' : 'Bot is responding'}
            </span>
            <Switch
              checked={isRealtime}
              onCheckedChange={handleToggleRealtime}
              disabled={toggling}
            />
          </div>
        </div>
      )}

      <div className='flex-1 h-0 w-full flex flex-col'>
        <Loader loading={loading}>
          <div 
            ref={messageWindowRef}
            className='w-full flex-1 h-0 flex flex-col gap-3
             pl-5 py-5 chat-window overflow-y-auto'
            >
              {chats.length ? (
                chats.map((chat) => (
                  <Bubble
                    key={chat.id}
                    message={{
                      role: chat.role!,
                      content: chat.message,
                    }}
                    createdAt={chat.createdAt}
                  />
                ))
              ) : (
                <div>No Chat Selected</div>
              )}
            </div>
        </Loader>
      </div>
      
      <form
        onSubmit={onHandleSentMessage}
        className='flex px-3 pt-3 pb-10 flex-col backdrop-blur-sm bg-muted w-full'
      >
        <div className='flex justify-between'>
          <Input 
            {...register('content')}
            placeholder='Type your message...'
            className='focus-visible:ring-0 flex-1 p-0 focus-visible:ring-offset-0
            bg-muted rounded-none outline-none border-none'
          />
          <Button
            type='submit'
            className='mt-3 px-7'
            disabled={!chatRoom}
          >
            Send
          </Button>
        </div>
        <span>
          <Paperclip className='text-muted-foreground'/>
        </span>
      </form>
    </div>
  )
}

export default Messenger