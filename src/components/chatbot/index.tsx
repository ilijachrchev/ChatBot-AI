"use client"
import { useChatBot, useRealTime } from '@/hooks/chatbot/use-chatbot'
import React, { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BotWindow } from './window'
import { cn, postToParent } from '@/lib/utils'
import { BotIcon } from '@/icons/bot-icon'
import TeaserBubble from './teaser-bubble'

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
        currentBotId,
        activeChatRoomId,
    } = useChatBot()

    useRealTime(onRealTime?.mode ? onRealTime.chatroom : '', setOnChats)
    console.log('🔍 Chatbot - currentBot:', currentBot)

    const themeColor =
      currentBot?.chatBot?.backgroundColor ??
      currentBot?.chatBot?.background ??
      '#3B82F6'

    const textColor = currentBot?.chatBot?.textColor || '#FFFFFF'
    const botIcon = currentBot?.chatBot?.icon || undefined
    const plan = currentBot?.subscription?.plan || 'STANDARD'

    const teaserEnabled = currentBot?.chatBot?.teaserEnabled ?? false
    const teaserMessage = currentBot?.chatBot?.teaserMessage ?? 'Have a question? 💬'
    const teaserDelay = currentBot?.chatBot?.teaserDelay ?? 3
    const chatPosition = currentBot?.chatBot?.chatPosition ?? 'BOTTOM_RIGHT'
    const bubblePosition = chatPosition === 'BOTTOM_LEFT' ? 'right' : 'left'

    const [showTeaser, setShowTeaser] = useState(false)
    const [teaserDismissed, setTeaserDismissed] = useState(false)

    useEffect(() => {
        if (!teaserEnabled || !teaserMessage || teaserDismissed || !currentBotId) return

        const sessionKey = `teaser_shown_${currentBotId}`
        try {
            if (sessionStorage.getItem(sessionKey)) return
        } catch {}

        const timer = setTimeout(() => {
            setShowTeaser(true)
            try {
                sessionStorage.setItem(sessionKey, 'true')
            } catch {}
        }, teaserDelay * 1000)

        return () => clearTimeout(timer)
    }, [teaserEnabled, teaserMessage, teaserDelay, teaserDismissed, currentBotId])

    useEffect(() => {
        if (botOpened) return
        postToParent(
            JSON.stringify({
                width: showTeaser ? 300 : 80,
                height: 80,
            })
        )
    }, [showTeaser, botOpened])

    const handleOpenChatBot = () => {
        setShowTeaser(false)
        setTeaserDismissed(true)
        onOpenChatBot()
    }

    const handleTeaserDismiss = () => {
        setShowTeaser(false)
        setTeaserDismissed(true)
    }

  return (
    <div className='h-screen flex flex-col justify-end items-end gap-4'>
        {botOpened && (
            <BotWindow
                setChat={setOnChats}
                realtimeMode={onRealTime}
                helpdesk={currentBot?.helpdesk!}
                domainName={currentBot?.name!}
                domainId={currentBotId}
                chatRoomId={activeChatRoomId}
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
                removeBranding={currentBot?.chatBot?.removeBranding}
                chatPosition={currentBot?.chatBot?.chatPosition}
                showPresenceBadge={currentBot?.chatBot?.showPresenceBadge ?? true}
                persona={currentBot?.chatBot?.persona ?? undefined}
            />
        )}
        <div className="relative w-20 h-20 flex-shrink-0">
            <AnimatePresence>
                {showTeaser && !teaserDismissed && !botOpened && (
                    <TeaserBubble
                        message={teaserMessage}
                        position={bubblePosition}
                        onDismiss={handleTeaserDismiss}
                        theme={themeColor}
                    />
                )}
            </AnimatePresence>
            {showTeaser && !teaserDismissed && !botOpened && (
                <div
                    className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none"
                    style={{ backgroundColor: themeColor }}
                />
            )}
            <div
                className={cn(
                  'rounded-full cursor-pointer shadow-md w-20 h-20 flex items-center justify-center'
                )}
                style={{ backgroundColor: themeColor }}
                onClick={handleOpenChatBot}
            >
                <BotIcon />
            </div>
        </div>
    </div>
  )
}

export default AiChatBot
