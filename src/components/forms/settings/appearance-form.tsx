'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import {
  MessageSquare,
  Layout,
  Sparkles,
  Type,
  Code,
  Save,
  Info,
} from 'lucide-react'
import { ChatbotPreview } from './chatbot-preview'
import { ColorPicker } from './color-picker'
import {
  ChatPositionSelector,
  WidgetSizeSelector,
  WidgetStyleSelector,
  BubbleStyleSelector,
  ButtonStyleSelector,
  BubbleColors,
  ShowAvatarsToggle,
  RemoveBrandingToggle,
  HeaderFields,
  CustomCssField,
} from './chatbot-customization'
import { useSettings } from '@/hooks/settings/use-settings'
import { FeatureLockCard } from '@/components/plan/feature-lock-card'
import { cn } from '@/lib/utils'
import EditChatbotIcon from './edit-chatbot-icon'

const WelcomeMessage = dynamic(
  () => import('./greetings-message').then((props) => props.default),
  { ssr: false }
)

type SetValueFn = (name: string, value: unknown, options?: { shouldDirty?: boolean }) => void
type RegisterFn = (name: string) => object

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
    removeBranding?: boolean | null
    chatPosition?: string | null
    customCss?: string | null
  } | null
}

type SectionCardProps = {
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: string
  badge?: React.ReactNode
  children: React.ReactNode
  planRequired?: 'PRO' | 'ULTIMATE'
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  lockFeatureText?: string
}

const SectionCard = ({
  icon,
  iconBg,
  title,
  subtitle,
  badge,
  children,
  planRequired,
  plan,
  lockFeatureText,
}: SectionCardProps) => {
  const isLocked =
    planRequired === 'PRO'
      ? plan === 'STANDARD'
      : planRequired === 'ULTIMATE'
      ? plan !== 'ULTIMATE'
      : false

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg text-white', iconBg)}>
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
        {badge}
      </div>

      <div className="relative">
        <div className={cn(isLocked && 'opacity-40 blur-sm pointer-events-none select-none')}>
          {children}
        </div>
        {isLocked && lockFeatureText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <FeatureLockCard planRequired={planRequired!} feature={lockFeatureText} />
          </div>
        )}
      </div>
    </div>
  )
}

