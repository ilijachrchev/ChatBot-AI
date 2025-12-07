"use client"
import useSideBar from '@/context/use-sidebar'
import React from 'react'
import { Loader } from '../loader'
import { Switch } from '@radix-ui/react-switch'
import { Activity, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

type PageKey =
  | 'conversation'
  | 'settings'
  | 'dashboard'
  | 'appointment'
  | 'email-marketing'
  | 'integrations'
  | string

const LABELS: Record<string, { title: string; subtitle: string; icon?: string }> = {
  conversation: {
    title: 'Conversations',
    subtitle: 'View, search, and reply to customer chats.',
    icon: '/images/chat.png',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Manage your account settings, preferences, and integrations.',
    icon: '/images/settings.png',
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: 'A detailed overview of your metrics, usage, customers, and more.',
    icon: '/images/computer-screen.png',
  },
  appointment: {
    title: 'Appointments',
    subtitle: 'View and edit all your appointments.',
    icon: '/images/online-booking.png',
  },
  'email-marketing': {
    title: 'Email Marketing',
    subtitle: 'Send bulk emails to your customers.',
    icon: '/images/digital-marketing.png',
  },
  integrations: {
    title: 'Integrations',
    subtitle: 'Connect third-party applications into SendWise-AI.',
    icon: '/images/integration.png',
  },
  default: {
    title: 'Conversations',
    subtitle:
      'Modify domain settings, change chatbot options, enter sales questions, and train your bot to do what you want it to!',
      icon: '/images/chat.png',
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

  let title, subtitle, icon
  
  if (isDomainPage && domainName) {
    const displayDomain = domainName.includes('.') 
    ? domainName.toLowerCase() 
    : `${domainName.toLowerCase()}.com`
    
    title = displayDomain
    subtitle = 'Configure domain settings, customize chatbot appearance, and manage your bot behavior.'
    icon = '/images/domain.png'
  } else {
    const key = getCurrentPage() 
    const labels = LABELS[key] ?? LABELS.default
    title = labels.title
    subtitle = labels.subtitle
    icon = labels.icon
  }

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className='flex items-center gap-3'>
          {icon && (
            <div className='hidden sm:flex items-center justify-center w-10 h-10 md:h-12 rounded-xl
              bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900
              border border-blue-200 dark:border-blue-800
            '>
              <div className='relative w-full h-full'>
                <Image
                  src={icon}
                  alt={title}
                  fill
                  className='object-contain'
                />
              </div>
            </div>
          )}

          <div>
            <h2 className='text-2xl md:text-3xl font-bold text-slate-900 dark:text-white'>
              {title}
            </h2>
            {isDomainPage && (
              <span className='inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-md
               bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium'>
                <Globe className='w-3 h-3' />
                Domain Settings
              </span>
            )}
          </div>
        </div>
        {page === 'conversation' && chatRoom && (
          <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50
            dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700
          '>
            <Activity 
              className={cn(
                "w-4 h-4 transition-colors",
                realtime ? "text-emerald-500 animate-pulse" : "text-slate-400"
              )}
            />
            <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
              {realtime ? 'Live' : 'Offline'}
            </span>
            <Loader loading={loading} className='p-0 inline'>
              <Switch 
                checked={realtime}
                onCheckedChange={onActivateRealtime}
                className={cn(
                  "data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300",
                  "dark:data-[state=checked]:bg-emerald-600 dark:data-[state=unchecked]:bg-slate-600"
                )}
              />
            </Loader>
          </div>
        )}
      </div>

      <p className='text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed'>
        {subtitle}
      </p>
    </div>
  )
}

export default BreadCrumb
