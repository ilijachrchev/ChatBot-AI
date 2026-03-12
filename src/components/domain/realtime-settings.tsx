'use client'

import React, { useState, useTransition } from 'react'
import { onUpdateDomainRealtimeEnabled, onUpdateLiveNotificationsEnabled } from '@/actions/settings'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Zap, MessageSquare, Database, User, WifiOff, TrendingDown, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  domainId: string
  initialEnabled: boolean
  initialLiveNotifications: boolean
  ownerEmail: string
}

export const RealtimeSettings = ({
  domainId,
  initialEnabled,
  initialLiveNotifications,
  ownerEmail,
}: Props) => {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, startTransition] = useTransition()
  const [notificationsEnabled, setNotificationsEnabled] = useState(initialLiveNotifications)
  const [notifPending, startNotifTransition] = useTransition()

  const handleToggle = (value: boolean) => {
    setEnabled(value)
    startTransition(async () => {
      const result = await onUpdateDomainRealtimeEnabled(domainId, value)
      if (result?.status === 200) {
        toast.success(result.message)
      } else {
        setEnabled(!value)
        toast.error(result?.message ?? 'Failed to update setting')
      }
    })
  }

  const handleNotifToggle = (value: boolean) => {
    setNotificationsEnabled(value)
    startNotifTransition(async () => {
      const result = await onUpdateLiveNotificationsEnabled(domainId, value)
      if (result?.status === 200) {
        toast.success('Notification preference saved')
      } else {
        setNotificationsEnabled(!value)
        toast.error(result?.message ?? 'Failed to update notification setting')
      }
    })
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">
          Realtime &amp; Human Handoff
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-[var(--text-secondary)]">
          Control whether this chatbot uses live infrastructure or runs as a stateless AI assistant.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              Enable Realtime &amp; Human Handoff
            </p>
            <p className="text-sm text-slate-500 dark:text-[var(--text-secondary)]">
              When enabled, all conversations are stored in the database, live dashboard updates
              are active, and human agents can take over at any time.
            </p>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={isPending}
            aria-label="Toggle realtime mode"
          />
        </div>

        <div
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: enabled ? 'rgb(220 252 231)' : 'rgb(241 245 249)',
            color: enabled ? 'rgb(21 128 61)' : 'rgb(100 116 139)',
          }}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-green-500' : 'bg-slate-400'}`} />
          {enabled ? 'Realtime mode is ON' : 'Stateless AI mode is ON'}
        </div>
      </div>

      <div
        className={cn(
          'rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)] p-6 transition-opacity',
          !enabled && 'opacity-50 pointer-events-none'
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[var(--text-secondary)]" />
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Email notifications for live chat requests
              </p>
            </div>
            <p className="text-sm text-slate-500 dark:text-[var(--text-secondary)]">
              Get an email at{' '}
              <span className="font-medium text-[var(--text-secondary)]">{ownerEmail}</span>{' '}
              whenever a customer requests to speak with a human agent.
            </p>
            <p className="text-xs text-slate-400 dark:text-[var(--text-muted)]">
              Only sends when Realtime is enabled and a customer triggers handoff.
            </p>
          </div>
          <Switch
            checked={notificationsEnabled}
            onCheckedChange={handleNotifToggle}
            disabled={notifPending || !enabled}
            aria-label="Toggle live chat email notifications"
          />
        </div>

        <div
          className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: notificationsEnabled ? 'rgb(239 246 255)' : 'rgb(241 245 249)',
            color: notificationsEnabled ? 'rgb(29 78 216)' : 'rgb(100 116 139)',
          }}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${notificationsEnabled ? 'bg-indigo-500' : 'bg-slate-400'}`} />
          {notificationsEnabled ? 'Notifications ON' : 'Notifications OFF'}
        </div>

        {!enabled && (
          <p className="mt-3 text-xs text-slate-400 dark:text-[var(--text-muted)]">
            Enable Realtime first to use notifications.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`rounded-xl border p-5 space-y-3 transition-opacity ${enabled ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20' : 'border-[var(--border-default)] opacity-50'}`}>
          <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
            <Zap className="h-4 w-4" />
            When Realtime is ON
          </div>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5 flex-shrink-0" /> Conversations stored in database</li>
            <li className="flex items-center gap-2"><User className="h-3.5 w-3.5 flex-shrink-0" /> Human agents can take over</li>
            <li className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 flex-shrink-0" /> Live dashboard updates active</li>
            <li className="flex items-center gap-2"><Database className="h-3.5 w-3.5 flex-shrink-0" /> Full conversation history</li>
          </ul>
        </div>

        <div className={`rounded-xl border p-5 space-y-3 transition-opacity ${!enabled ? 'border-[var(--border-strong)] bg-slate-50 dark:bg-[var(--bg-page)]/40' : 'border-[var(--border-default)] opacity-50'}`}>
          <div className="flex items-center gap-2 text-sm font-medium text-[var(--text-secondary)]">
            <WifiOff className="h-4 w-4" />
            When Realtime is OFF
          </div>
          <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
            <li className="flex items-center gap-2"><WifiOff className="h-3.5 w-3.5 flex-shrink-0" /> No socket connections opened</li>
            <li className="flex items-center gap-2"><Database className="h-3.5 w-3.5 flex-shrink-0" /> No messages stored in DB</li>
            <li className="flex items-center gap-2"><User className="h-3.5 w-3.5 flex-shrink-0" /> No human takeover available</li>
            <li className="flex items-center gap-2"><TrendingDown className="h-3.5 w-3.5 flex-shrink-0" /> Reduced infrastructure costs</li>
          </ul>
        </div>
      </div>

      <p className="text-xs text-slate-400 dark:text-[var(--text-muted)]">
        Changes take effect immediately for new conversations. Existing open conversations are not affected.
      </p>
    </div>
  )
}
