"use client"
import { useChatBot } from '@/hooks/chatbot/use-chatbot'
import React from 'react'
import { BotWindow } from './window'
import { cn } from '@/lib/utils'
import { BotIcon } from '@/icons/bot-icon'

type Props = Record<string, never>

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

    console.log('🔍 Chatbot - currentBot:', currentBot)
    const themeColor =
      currentBot?.chatBot?.backgroundColor ??
      currentBot?.chatBot?.background ?? 
      '#3B82F6'

    const textColor = currentBot?.chatBot?.textColor || '#FFFFFF'
    const botIcon = currentBot?.chatBot?.icon || undefined
    const plan = currentBot?.subscription?.plan || 'STANDARD'
    const domainId = (currentBot as any)?.id || undefined

  return (
    <div className='h-screen flex flex-col justify-end items-end gap-4'>
        {botOpened && (
            <BotWindow
                setChat={setOnChats}
                realtimeMode={onRealTime}
                helpdesk={currentBot?.helpdesk!}
                domainName={currentBot?.name!}
                domainId={domainId}
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
                chatbotTitle={currentBot?.chatBot?.chatbotTitle}
                chatbotSubtitle={currentBot?.chatBot?.chatbotSubtitle}
                userBubbleColor={currentBot?.chatBot?.userBubbleColor}
                botBubbleColor={currentBot?.chatBot?.botBubbleColor}
                userTextColor={currentBot?.chatBot?.userTextColor}
                botTextColor={currentBot?.chatBot?.botTextColor}
                buttonStyle={currentBot?.chatBot?.buttonStyle}
                bubbleStyle={currentBot?.chatBot?.bubbleStyle}
                showAvatars={currentBot?.chatBot?.showAvatars}
                widgetSize={currentBot?.chatBot?.widgetSize}
                widgetStyle={currentBot?.chatBot?.widgetStyle}
                showPresenceBadge={currentBot?.chatBot?.showPresenceBadge ?? true}
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