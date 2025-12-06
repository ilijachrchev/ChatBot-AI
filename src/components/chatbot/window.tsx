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
import { BotIcon, Paperclip, Send } from 'lucide-react'
import { Label } from '../ui/label'
import { CardDescription, CardTitle } from '../ui/card'
import Accordion from '../accordian'

type Props = {
  register: UseFormRegister<ChatBotMessageProps>
  chats: { role: 'assistant' | 'user'; content: string; link?: string }[]
  onChat(): void
  onResponding: boolean
  domainName?: string
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
  showAvatars?: boolean | null
}

export const BotWindow = forwardRef<HTMLDivElement, Props>(
  (
    {
      register,
      chats,
      onChat,
      onResponding,
      domainName,
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
      showAvatars,
    },
    ref
  ) => {
    const showPoweredBy = plan === 'STANDARD'

    const getButtonClass = () => {
      switch (buttonStyle) {
        case 'SQUARE':
          return 'rounded-none'
        case 'PILL':
          return 'rounded-full'
        case 'ROUNDED':
        default:
          return 'rounded-lg'
      }
    }

    const displayTitle = chatbotTitle || 'Sales Rep - SendWise-AI'
    const displaySubtitle = chatbotSubtitle || (domainName ?? '').replace(/\.com$/, '') || 'ChatBot'
    const finalShowAvatars = showAvatars ?? true

    return (
      <div className="h-[670px] w-[450px] flex flex-col bg-white rounded-xl mr-[80px] border-[1px] overflow-hidden">
        <div className="flex justify-between px-4 pt-4 pb-4 items-center"
        style={{
          background: theme || '#7C3AED',
          color: textColor || '#FFFFFF',
        }}
        >
          <div className="flex gap-2">
            {botIcon ? (
              <div className="w-20 h-20 flex items-center justify-center bg-white rounded-full p-2 overflow-hidden">
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
              <Avatar className="w-20 h-20">
                <div className="w-full h-full flex items-center justify-center bg-white rounded-full">
                  <BotIcon />
                </div>
              </Avatar>
            )}
            <div className="flex items-start flex-col">
              <h3 className="text-lg font-bold leading-none">
                {displayTitle}
              </h3>
              <p className="text-sm">{displaySubtitle}</p>
              {realtimeMode?.chatroom && (
                <RealTimeMode
                  setChats={setChat}
                  chatRoomId={realtimeMode.chatroom}
                  showBadge={realtimeMode.mode}
                />
              )}
            </div>
          </div>
          {finalShowAvatars && (
            <div className="relative w-16 h-16">
              <Image
                src="https://ucarecdn.com/019dd17d-b69b-4dea-a16b-60e0f25de1e9/propuser.png"
                fill
                alt="users"
                objectFit="contain"
              />
            </div>
          )}
        </div>
        <TabsMenu
          triggers={BOT_TABS_MENU}
          className=" bg-transparent border-[1px] border-border m-2"
        >
          <TabsContent value="chat">
            <Separator orientation="horizontal" />
            <div className="flex flex-col h-full">
              <div
                className="px-3 flex h-[400px] flex-col py-5 gap-3 chat-window overflow-y-auto bg-white"
                ref={ref}
              >
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
                  />
                ))}
                {onResponding && <Responding botIcon={botIcon} />}
              </div>
              <form
                onSubmit={onChat}
                className="flex px-3 py-3.5 flex-col bg-porcelain "
              >
                <div className="flex justify-between items-end gap-2">
                  <div className="flex-1 flex flex-col gap-2">
                    {imagePreview && (
                      <div className="relative w-16 h-16 rounded-md overflow-hidden border-2 border-gray-300">
                        <img 
                          src={imagePreview} 
                          alt="preview" 
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    
                    <Input
                      {...register('content')}
                      placeholder="Type your message..."
                      className="focus-visible:ring-0 p-0 focus-visible:ring-offset-0 bg-porcelain rounded-none outline-none border-none"
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
                    className={`h-10 ${getButtonClass()}`}
                    style={{ background: theme || '#7C3AED' }}
                  >
                    <Send />
                  </Button>
                </div>
                
                <Label htmlFor="bot-image" className="cursor-pointer mt-1">
                  <Paperclip className="text-muted-foreground hover:text-foreground transition-colors" />
                  <Input
                    type="file"
                    id="bot-image"
                    className="hidden"
                    accept="image/*"
                    onChange={onImageChange}
                  />
                </Label>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="helpdesk">
            <div className="h-[485px] overflow-y-auto overflow-x-hidden p-4 flex flex-col gap-4">
              <div>
                <CardTitle>Help Desk</CardTitle>
                <CardDescription>
                  Browse from a list of questions people usually ask.
                </CardDescription>
              </div>
              <Separator orientation="horizontal" />

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
          <div className="flex justify-center py-2">
            <p className="text-gray-400 text-xs">Powered by SendWise AI</p>
          </div>
        )}
      </div>
    )
  }
)

BotWindow.displayName = 'BotWindow'