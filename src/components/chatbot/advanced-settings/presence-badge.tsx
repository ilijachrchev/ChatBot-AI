'use client'

import React, { useEffect, useState } from 'react'
import { Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

type PresenceStatus = 'ONLINE' | 'AWAY' | 'OFFLINE'

interface PresenceBadgeProps {
  domainId: string
  showBadge?: boolean
  className?: string
}

export function PresenceBadge({ domainId, showBadge = true, className }: PresenceBadgeProps) {
  const [presence, setPresence] = useState<{
    status: PresenceStatus
    text: string
    color: string
  } | null>(null)

  useEffect(() => {
    const fetchPresence = async () => {
      try {
        const response = await fetch(`/api/chatbot/presence?domainId=${domainId}`)
        if (response.ok) {
          const data = await response.json()
          setPresence({
            status: data.presence.status,
            text: data.presence.badge.text,
            color: data.presence.badge.color,
          })
        }
      } catch (error) {
        console.error('Error fetching presence:', error)
      }
    }

    fetchPresence()

    const interval = setInterval(fetchPresence, 30000)

    return () => clearInterval(interval)
  }, [domainId])

  if (!showBadge || !presence) {
    return null
  }

  const colorClasses = {
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      dot: 'bg-green-500',
    },
    yellow: {
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      text: 'text-yellow-700 dark:text-yellow-300',
      dot: 'bg-yellow-500',
    },
    red: {
      bg: 'bg-red-100 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      dot: 'bg-red-500',
    },
  }

  const colors = colorClasses[presence.color as keyof typeof colorClasses] || colorClasses.green

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
        colors.bg,
        colors.text,
        className
      )}
    >
      <Circle className={cn('w-2 h-2 fill-current', colors.dot)} />
      <span>{presence.text}</span>
    </div>
  )
}