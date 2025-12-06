'use client'
import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input' 
import { Switch } from '@/components/ui/switch' 
import { Paintbrush, Type, Layout } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  register: any
  errors: any
  setValue: any
  currentValues?: {
    chatbotTitle?: string | null
    chatbotSubtitle?: string | null
    userBubbleColor?: string | null
    botBubbleColor?: string | null
    userTextColor?: string | null
    botTextColor?: string | null
    buttonStyle?: string | null
    showAvatars?: boolean | null
  }
}

const BUTTON_STYLES = [
  { id: 'ROUNDED', name: 'Rounded', preview: 'rounded-lg' },
  { id: 'SQUARE', name: 'Square', preview: 'rounded-none' },
  { id: 'PILL', name: 'Pill', preview: 'rounded-full' },
]

export const ChatbotCustomization = ({ 
  register, 
  errors, 
  setValue,
  currentValues 
}: Props) => {
  const [selectedButtonStyle, setSelectedButtonStyle] = React.useState(
    currentValues?.buttonStyle || 'ROUNDED'
  )
  const [showAvatars, setShowAvatars] = React.useState(
    currentValues?.showAvatars ?? true
  )

  React.useEffect(() => {
    register('chatbotTitle')
    register('chatbotSubtitle')
    register('userBubbleColor')
    register('botBubbleColor')
    register('userTextColor')
    register('botTextColor')
    register('buttonStyle')
    register('showAvatars')
  }, [register])

  const handleButtonStyleChange = (style: string) => {
    setSelectedButtonStyle(style)
    setValue('buttonStyle', style, { shouldDirty: true })
  }

  const handleAvatarToggle = (checked: boolean) => {
    setShowAvatars(checked)
    setValue('showAvatars', checked, { shouldDirty: true })
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Paintbrush className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-bold text-slate-950 dark:text-white">
            Advanced Customization
          </h3>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Fully customize your chatbot's appearance and branding
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Type className="h-4 w-4 text-slate-600" />
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Chatbot Header
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="chatbotTitle" className="text-sm font-medium">
              Title
            </Label>
            <Input
              id="chatbotTitle"
              {...register('chatbotTitle')}
              defaultValue={currentValues?.chatbotTitle || 'Sales Rep - AI'}
              placeholder="Sales Rep - AI"
              className="w-full"
            />
            {errors.chatbotTitle && (
              <p className="text-sm text-red-500">{errors.chatbotTitle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="chatbotSubtitle" className="text-sm font-medium">
              Subtitle
            </Label>
            <Input
              id="chatbotSubtitle"
              {...register('chatbotSubtitle')}
              defaultValue={currentValues?.chatbotSubtitle || ''}
              placeholder="Your company name"
              className="w-full"
            />
            {errors.chatbotSubtitle && (
              <p className="text-sm text-red-500">{errors.chatbotSubtitle.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Paintbrush className="h-4 w-4 text-slate-600" />
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Message Bubble Colors
          </h4>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="userBubbleColor" className="text-xs font-medium">
              User Bubble
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="userBubbleColor"
                {...register('userBubbleColor')}
                defaultValue={currentValues?.userBubbleColor || '#3B82F6'}
                className="h-10 w-full rounded-md border cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userTextColor" className="text-xs font-medium">
              User Text
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="userTextColor"
                {...register('userTextColor')}
                defaultValue={currentValues?.userTextColor || '#FFFFFF'}
                className="h-10 w-full rounded-md border cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="botBubbleColor" className="text-xs font-medium">
              Bot Bubble
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="botBubbleColor"
                {...register('botBubbleColor')}
                defaultValue={currentValues?.botBubbleColor || '#F1F5F9'}
                className="h-10 w-full rounded-md border cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="botTextColor" className="text-xs font-medium">
              Bot Text
            </Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                id="botTextColor"
                {...register('botTextColor')}
                defaultValue={currentValues?.botTextColor || '#1E293B'}
                className="h-10 w-full rounded-md border cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-3">
          <Layout className="h-4 w-4 text-slate-600" />
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Button Style
          </h4>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {BUTTON_STYLES.map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => handleButtonStyleChange(style.id)}
              className={cn(
                'p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md',
                selectedButtonStyle === style.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'
              )}
            >
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'w-16 h-10 bg-blue-500 flex items-center justify-center text-white text-xs font-medium',
                    style.preview
                  )}
                >
                  Button
                </div>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  {style.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-slate-900 dark:text-white">
          Display Options
        </h4>

        <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="space-y-0.5">
            <Label htmlFor="showAvatars" className="text-sm font-medium cursor-pointer">
              Show Team Avatars
            </Label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Display team member avatars in the header (top right)
            </p>
          </div>
          <Switch
            id="showAvatars"
            checked={showAvatars}
            onCheckedChange={handleAvatarToggle}
          />
        </div>
      </div>
    </div>
  )
}