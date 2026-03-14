'use client'
import React from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type StyleOption = { id: string; name: string; preview: string }
type SizeOption = { id: string; name: string; dimensions: string; description: string }
type WidgetStyleOption = { id: string; name: string; description: string; gradient: string }
type ChatbotCustomizationProps = {
  register: any
  errors: any
  setValue: any
  currentValues?: ChatbotSectionValues
}

const BUTTON_STYLES: StyleOption[] = [
  { id: 'ROUNDED', name: 'Rounded', preview: 'rounded-lg' },
  { id: 'SQUARE', name: 'Square', preview: 'rounded-none' },
  { id: 'PILL', name: 'Pill', preview: 'rounded-full' },
]

const BUBBLE_STYLES: StyleOption[] = [
  { id: 'ROUNDED', name: 'Rounded', preview: 'rounded-2xl' },
  { id: 'SQUARE', name: 'Square', preview: 'rounded-none' },
  { id: 'PILL', name: 'Pill', preview: 'rounded-full' },
]

const WIDGET_SIZES: SizeOption[] = [
  { id: 'COMPACT', name: 'Compact', dimensions: '360×500px', description: 'Small & minimal' },
  { id: 'MEDIUM', name: 'Medium', dimensions: '420×600px', description: 'Balanced size' },
  { id: 'FULL', name: 'Full', dimensions: '480×700px', description: 'Maximum space' },
]

const WIDGET_STYLES: WidgetStyleOption[] = [
  { id: 'SOLID', name: 'Solid', description: 'Clean background', gradient: 'bg-[var(--bg-surface)] border-2 border-[var(--border)]' },
  { id: 'SOFT', name: 'Soft', description: 'Subtle backdrop', gradient: 'bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-card)] border-2 border-[var(--border)]/50' },
  { id: 'GLASS', name: 'Glass', description: 'Frosted glass', gradient: 'bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm border-2 border-white/20 shadow-xl' },
]

const CHAT_POSITIONS = [
  {
    id: 'BOTTOM_RIGHT',
    name: 'Bottom Right',
    diagram: (
      <svg viewBox="0 0 40 28" className="w-10 h-7" fill="none">
        <rect x="1" y="1" width="38" height="26" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)]" />
        <circle cx="33" cy="22" r="3.5" fill="currentColor" className="text-[var(--primary)]" />
      </svg>
    ),
  },
  {
    id: 'BOTTOM_LEFT',
    name: 'Bottom Left',
    diagram: (
      <svg viewBox="0 0 40 28" className="w-10 h-7" fill="none">
        <rect x="1" y="1" width="38" height="26" rx="3" stroke="currentColor" strokeWidth="1.5" className="text-[var(--text-muted)]" />
        <circle cx="7" cy="22" r="3.5" fill="currentColor" className="text-[var(--primary)]" />
      </svg>
    ),
  },
]

type SharedProps = {
  setValue: any
}

export type ChatbotSectionValues = {
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
  chatPosition?: string | null
  removeBranding?: boolean | null
  customCss?: string | null
}

type ChatPositionSelectorProps = SharedProps & {
  currentValue?: string | null
}

export const ChatPositionSelector = ({ setValue, currentValue }: ChatPositionSelectorProps) => {
  const [selected, setSelected] = React.useState(currentValue || 'BOTTOM_RIGHT')

  const handle = (id: string) => {
    setSelected(id)
    setValue('chatPosition', id, { shouldDirty: true })
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {CHAT_POSITIONS.map((pos) => (
        <button
          key={pos.id}
          type="button"
          onClick={() => handle(pos.id)}
          className={cn(
            'p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md flex flex-col items-center gap-2',
            selected === pos.id
              ? 'border-[var(--primary)] bg-[var(--primary)] dark:bg-[var(--primary)] ring-2 ring-[var(--primary)]'
              : 'border-[var(--border-default)] hover:border-[var(--primary)]'
          )}
        >
          {pos.diagram}
          <span className="text-xs font-semibold text-[var(--text-secondary)]">{pos.name}</span>
        </button>
      ))}
    </div>
  )
}

type WidgetSizeSelectorProps = SharedProps & { currentValue?: string | null }

