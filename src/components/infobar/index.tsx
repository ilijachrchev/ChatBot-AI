'use client'
import React, { useEffect, useState } from 'react'
import BreadCrumb from './bread-crumb'
import {
  Headphones,
  Bell,
  User,
  Shield,
  Settings as SettingsIcon,
  LogOut,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  CreditCard,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useClerk, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useNotifications } from '@/hooks/notifications/use-notifications'
import { Skeleton } from '@/components/ui/skeleton'
import type { NotificationType, Notification } from '@/types/notification'

type Props = Record<string, never>

const getRelativeTime = (date: Date): string => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const notificationIcon = (type: NotificationType) => {
  const base = 'h-4 w-4'
  switch (type) {
    case 'LIVE_CHAT_REQUEST':
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
          <MessageSquare className={cn(base, 'text-red-600 dark:text-red-400')} />
        </div>
      )
    case 'NEW_LEAD':
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
          <User className={cn(base, 'text-blue-600 dark:text-blue-400')} />
        </div>
      )
    case 'CONVERSATION_LIMIT':
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
          <AlertTriangle className={cn(base, 'text-amber-600 dark:text-amber-400')} />
        </div>
      )
    case 'SCRAPING_COMPLETE':
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
          <CheckCircle className={cn(base, 'text-green-600 dark:text-green-400')} />
        </div>
      )
    case 'PAYMENT_FAILED':
      return (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
          <CreditCard className={cn(base, 'text-red-600 dark:text-red-400')} />
        </div>
      )
  }
}

const NotificationItem = ({
  notification,
  onDelete,
}: {
  notification: Notification
  onDelete: (id: string) => void
}) => (
  <div
    className={cn(
      'group relative flex w-full items-start gap-3 px-4 py-3',
      'cursor-default transition-colors hover:bg-muted/50',
      !notification.read && 'border-l-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/10'
    )}
  >
    {notificationIcon(notification.type as NotificationType)}
    <div className="min-w-0 flex-1">
      <p
        className={cn(
          'text-sm',
          notification.read ? 'font-normal' : 'font-semibold'
        )}
      >
        {notification.title}
      </p>
      <p className="line-clamp-2 text-xs text-muted-foreground">{notification.message}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {getRelativeTime(notification.createdAt)}
      </p>
    </div>
    <button
      onClick={(e) => {
        e.stopPropagation()
        onDelete(notification.id)
      }}
      className="opacity-0 transition-opacity group-hover:opacity-100 shrink-0 rounded p-0.5 hover:bg-muted"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
)

const InfoBar = (props: Props) => {
  const { user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [customAvatar, setCustomAvatar] = useState<string | null>(null)
  const { notifications, unreadCount, loading, open, onOpen, onClose, onDelete } =
    useNotifications()

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const response = await fetch('/api/user/avatar')
        if (response.ok) {
          const data = await response.json()
          if (data.avatar) {
            setCustomAvatar(data.avatar)
          }
        }
      } catch (error) {
        console.error('Failed to fetch avatar:', error)
      }
    }
    if (user) {
      fetchAvatar()
    }
  }, [user])

  const displayName = [user?.firstName ?? '', user?.lastName ?? ''].join(' ').trim()

  const onSignOut = () => signOut(() => router.push('/'))

  const avatarUrl = customAvatar || user?.imageUrl

  return (
    <div className="flex w-full justify-between items-start md:items-center py-3 md:py-4 mb-4 md:mb-6 gap-4 flex-col md:flex-row">
      <BreadCrumb />

      <div className="flex gap-2 md:gap-3 items-center">
        <DropdownMenu open={open} onOpenChange={(v) => (v ? onOpen() : onClose())}>
          <DropdownMenuTrigger asChild>
            <div className="relative">
              <button
                className={cn(
                  'h-9 w-9 md:h-10 md:w-10 rounded-lg',
                  'border border-slate-200 dark:border-slate-700',
                  'bg-white dark:bg-slate-900',
                  'hover:bg-slate-50 dark:hover:bg-slate-800',
                  'hover:border-blue-300 dark:hover:border-blue-700',
                  'transition-all duration-200',
                  'flex items-center justify-center group'
                )}
              >
                <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
              </button>
              {unreadCount > 0 && (
                <span
                  className={cn(
                    'absolute -top-1 -right-1',
                    'h-5 min-w-[20px] px-1 rounded-full',
                    'bg-gradient-to-br from-rose-500 to-rose-600',
                    'text-white text-xs font-semibold',
                    'flex items-center justify-center',
                    'shadow-lg shadow-rose-500/50',
                    'ring-2 ring-white dark:ring-slate-900'
                  )}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              {unreadCount > 0 && (
                <button
                  onClick={onOpen}
                  className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <>
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-start gap-3 px-4 py-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-2 w-1/4" />
                      </div>
                    </div>
                  ))}
                </>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10">
                  <Bell className="h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/70 text-center px-6">
                    Activity like live chat requests and new leads will appear here
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <NotificationItem key={n.id} notification={n} onDelete={onDelete} />
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="border-t flex items-center justify-center py-2">
                <button
                  onClick={() => {
                    notifications.forEach((n) => onDelete(n.id))
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Avatar
          className={cn(
            'h-9 w-9 md:h-10 md:w-10',
            'ring-2 ring-offset-2 ring-blue-500/20',
            'hover:ring-blue-500/40',
            'transition-all cursor-pointer',
            'ring-offset-white dark:ring-offset-slate-950'
          )}
        >
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <Headphones className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar
              className={cn(
                'h-9 w-9 md:h-10 md:w-10',
                'ring-2 ring-offset-2 ring-slate-200 dark:ring-slate-700',
                'hover:ring-blue-500/40',
                'transition-all cursor-pointer',
                'ring-offset-white dark:ring-offset-slate-950'
              )}
            >
              <AvatarImage src={avatarUrl || undefined} alt={displayName || 'User'} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white font-semibold">
                {displayName.charAt(0) ||
                  user?.emailAddresses[0]?.emailAddress.charAt(0) ||
                  'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-64 p-2">
            <DropdownMenuLabel className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={avatarUrl || undefined} alt={displayName || 'User'} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-lg">
                    {displayName.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <p className="font-semibold text-sm truncate">{displayName || 'User'}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/account/profile" className="flex items-center gap-3 px-2 py-2.5 rounded-md">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Profile</span>
                  <span className="text-xs text-muted-foreground">Personal information</span>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/account/security" className="flex items-center gap-3 px-2 py-2.5 rounded-md">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Security</span>
                  <span className="text-xs text-muted-foreground">Password & authentication</span>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/account/preferences" className="flex items-center gap-3 px-2 py-2.5 rounded-md">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <SettingsIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Preferences</span>
                  <span className="text-xs text-muted-foreground">Notifications & settings</span>
                </div>
              </Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={onSignOut}
              className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <div className="flex items-center gap-3 px-2 py-2.5 w-full rounded-md">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-sm font-medium">Sign Out</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default InfoBar
