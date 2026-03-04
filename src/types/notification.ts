export type NotificationType =
  | 'LIVE_CHAT_REQUEST'
  | 'NEW_LEAD'
  | 'CONVERSATION_LIMIT'
  | 'SCRAPING_COMPLETE'
  | 'PAYMENT_FAILED'

export type Notification = {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  data: Record<string, unknown> | null
  createdAt: Date
}
