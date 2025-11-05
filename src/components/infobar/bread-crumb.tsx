"use client"
import useSideBar from '@/context/use-sidebar'
import React from 'react'
import { Loader } from '../loader'
import { Switch } from '@radix-ui/react-switch'

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
  // Fallback (when page is unknown):
  default: {
    title: 'Conversations',
    subtitle:
      'Modify domain settings, change chatbot options, enter sales questions, and train your bot to do what you want it to!',
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

  const key: PageKey = page || 'default'
  const { title, subtitle } = LABELS[key] ?? LABELS.default

  return (
    <div className="flex flex-col">
      <div className="flex gap-5 items-center">
        <h2 className="text-3xl font-bold capitalize">{title}</h2>

        {page === 'conversation' && chatRoom && (
          <Loader loading={loading} className="p-0 inline">
            <Switch
              defaultChecked={realtime}
              onClick={(e) => onActivateRealtime(e)}
              className="data-[state=checked]:bg-orange data-[state=unchecked]:bg-peach"
            />
          </Loader>
        )}
      </div>

      <p className="text-gray-500 text-sm">{subtitle}</p>
    </div>
  )
}

export default BreadCrumb
