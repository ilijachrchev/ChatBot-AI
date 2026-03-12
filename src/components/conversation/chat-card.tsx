"use client"
import { useChatTime } from '@/hooks/conversation/use-conversation'
import React from 'react'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

type Props = {
  title: string
  description?: string
  createdAt: Date
  id: string
  onChat(): void
  seen?: boolean
  starred?: boolean
  status?: string
  onStar?: (id: string, starred: boolean) => void
}

const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
]

function getAvatarColor(email: string): string {
  const code = email.charCodeAt(0) || 0
  return AVATAR_COLORS[code % 5]
}

const ChatCard = ({
  title,
  description,
  createdAt,
  onChat,
  id,
  seen,
  starred = false,
  status = 'OPEN',
  onStar,
}: Props) => {
  const { messageSentAt, urgent } = useChatTime(createdAt, id)

  const initial = title ? title.charAt(0).toUpperCase() : '?'
  const avatarColor = getAvatarColor(title || '')
  const isUnread = !seen
  const preview = description
    ? description.substring(0, 40) + (description.length > 40 ? '...' : '')
    : 'This chatroom is empty'

  return (
    <div
      onClick={onChat}
      className={cn(
        'group relative flex items-center gap-3 w-full py-3 px-4 cursor-pointer',
        'transition-all duration-150',
        'hover:bg-muted/50',
        isUnread
          ? 'border-l-2 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/10'
          : 'border-l-2 border-l-transparent'
      )}
    >
      <div className="flex-shrink-0 relative">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm',
            avatarColor
          )}
        >
          {initial}
        </div>
        {urgent && !seen && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse border-2 border-background" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'text-sm truncate',
              isUnread ? 'font-semibold' : 'font-medium'
            )}
          >
            {title || 'Anonymous'}
          </span>
          <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
            {createdAt ? messageSentAt : ''}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">{preview}</span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
            )}
            {status === 'RESOLVED' && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                Resolved
              </span>
            )}
            {status === 'PENDING' && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                Pending
              </span>
            )}
          </div>
        </div>
      </div>

      {starred && !onStar && (
        <div className="absolute right-3 top-2">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
        </div>
      )}

      {onStar && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onStar(id, !starred)
          }}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-all duration-150',
            starred
              ? 'text-amber-400'
              : 'opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-amber-400'
          )}
        >
          <Star
            className={cn(
              'h-3.5 w-3.5',
              starred && 'fill-amber-400'
            )}
          />
        </button>
      )}
    </div>
  )
}

export default ChatCard
