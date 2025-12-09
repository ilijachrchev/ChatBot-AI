export type WidgetSize = 'compact' | 'medium' | 'full'
export type WidgetStyle = 'solid' | 'soft' | 'glass'
export type Tab = 'chat' | 'helpdesk'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  link?: string
}

export interface ChatbotConfig {
  size: WidgetSize
  style: WidgetStyle
  icon?: string
  title?: string
  subtitle?: string
  welcomeMessage?: string
  theme?: string
  textColor?: string
  userBubbleColor?: string
  botBubbleColor?: string
  userTextColor?: string
  botTextColor?: string
  buttonStyle?: string
  bubbleStyle?: string
  showAvatars?: boolean
  plan?: 'STANDARD' | 'PRO' | 'ULTIMATE'
}