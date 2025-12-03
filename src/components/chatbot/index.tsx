"use client"
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import React from 'react'
import { BotWindow } from './window'
import { cn } from '@/lib/utils'
import { BotIcon } from '@/icons/bot-icon'

type Props = {}

const AiChatBot = (props: Props) => {
    const {
        onOpenChatBot,
        botOpened,
        onChats,
        register,
        onStartChatting,
        onAiTyping,
        messageWindowRef,
        currentBot,
        loading,
        onRealTime,
        setOnChats,
        imagePreview,
        onImageChange,
        removeImage,
    } = useChatBot()

    console.log('🔍 Chatbot - onRealTime:', onRealTime)
    const themeColor =
      currentBot?.chatBot?.backgroundColor ??
      currentBot?.chatBot?.background ?? 
      '#3B82F6'
    const textColor = currentBot?.chatBot?.textColor || '#FFFFFF'

    const botIcon = currentBot?.chatBot?.icon || undefined

    const plan = currentBot?.subscription?.plan || 'STANDARD'

  return (
    <div className='h-screen flex flex-col justify-end items-end gap-4'>
        {botOpened && (
            <BotWindow
                setChat={setOnChats}
                realtimeMode={onRealTime}
                helpdesk={currentBot?.helpdesk!}
                domainName={currentBot?.name!}
                ref={messageWindowRef}
                help={currentBot?.chatBot?.helpdesk}
                theme={themeColor}
                textColor={textColor}
                chats={onChats}
                register={register}
                onChat={onStartChatting}
                onResponding={onAiTyping}
                imagePreview={imagePreview}
                onImageChange={onImageChange}
                removeImage={removeImage}
                botIcon={botIcon}
                plan={plan}
            />
        )}
    <div
        className={cn(
          'rounded-full relative cursor-pointer shadow-md w-20 h-20 flex items-center justify-center'
        )}
        style={{ backgroundColor: themeColor }}
        onClick={onOpenChatBot}
      >
          <BotIcon />
      </div>
    </div>
  )
}

export default AiChatBot