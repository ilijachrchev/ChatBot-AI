"use client"
import useSideBar from '@/context/use-sidebar'
import React from 'react'
import { Loader } from '../loader'
import { Switch } from '@radix-ui/react-switch'
import { Activity, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

type PageKey =
  | 'conversation'
  | 'settings'
  | 'dashboard'
  | 'appointment'
  | 'email-marketing'
  | 'integrations'
  | string

const LABELS: Record<string, { title: string; subtitle: string }> = {
  conversation: {
    title: 'Conversations',
    subtitle: 'View, search, and reply to customer chats.',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Manage your account settings, preferences, and integrations.',
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: 'A detailed overview of your metrics, usage, customers, and more.',
  },
  appointment: {
    title: 'Appointments',
    subtitle: 'View and edit all your appointments.',
  },
  'email-marketing': {
    title: 'Email Marketing',
    subtitle: 'Send bulk emails to your customers.',
  },
  integrations: {
    title: 'Integrations',
    subtitle: 'Connect third-party applications into SendWise-AI.',
  },
  default: {
    title: 'Conversations',
    subtitle: 'Modify domain settings, change chatbot options, and train your bot.',
  },
}

const BreadCrumb = () => {
  const {
    chatRoom,
    loading,
    onActivateRealtime,
    page,
    realtime,
  } = useSideBar()

  const pathname = usePathname()

  const isDomainPage = pathname?.startsWith('/settings/') && pathname.split('/').length >= 3
  const domainName = isDomainPage ? pathname.split('/')[2] : null

  const getCurrentPage = (): PageKey => {
    if (pathname?.includes('/integrations')) return 'integrations'
    if (pathname?.includes('/email-marketing')) return 'email-marketing'
    if (pathname?.includes('/appointment')) return 'appointment'
    if (pathname?.includes('/conversation')) return 'conversation'
    if (pathname?.includes('/settings')) return 'settings'
    if (pathname?.includes('/dashboard')) return 'dashboard'
    return page || 'default'
  }

  let title, subtitle

  if (isDomainPage && domainName) {
    const displayDomain = domainName.includes('.')
      ? domainName.toLowerCase()
      : `${domainName.toLowerCase()}.com`
    title = displayDomain
    subtitle = 'Configure domain settings, customize chatbot appearance, and manage your bot behavior.'
  } else {
    const key = getCurrentPage()
    const labels = LABELS[key] ?? LABELS.default
    title = labels.title
    subtitle = labels.subtitle
  }

  return (
    <div className="flex items-center gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground leading-none">
            {title}
          </h2>
          {isDomainPage && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary)] dark:bg-[var(--primary)] text-[var(--primary)] dark:text-[var(--primary)] text-xs font-medium">
              <Globe className="w-3 h-3" />
              Domain Settings
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5 hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      {page === 'conversation' && chatRoom && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border">
          <Activity
            className={cn(
              'w-4 h-4 transition-colors',
              realtime ? 'text-[var(--success)] animate-pulse' : 'text-muted-foreground'
            )}
          />
          <span className="text-sm font-medium text-foreground">
            {realtime ? 'Live' : 'Offline'}
          </span>
          <Loader loading={loading} className="p-0 inline">
            <Switch
              checked={realtime}
              onCheckedChange={onActivateRealtime}
              className={cn(
                'data-[state=checked]:bg-[var(--success)] data-[state=unchecked]:bg-[var(--bg-card)]',
                'dark:data-[state=checked]:bg-[var(--success)] dark:data-[state=unchecked]:bg-[var(--bg-card)]'
              )}
            />
          </Loader>
        </div>
      )}
    </div>
  )
}

export default BreadCrumb