const PlanBadge = ({ label, color }: { label: string; color: 'blue' | 'amber' }) => (
  <span className={cn(
    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold',
    color === 'blue'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
  )}>
    {label}
  </span>
)

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
    watchedRemoveBranding,
    watchedChatPosition,
    setValue,
  } = useSettings(id, chatBot?.id || '')

  const sv = setValue as unknown as SetValueFn
  const reg = register as unknown as RegisterFn

  return (
    <form className="flex flex-col gap-4" onSubmit={onUpdateSettings}>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr,420px] gap-8 items-start">
        <div className="space-y-4">
          <SectionCard
            icon={<MessageSquare className="h-4 w-4" />}
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
            title="Basic Settings"
            subtitle="Core appearance settings"
            plan={plan}
          >
            <div className="space-y-4">
              <EditChatbotIcon register={register} errors={errors} chatBot={chatBot} />
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
          </SectionCard>

          <SectionCard
            icon={<Layout className="h-4 w-4" />}
            iconBg="bg-gradient-to-br from-green-500 to-green-600"
            title="Widget Layout"
            subtitle="Size and position of your chat widget"
            plan={plan}
          >
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Chat Position
                </p>
                <ChatPositionSelector setValue={sv} currentValue={chatBot?.chatPosition} />
                <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900">
                  <Info className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    Position changes take effect when you re-embed the widget. Re-copy your embed code after changing position.
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Widget Size
                </p>
                <WidgetSizeSelector setValue={sv} currentValue={chatBot?.widgetSize} />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={<Sparkles className="h-4 w-4" />}
            iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
            title="Widget Style"
            subtitle="Visual style of the chat window"
            badge={<PlanBadge label="Pro" color="blue" />}
            plan={plan}
            planRequired="PRO"
            lockFeatureText="Widget styles are available on the Pro plan"
          >
            <WidgetStyleSelector setValue={sv} currentValue={chatBot?.widgetStyle} />
          </SectionCard>

          <SectionCard
            icon={<Type className="h-4 w-4" />}
            iconBg="bg-gradient-to-br from-amber-500 to-amber-600"
            title="Header & Branding"
            subtitle="Customize your chatbot's identity"
            badge={<PlanBadge label="Pro" color="blue" />}
            plan={plan}
            planRequired="PRO"
            lockFeatureText="Branding customization is available on the Pro plan"
          >
            <div className="space-y-4">
              <HeaderFields
                register={reg}
                errors={errors}
                currentValues={{
                  chatbotTitle: chatBot?.chatbotTitle,
                  chatbotSubtitle: chatBot?.chatbotSubtitle,
                }}
              />
              <RemoveBrandingToggle setValue={sv} currentValue={chatBot?.removeBranding} />
            </div>
          </SectionCard>

          <SectionCard
            icon={<MessageSquare className="h-4 w-4" />}
            iconBg="bg-gradient-to-br from-rose-500 to-rose-600"
            title="Message Bubbles"
            subtitle="Colors and style of chat messages"
            badge={<PlanBadge label="Pro" color="blue" />}
            plan={plan}
            planRequired="PRO"
            lockFeatureText="Message bubble customization is available on the Pro plan"
          >
            <div className="space-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Bubble Colors
                </p>
                <BubbleColors
                  register={reg}
                  setValue={sv}
                  currentValues={{
                    userBubbleColor: chatBot?.userBubbleColor,
                    userTextColor: chatBot?.userTextColor,
                    botBubbleColor: chatBot?.botBubbleColor,
                    botTextColor: chatBot?.botTextColor,
                  }}
                />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Bubble Style
                </p>
                <BubbleStyleSelector setValue={sv} currentValue={chatBot?.bubbleStyle} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Button Style
                </p>
                <ButtonStyleSelector setValue={sv} currentValue={chatBot?.buttonStyle} />
              </div>
              <ShowAvatarsToggle setValue={sv} currentValue={chatBot?.showAvatars} />
            </div>
          </SectionCard>

          <SectionCard
            icon={<Code className="h-4 w-4" />}
            iconBg="bg-gradient-to-br from-slate-500 to-slate-700"
            title="Advanced"
            subtitle="Custom CSS for power users"
            badge={<PlanBadge label="Ultimate" color="amber" />}
            plan={plan}
            planRequired="ULTIMATE"
            lockFeatureText="Custom CSS injection is available on the Ultimate plan"
          >
            <CustomCssField register={reg} currentValue={chatBot?.customCss} />
          </SectionCard>
        </div>

        <div className="xl:sticky xl:top-6 xl:self-start">
          <ChatbotPreview
            icon={chatBot?.icon}
            welcomeMessage={watchedWelcomeMessage || chatBot?.welcomeMessage}
            previewIcon={previewIcon}
            chatbotColor={(watchedColor as string) || chatBot?.backgroundColor || '#3B82F6'}
            chatbotTitle={(watchedTitle as string) || chatBot?.chatbotTitle}
            chatbotSubtitle={(watchedSubtitle as string) || chatBot?.chatbotSubtitle}
            userBubbleColor={(watchedUserBubbleColor as string) || chatBot?.userBubbleColor}
            botBubbleColor={(watchedBotBubbleColor as string) || chatBot?.botBubbleColor}
            userTextColor={(watchedUserTextColor as string) || chatBot?.userTextColor}
            botTextColor={(watchedBotTextColor as string) || chatBot?.botTextColor}
            buttonStyle={(watchedButtonStyle as string) || chatBot?.buttonStyle}
            bubbleStyle={(watchedBubbleStyle as string) || chatBot?.bubbleStyle}
            widgetSize={(watchedWidgetSize as string) || chatBot?.widgetSize}
            widgetStyle={(watchedWidgetStyle as string) || chatBot?.widgetStyle}
            showAvatars={watchedShowAvatars ?? chatBot?.showAvatars}
            removeBranding={watchedRemoveBranding ?? chatBot?.removeBranding}
            chatPosition={(watchedChatPosition as string) || chatBot?.chatPosition}
          />
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
