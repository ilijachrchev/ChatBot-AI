'use client'

import React from 'react'
import EditChatbotIcon from './edit-chatbot-icon'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { MessageSquare, Palette, Save } from 'lucide-react'
import { ChatbotPreview } from './chatbot-preview'
import { ColorPicker } from './color-picker'
import { ChatbotCustomization } from './chatbot-customization'
import { Separator } from '@/components/ui/separator'
import { useSettings } from '@/hooks/settings/use-settings'

const WelcomeMessage = dynamic(
  () => import('./greetings-message').then((props) => props.default),
  { ssr: false }
)

type Props = {
  id: string
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  chatBot: {
    id: string
    icon: string | null
    welcomeMessage: string | null
    backgroundColor?: string | null
    persona?: string
    customPrompt?: string | null
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
  } | null
}

export const AppearanceForm = ({ id, plan, chatBot }: Props) => {
  const {
    register,
    onUpdateSettings,
    errors,
    loading,
    previewIcon,
    watchedWelcomeMessage,
    watchedColor,
    watchedTitle,
    watchedSubtitle,
    watchedUserBubbleColor,
    watchedBotBubbleColor,
    watchedUserTextColor,
    watchedBotTextColor,
    watchedButtonStyle,
    watchedBubbleStyle,
    watchedShowAvatars,
    watchedWidgetSize,
    watchedWidgetStyle,
    setValue,
  } = useSettings(id, chatBot?.id || '')

  return (
    <form className="flex flex-col gap-6" onSubmit={onUpdateSettings}>
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                Chatbot Appearance & Customization
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Customize your chatbot&apos;s look, feel, and behavior
              </p>
            </div>
          </div>

          {plan !== 'STANDARD' && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border border-amber-200 dark:border-amber-800">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-100">
                ✨ PREMIUM
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr,400px] gap-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Basic Settings
              </h4>

              <EditChatbotIcon
                register={register}
                errors={errors}
                chatBot={chatBot}
              />

              <WelcomeMessage
                message={chatBot?.welcomeMessage}
                register={register}
                errors={errors}
              />

              <ColorPicker
                defaultColor={chatBot?.backgroundColor || '#3B82F6'}
                setValue={setValue}
              />
            </div>

            <Separator />

            <ChatbotCustomization
              register={register}
              errors={errors}
              setValue={setValue}
              currentValues={{
                chatbotTitle: chatBot?.chatbotTitle,
                chatbotSubtitle: chatBot?.chatbotSubtitle,
                userBubbleColor: chatBot?.userBubbleColor,
                botBubbleColor: chatBot?.botBubbleColor,
                userTextColor: chatBot?.userTextColor,
                botTextColor: chatBot?.botTextColor,
                buttonStyle: chatBot?.buttonStyle,
                showAvatars: chatBot?.showAvatars,
                widgetSize: chatBot?.widgetSize,
                widgetStyle: chatBot?.widgetStyle,
              }}
            />
          </div>

          <div className="xl:sticky xl:top-6 xl:self-start">
            <ChatbotPreview
              icon={chatBot?.icon}
              welcomeMessage={
                watchedWelcomeMessage || chatBot?.welcomeMessage
              }
              previewIcon={previewIcon}
              chatbotColor={
                (watchedColor as string) ||
                chatBot?.backgroundColor ||
                '#3B82F6'
              }
              chatbotTitle={
                (watchedTitle as string) || chatBot?.chatbotTitle
              }
              chatbotSubtitle={
                (watchedSubtitle as string) || chatBot?.chatbotSubtitle
              }
              userBubbleColor={
                (watchedUserBubbleColor as string) ||
                chatBot?.userBubbleColor
              }
              botBubbleColor={
                (watchedBotBubbleColor as string) ||
                chatBot?.botBubbleColor
              }
              userTextColor={
                (watchedUserTextColor as string) || chatBot?.userTextColor
              }
              botTextColor={
                (watchedBotTextColor as string) || chatBot?.botTextColor
              }
              buttonStyle={
                (watchedButtonStyle as string) || chatBot?.buttonStyle
              }
              bubbleStyle={
                (watchedBubbleStyle as string) || chatBot?.bubbleStyle
              }
              widgetSize={
                (watchedWidgetSize as string) || chatBot?.widgetSize
              }
              widgetStyle={
                (watchedWidgetStyle as string) || chatBot?.widgetStyle
              }
              showAvatars={watchedShowAvatars ?? chatBot?.showAvatars}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end sticky bottom-0 bg-background/95 backdrop-blur-sm py-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          type="submit"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 px-8"
        >
          <Save className="h-4 w-4 mr-2" />
          <Loader loading={loading}>Save Changes</Loader>
        </Button>
      </div>
    </form>
  )
}