export const WidgetSizeSelector = ({ setValue, currentValue }: WidgetSizeSelectorProps) => {
  const [selected, setSelected] = React.useState(currentValue || 'MEDIUM')

  const handle = (id: string) => {
    setSelected(id)
    setValue('widgetSize', id, { shouldDirty: true })
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {WIDGET_SIZES.map((size) => (
        <button
          key={size.id}
          type="button"
          onClick={() => handle(size.id)}
          className={cn(
            'p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md',
            selected === size.id
              ? 'border-[var(--primary)] bg-[var(--primary)] dark:bg-[var(--primary)] ring-2 ring-[var(--primary)]'
              : 'border-[var(--border-default)] hover:border-[var(--primary)]'
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="text-sm font-semibold text-[var(--text-secondary)]">{size.name}</div>
            <div className="text-xs text-[var(--text-muted)]">{size.dimensions}</div>
            <div className="text-[10px] text-[var(--text-muted)]">{size.description}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

type WidgetStyleSelectorProps = SharedProps & { currentValue?: string | null }

export const WidgetStyleSelector = ({ setValue, currentValue }: WidgetStyleSelectorProps) => {
  const [selected, setSelected] = React.useState(currentValue || 'SOLID')

  const handle = (id: string) => {
    setSelected(id)
    setValue('widgetStyle', id, { shouldDirty: true })
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {WIDGET_STYLES.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => handle(style.id)}
          className={cn(
            'p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md',
            selected === style.id
              ? 'border-[var(--primary)] bg-[var(--primary-light)] ring-2 ring-[var(--primary)]/20'
              : 'border-[var(--border-default)] hover:border-[var(--primary)]'
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <div className={cn('w-full h-16 rounded-lg', style.gradient)} />
            <div className="text-center">
              <div className="text-sm font-semibold text-[var(--text-secondary)]">{style.name}</div>
              <div className="text-xs text-[var(--text-muted)] mt-1">{style.description}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

type BubbleStyleSelectorProps = SharedProps & { currentValue?: string | null }

export const BubbleStyleSelector = ({ setValue, currentValue }: BubbleStyleSelectorProps) => {
  const [selected, setSelected] = React.useState(currentValue || 'ROUNDED')

  const handle = (id: string) => {
    setSelected(id)
    setValue('bubbleStyle', id, { shouldDirty: true })
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {BUBBLE_STYLES.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => handle(style.id)}
          className={cn(
            'p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md',
            selected === style.id
              ? 'border-[var(--primary)] bg-[var(--primary-light)]'
              : 'border-[var(--border-default)] hover:border-[var(--primary)]'
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              <div className={cn('w-12 h-8 bg-[var(--primary)]', style.preview)} />
              <div className={cn('w-12 h-8 bg-[var(--border)]', style.preview)} />
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)]">{style.name}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

type ButtonStyleSelectorProps = SharedProps & { currentValue?: string | null }

export const ButtonStyleSelector = ({ setValue, currentValue }: ButtonStyleSelectorProps) => {
  const [selected, setSelected] = React.useState(currentValue || 'ROUNDED')

  const handle = (id: string) => {
    setSelected(id)
    setValue('buttonStyle', id, { shouldDirty: true })
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {BUTTON_STYLES.map((style) => (
        <button
          key={style.id}
          type="button"
          onClick={() => handle(style.id)}
          className={cn(
            'p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md',
            selected === style.id
              ? 'border-[var(--primary)] bg-[var(--primary)] dark:bg-[var(--primary)]'
              : 'border-[var(--border-default)] hover:border-[var(--primary)]'
          )}
        >
          <div className="flex flex-col items-center gap-2">
            <div className={cn('w-16 h-10 bg-[var(--primary)] flex items-center justify-center text-white text-xs font-medium', style.preview)}>
              Button
            </div>
            <span className="text-xs font-medium text-[var(--text-secondary)]">{style.name}</span>
          </div>
        </button>
      ))}
    </div>
  )
}

type BubbleColorsProps = SharedProps & {
  register: (name: string) => object
  currentValues?: Pick<ChatbotSectionValues, 'userBubbleColor' | 'userTextColor' | 'botBubbleColor' | 'botTextColor'>
}

export const BubbleColors = ({ register, setValue, currentValues }: BubbleColorsProps) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { id: 'userBubbleColor', label: 'User Bubble', default: '#3B82F6', current: currentValues?.userBubbleColor },
      { id: 'userTextColor', label: 'User Text', default: '#FFFFFF', current: currentValues?.userTextColor },
      { id: 'botBubbleColor', label: 'Bot Bubble', default: '#F1F5F9', current: currentValues?.botBubbleColor },
      { id: 'botTextColor', label: 'Bot Text', default: '#1E293B', current: currentValues?.botTextColor },
    ].map((field) => (
      <div key={field.id} className="space-y-2">
        <Label htmlFor={field.id} className="text-xs font-medium">{field.label}</Label>
        <input
          type="color"
          id={field.id}
          {...register(field.id)}
          defaultValue={field.current || field.default}
          onChange={(e) => setValue(field.id, e.target.value, { shouldDirty: true })}
          className="h-10 w-full rounded-md border cursor-pointer"
        />
      </div>
    ))}
  </div>
)

type ShowAvatarsToggleProps = {
  currentValue?: boolean | null
  setValue: (name: string, value: unknown, options?: { shouldDirty?: boolean }) => void
}

export const ShowAvatarsToggle = ({ currentValue, setValue }: ShowAvatarsToggleProps) => {
  const [checked, setChecked] = React.useState(currentValue ?? true)

  const handle = (val: boolean) => {
    setChecked(val)
    setValue('showAvatars', val, { shouldDirty: true })
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
      <div className="space-y-0.5">
        <Label htmlFor="showAvatars" className="text-sm font-medium cursor-pointer">Show Team Avatars</Label>
        <p className="text-xs text-[var(--text-muted)]">Display team member avatars in the header (top right)</p>
      </div>
      <Switch id="showAvatars" checked={checked} onCheckedChange={handle} />
    </div>
  )
}

type RemoveBrandingToggleProps = {
  currentValue?: boolean | null
  setValue: (name: string, value: unknown, options?: { shouldDirty?: boolean }) => void
}

export const RemoveBrandingToggle = ({ currentValue, setValue }: RemoveBrandingToggleProps) => {
  const [checked, setChecked] = React.useState(currentValue ?? false)

  const handle = (val: boolean) => {
    setChecked(val)
    setValue('removeBranding', val, { shouldDirty: true })
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
      <div className="space-y-0.5">
        <Label htmlFor="removeBranding" className="text-sm font-medium cursor-pointer">Remove SendWise branding</Label>
        <p className="text-xs text-[var(--text-muted)]">Hide the &ldquo;Powered by SendWise AI&rdquo; footer</p>
      </div>
      <Switch id="removeBranding" checked={checked} onCheckedChange={handle} />
    </div>
  )
}

type HeaderFieldsProps = {
  register: (name: string) => object
  errors: Record<string, { message?: string } | undefined>
  currentValues?: Pick<ChatbotSectionValues, 'chatbotTitle' | 'chatbotSubtitle'>
}

export const HeaderFields = ({ register, errors, currentValues }: HeaderFieldsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="chatbotTitle" className="text-sm font-medium">Title</Label>
      <Input
        id="chatbotTitle"
        {...register('chatbotTitle')}
        defaultValue={currentValues?.chatbotTitle || 'SendWise-AI'}
        placeholder="SendWise-AI"
      />
      {errors.chatbotTitle && <p className="text-sm text-[var(--danger)]">{errors.chatbotTitle.message}</p>}
    </div>
    <div className="space-y-2">
      <Label htmlFor="chatbotSubtitle" className="text-sm font-medium">Subtitle</Label>
      <Input
        id="chatbotSubtitle"
        {...register('chatbotSubtitle')}
        defaultValue={currentValues?.chatbotSubtitle || 'Your AI assistant'}
        placeholder="Your AI assistant"
      />
      {errors.chatbotSubtitle && <p className="text-sm text-[var(--danger)]">{errors.chatbotSubtitle.message}</p>}
    </div>
  </div>
)

type CustomCssFieldProps = {
  register: (name: string) => object
  currentValue?: string | null
}

export const CustomCssField = ({ register, currentValue }: CustomCssFieldProps) => (
  <div className="space-y-2">
    <Label htmlFor="customCss" className="text-sm font-medium">Custom CSS</Label>
    <p className="text-xs text-[var(--text-muted)]">Inject custom CSS directly into the chat widget</p>
    <Textarea
      id="customCss"
      {...register('customCss')}
      defaultValue={currentValue || ''}
      placeholder={`.chat-widget {\n  /* your styles here */\n}`}
      className="min-h-[160px] font-mono text-sm"
    />
  </div>
)

export const ChatbotCustomization = ({
  register,
  errors,
  setValue,
  currentValues,
}: ChatbotCustomizationProps) => {
  return (
    <div className="space-y-6">
      <HeaderFields
        register={register}
        errors={errors}
        currentValues={{
          chatbotTitle: currentValues?.chatbotTitle,
          chatbotSubtitle: currentValues?.chatbotSubtitle,
        }}
      />

      <BubbleColors
        register={register}
        setValue={setValue}
        currentValues={{
          userBubbleColor: currentValues?.userBubbleColor,
          userTextColor: currentValues?.userTextColor,
          botBubbleColor: currentValues?.botBubbleColor,
          botTextColor: currentValues?.botTextColor,
        }}
      />

      <ButtonStyleSelector
        setValue={setValue}
        currentValue={currentValues?.buttonStyle}
      />

      <BubbleStyleSelector
        setValue={setValue}
        currentValue={currentValues?.bubbleStyle}
      />

      <WidgetSizeSelector
        setValue={setValue}
        currentValue={currentValues?.widgetSize}
      />

      <WidgetStyleSelector
        setValue={setValue}
        currentValue={currentValues?.widgetStyle}
      />

      <ShowAvatarsToggle
        setValue={setValue}
        currentValue={currentValues?.showAvatars}
      />
    </div>
  )
}