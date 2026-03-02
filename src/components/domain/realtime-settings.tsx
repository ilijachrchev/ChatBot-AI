'use client'

import React, { useState, useTransition } from 'react'
import { onUpdateDomainRealtimeEnabled } from '@/actions/settings'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Zap, MessageSquare, Database, User, WifiOff, TrendingDown } from 'lucide-react'

type Props = {
  domainId: string
  initialEnabled: boolean
}

export const RealtimeSettings = ({ domainId, initialEnabled }: Props) => {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isPending, startTransition] = useTransition()

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

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Realtime &amp; Human Handoff
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Control whether this chatbot uses live infrastructure or runs as a stateless AI assistant.
        </p>
      </div>

      {/* Toggle card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-900 dark:text-white">
              Enable Realtime &amp; Human Handoff
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
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

        {/* Status badge */}
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: enabled ? 'rgb(220 252 231)' : 'rgb(241 245 249)',
            color: enabled ? 'rgb(21 128 61)' : 'rgb(100 116 139)',
          }}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${enabled ? 'bg-green-500' : 'bg-slate-400'}`} />
          {enabled ? 'Realtime mode is ON' : 'Stateless AI mode is ON'}
        </div>
      </div>

      {/* What each mode does */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Realtime ON */}
        <div className={`rounded-xl border p-5 space-y-3 transition-opacity ${enabled ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20' : 'border-slate-200 dark:border-slate-800 opacity-50'}`}>
          <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
            <Zap className="h-4 w-4" />
            When Realtime is ON
          </div>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2"><MessageSquare className="h-3.5 w-3.5 flex-shrink-0" /> Conversations stored in database</li>
            <li className="flex items-center gap-2"><User className="h-3.5 w-3.5 flex-shrink-0" /> Human agents can take over</li>
            <li className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 flex-shrink-0" /> Live dashboard updates active</li>
            <li className="flex items-center gap-2"><Database className="h-3.5 w-3.5 flex-shrink-0" /> Full conversation history</li>
          </ul>
        </div>

        {/* Realtime OFF */}
        <div className={`rounded-xl border p-5 space-y-3 transition-opacity ${!enabled ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40' : 'border-slate-200 dark:border-slate-800 opacity-50'}`}>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            <WifiOff className="h-4 w-4" />
            When Realtime is OFF
          </div>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex items-center gap-2"><WifiOff className="h-3.5 w-3.5 flex-shrink-0" /> No socket connections opened</li>
            <li className="flex items-center gap-2"><Database className="h-3.5 w-3.5 flex-shrink-0" /> No messages stored in DB</li>
            <li className="flex items-center gap-2"><User className="h-3.5 w-3.5 flex-shrink-0" /> No human takeover available</li>
            <li className="flex items-center gap-2"><TrendingDown className="h-3.5 w-3.5 flex-shrink-0" /> Reduced infrastructure costs</li>
          </ul>
        </div>
      </div>

      {/* Info note */}
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Changes take effect immediately for new conversations. Existing open conversations are not affected.
      </p>
    </div>
  )
}
