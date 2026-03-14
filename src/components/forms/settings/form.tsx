"use client"

import { useSettings } from '@/hooks/settings/use-settings'
import React from 'react'
import { DomainUpdate } from './domain-update'
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
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { ChatbotPreview } from './chatbot-preview'
import { ColorPicker } from './color-picker'
import { PersonaSelector } from '@/components/settings/preferences/persona-selector' 
import { ChatbotCustomization } from './chatbot-customization'
import { Separator } from '@/components/ui/separator'
import { VerificationBanner } from '@/components/domain/verification-banner'
import { PlanLockedOverlay } from '@/components/plan/plan-locked-overlay' 
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

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
    widgetSize?: string | null
    widgetStyle?: string | null
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
    watchedWidgetSize,
    watchedWidgetStyle,
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
        <section id="configuration" className="scroll-mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
                  <Globe className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)]">
                    Domain Configuration
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Set up your custom domain
                  </p>
                </div>
              </div>
              <DomainUpdate name={name} register={register} errors={errors} />
            </div>

            <div className="group relative rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 overflow-hidden transition-all hover:shadow-lg">
              <div className="absolute inset-0 bg-[var(--primary-light)] opacity-0 group-hover:opacity-30 transition-opacity" />

              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--primary)] text-white shadow-lg">
                    <Code className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">
                        Embed Code
                      </h3>
                      <Badge variant="secondary" className="text-xs font-semibold">
                        <Sparkles className="h-3 w-3 mr-1" />
                        15 Languages
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Multi-language embed snippets
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Get ready-to-use code snippets in <span className="font-semibold text-[var(--primary)]">15 different languages</span> and frameworks including JavaScript, React, Next.js, Vue, Python, and more.
                  </p>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                      <span>Syntax highlighting</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                      <span>One-click copy</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                      <span>Installation steps</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                      <span>Live preview</span>
                    </div>
                  </div>

                  <Link href={`/settings/${name.replace(/\.(com|net|org|io)$/, '')}/embed`}>
                    <Button 
                      type="button"
                      className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-semibold shadow-lg group/btn"
                    >
                      <Code className="h-4 w-4 mr-2" />
                      View Embed Instructions
                      <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="persona" className="scroll-mt-20">
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-6">
            <PersonaSelector
              chatBotId={chatBot?.id || ''}
              currentPersona={(chatBot?.persona as any) || 'SALES_AGENT'}
              currentCustomPrompt={chatBot?.customPrompt}
            />
          </div>
        </section>

        <section id="appearance" className="scroll-mt-20">
          <div className="relative min-h-[500px]"> 
            <div className={cn(
              "rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-6",
              isAppearanceLocked && 'opacity-40 blur-[1px] pointer-events-none' 
            )}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)] text-white">
                    <Palette className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)]">
                      Chatbot Appearance & Customization
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Customize your chatbot&apos;s look, feel, and behavior
                    </p>
                  </div>
                </div>

                {plan !== 'STANDARD' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(224,155,26,0.15)] border border-[var(--warning)]">
                    <span className="text-xs font-bold text-[var(--warning)] dark:text-[var(--warning)]">
                      ✨ PREMIUM
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[1fr,400px] gap-8">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
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

            {isAppearanceLocked && (
              <PlanLockedOverlay 
                currentPlan={plan} 
                feature="Chatbot Appearance"
              />
            )}
          </div>
        </section>

        <div className="flex gap-3 justify-end sticky bottom-0 bg-[var(--bg-page)]/95 backdrop-blur-sm py-4 border-t border-[var(--border-default)]">
          <Button
            onClick={onDeleteDomain}
            type="button"
            variant="outline"
            className="border-[rgba(224,85,85,0.3)] text-[var(--danger)] hover:bg-[rgba(224,85,85,0.08)]"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            <Loader loading={deleting}>Delete Domain</Loader>
          </Button>

          <Button
            type="submit"
            className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] hover:from-[var(--primary)] hover:to-[var(--primary-light)] text-white font-semibold shadow-lg shadow-[var(--primary)] px-8"
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