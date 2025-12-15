import { ChatBotMessageProps } from '@/schemas/conversation.schema'
import React, { forwardRef } from 'react'
import { UseFormRegister } from 'react-hook-form'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import RealTimeMode from './real-time'
import Image from 'next/image'
import TabsMenu from '../tabs/intex'
import { BOT_TABS_MENU } from '@/constants/menu'
import { TabsContent } from '../ui/tabs'
import { Separator } from '../ui/separator'
import Bubble from './bubble'
import { Responding } from './responding'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { BotIcon, Paperclip, Send, Sparkles } from 'lucide-react'
import { Label } from '../ui/label'
import { CardDescription, CardTitle } from '../ui/card'
import Accordion from '../accordian'
import { cn } from '@/lib/utils'
import { useChatbotPresence } from '@/hooks/chatbot/use-chatbot-presence'
import { OfflineMessage } from './advanced-settings/offline-message'

type Props = {
  register: UseFormRegister<ChatBotMessageProps>
  chats: { role: 'assistant' | 'user'; content: string; link?: string }[]
  onChat(): void
  onResponding: boolean
  domainName?: string
  domainId?: string
  theme?: string | null
  textColor?: string | null
  help?: boolean
  realtimeMode:
    | {
        chatroom: string
        mode: boolean
      }
    | undefined
  helpdesk?: {
    id: string
    question: string
    answer: string
    domainId: string | null
  }[]
  setChat: React.Dispatch<
    React.SetStateAction<
      {
        role: 'user' | 'assistant'
        content: string
        link?: string | undefined
      }[]
    >
  >
  imagePreview: string | null
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeImage: () => void
  botIcon?: string
  plan?: 'STANDARD' | 'PRO' | 'ULTIMATE'
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
  showPresenceBadge?: boolean
}

