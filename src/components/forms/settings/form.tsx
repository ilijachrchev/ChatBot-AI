"use client"

import { useSettings } from '@/hooks/settings/use-settings'
import React from 'react'
import { DomainUpdate } from './domain-update'
import CodeSnippet from './code-snippet'
import EditChatbotIcon from './edit-chatbot-icon'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import {
  Globe,
  Trash2,
  Save,
  MessageSquare,
  Code,
  Palette,
} from 'lucide-react'
import { ChatbotPreview } from './chatbot-preview'
import { ColorPicker } from './color-picker'
import { PersonaSelector } from '@/components/settings/persona-selector'
import { ChatbotCustomization } from './chatbot-customization'
import { Separator } from '@/components/ui/separator'
import { VerificationBanner } from '@/components/domain/verification-banner'
import { PlanLockedOverlay } from '@/components/plan/plan-locked-overlay' 
import { cn } from '@/lib/utils'

const WelcomeMessage = dynamic(
  () => import('./greetings-message').then((props) => props.default),
  { ssr: false }
)

type Props = {
  id: string
  name: string
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
  } | null

  verificationStatus?: string
  verifiedAt?: Date | null
  verificationMethod?: string | null

  isLocked?: boolean
}

const SettingsForm = ({
  id,
  name,
  plan,
  chatBot,
  verificationStatus = 'PENDING',
  verifiedAt,
  verificationMethod,
  isLocked = false,
}: Props) => {
  const {
    register,
    onUpdateSettings,
    errors,
    loading,
    onDeleteDomain,
    deleting,
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
    setValue,
  } = useSettings(id, chatBot?.id || '')

  const isAppearanceLocked = plan === 'STANDARD'

  return (
    <form
      className="flex flex-col gap-6 px-4 md:px-6"
      onSubmit={onUpdateSettings}
    >
      <VerificationBanner
        domainName={name}
        verificationStatus={verificationStatus}
        verifiedAt={verifiedAt}
        verificationMethod={verificationMethod}
      />

      <div
        className={cn(
          'flex flex-col gap-6 pb-24 mt-4',
          isLocked && 'opacity-40 blur-[1px] pointer-events-none'
        )}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                  Domain Configuration
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Set up your custom domain
                </p>
              </div>
            </div>
            <DomainUpdate name={name} register={register} errors={errors} />
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <Code className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-950 dark:text-white">
                  Embed Code
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Add this snippet to your website
                </p>
              </div>
            </div>
            <CodeSnippet id={id} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
          <PersonaSelector
            chatBotId={chatBot?.id || ''}
            currentPersona={(chatBot?.persona as any) || 'SALES_AGENT'}
            currentCustomPrompt={chatBot?.customPrompt}
          />
        </div>

        <div className="relative min-h-[500px]"> 
          <div className={cn(
            "rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6",
            isAppearanceLocked && 'opacity-40 blur-[1px] pointer-events-none' // ✅ Add blur if locked
          )}>
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
                  showAvatars={watchedShowAvatars ?? chatBot?.showAvatars}
                />
              </div>
            </div>
          </div>

          {isAppearanceLocked && (
            <PlanLockedOverlay 
              currentPlan={plan} 
              feature="Chatbot Appearance"
            />
          )}
        </div>

        <div className="flex gap-3 justify-end sticky bottom-0 bg-background/95 backdrop-blur-sm py-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            onClick={onDeleteDomain}
            type="button"
            variant="outline"
            className="border-rose-300 dark:border-rose-700 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <Loader loading={deleting}>Delete Domain</Loader>
          </Button>

          <Button
            type="submit"
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 px-8"
          >
            <Save className="h-4 w-4 mr-2" />
            <Loader loading={loading}>Save All Changes</Loader>
          </Button>
        </div>
      </div>
    </form>
  )
}

export default SettingsForm