export const BotWindow = forwardRef<HTMLDivElement, Props>(
  (
    {
      register,
      chats,
      onChat,
      onResponding,
      domainName,
      domainId,
      helpdesk,
      realtimeMode,
      setChat,
      textColor,
      theme,
      help,
      imagePreview,
      onImageChange,
      removeImage,
      botIcon,
      plan = 'STANDARD',
      chatbotTitle,
      chatbotSubtitle,
      userBubbleColor,
      botBubbleColor,
      userTextColor,
      botTextColor,
      buttonStyle,
      bubbleStyle,
      showAvatars,
      widgetSize,
      widgetStyle,
      showPresenceBadge,
    },
    ref
  ) => {

    const { presence, shouldShowOfflineMessage } = useChatbotPresence(domainId || '')

    const showPoweredBy = plan === 'STANDARD'

    const getButtonClass = () => {
      switch (buttonStyle) {
        case 'SQUARE':
          return 'rounded-none'
        case 'PILL':
          return 'rounded-full'
        case 'ROUNDED':
        default:
          return 'rounded-md'
      }
    }
    const getSizeClasses = () => {
      switch (widgetSize) {
        case 'COMPACT':
          return 'h-[500px] w-[360px]'
        case 'FULL':
          return 'h-[700px] w-[480px]'
        case 'MEDIUM':
        default:
          return 'h-[600px] w-[420px]'
      }
    }
    const getStyleClasses = () => {
      switch (widgetStyle) {
        case 'SOFT':
          return 'bg-white/95 backdrop-blur-sm border border-gray-200/50'
        case 'GLASS':
          return 'bg-white/80 backdrop-blur-md border border-white/20 shadow-2xl'
        case 'SOLID':
        default:
          return 'bg-white border border-gray-200'
      }
    }

    const displayTitle = chatbotTitle || 'SendWise-AI'
    const displaySubtitle = chatbotSubtitle || 'Your AI assistant'

    const handleEmailSubmit = async (email: string) => {
      console.log('Email collected:', email)
      
      setChat((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Thank you! We'll contact you at ${email} during our business hours.`,
        },
      ])
    }

    return (
      <div className={cn(
        'flex flex-col rounded-2xl mr-[80px] shadow-xl overflow-hidden',
        getSizeClasses(),
        getStyleClasses()
      )}>
        <div 
          className="flex justify-between items-center px-4 py-3 border-b border-white/10"
          style={{
            background: theme || '#6366F1',
            color: textColor || '#FFFFFF',
          }}
        >
          <div className="flex items-center gap-3">
            {botIcon ? (
              <div className="w-9 h-9 flex items-center justify-center bg-white rounded-full p-1.5 overflow-hidden flex-shrink-0">
                <div className="relative w-full h-full">
                  <Image
                    src={botIcon}
                    alt="bot"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="w-9 h-9 flex items-center justify-center bg-white rounded-full flex-shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
            )}
            
            <div className="flex flex-col min-w-0">
              <h3 className="text-sm font-semibold leading-tight truncate">
                {displayTitle}
              </h3>
              <p className="text-xs opacity-90 truncate">{displaySubtitle}</p>
            </div>
          </div>

          {realtimeMode?.mode && (
            <div className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
              <span className="text-xs font-medium">Live</span>
            </div>
          )}
        </div>

        <TabsMenu
          triggers={BOT_TABS_MENU}
          className="bg-gray-50/50 border-b border-gray-200 mx-3 mt-2 rounded-lg"
        >
          <TabsContent value="chat" className="mt-0">
            <div className="flex flex-col h-full">
              <div
                className="px-4 flex h-[420px] flex-col py-4 gap-3 chat-window overflow-y-auto bg-white"
                ref={ref}
              >
                {shouldShowOfflineMessage && presence?.message && (
                  <OfflineMessage
                    message={presence.message}
                    shouldCollectEmail={presence.status === 'OFFLINE' || presence.status === 'AWAY'}
                    onEmailSubmit={handleEmailSubmit}
                    className="mb-2"
                  />
                )}
                {chats.map((chat, key) => (
                  <Bubble
                    key={key}
                    message={chat}
                    botIcon={botIcon}
                    userBubbleColor={userBubbleColor}
                    botBubbleColor={botBubbleColor}
                    userTextColor={userTextColor}
                    botTextColor={botTextColor}
                    buttonStyle={buttonStyle}
                    bubbleStyle={bubbleStyle}
                  />
                ))}
                {onResponding && <Responding botIcon={botIcon} />}
              </div>

              <form
                onSubmit={onChat}
                className="flex px-4 py-3 flex-col gap-2 bg-gray-50/80 border-t border-gray-200"
              >
                {imagePreview && (
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border-2 border-gray-200 bg-white">
                    <img 
                      src={imagePreview} 
                      alt="preview" 
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Label 
                    htmlFor="bot-image" 
                    className="cursor-pointer hover:bg-gray-200 p-2 rounded-lg transition-colors"
                  >
                    <Paperclip className="w-4 h-4 text-gray-500" />
                    <Input
                      type="file"
                      id="bot-image"
                      className="hidden"
                      accept="image/*"
                      onChange={onImageChange}
                    />
                  </Label>

                  <div className="flex-1 relative">
                    <Input
                      {...register('content')}
                      placeholder="Type your message..."
                      className="w-full bg-white border-gray-200 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 rounded-lg px-3 py-2 text-sm pr-10"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          onChat()
                        }
                      }}
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    size="icon"
                    className={`h-9 w-9 flex-shrink-0 ${getButtonClass()} transition-all hover:scale-105`}
                    style={{ background: theme || '#6366F1' }}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="helpdesk" className="mt-0">
            <div className="h-[485px] overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
              <div className="space-y-1">
                <CardTitle className="text-base">Help Desk</CardTitle>
                <CardDescription className="text-xs">
                  Browse from a list of questions people usually ask.
                </CardDescription>
              </div>
              <Separator orientation="horizontal" className="my-2" />

              {(helpdesk ?? []).map((desk) => (
                <Accordion
                  key={desk.id}
                  trigger={desk.question}
                  content={desk.answer}
                />
              ))}
            </div>
          </TabsContent>
        </TabsMenu>

        {showPoweredBy && (
          <div className="flex justify-center py-2 bg-gray-50/50 border-t border-gray-100">
            <p className="text-gray-400 text-[10px] font-medium">
              Powered by <span className="text-gray-500">SendWise-AI</span>
            </p>
          </div>
        )}
      </div>
    )
  }
)

BotWindow.displayName = 'BotWindow'