'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { Activity, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { PLAN_LIMITS, type PlanType } from '@/constants/pricing'

type EnhancedPlanUsageProps = {
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  creditsUsed: number
  creditLimit: number
  domainsUsed: number
  domainLimit: number
  clientsUsed: number
  clientLimit: number
}

const PLAN_BADGE: Record<string, string> = {
  STANDARD: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  PRO: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  ULTIMATE: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
}

const PLAN_BUTTON: Record<string, string> = {
  STANDARD:
    'bg-zinc-900 hover:bg-zinc-700 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900',
  PRO: 'bg-blue-600 hover:bg-blue-700 text-white',
  ULTIMATE:
    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700',
}

export const EnhancedPlanUsage = ({
  plan,
  creditsUsed,
  creditLimit,
  domainsUsed,
  domainLimit,
}: EnhancedPlanUsageProps) => {
  const isUltimate = plan === 'ULTIMATE'
  const planDisplay = plan.charAt(0) + plan.slice(1).toLowerCase()
  const planLimits = PLAN_LIMITS[plan as PlanType]

  const conversationsUsed = Math.max(0, creditLimit - creditsUsed)
  const conversationPercentage = isUltimate
    ? 0
    : Math.min((conversationsUsed / creditLimit) * 100, 100)

  const barColor =
    conversationPercentage >= 90
      ? '[&>div]:bg-red-500'
      : conversationPercentage >= 70
      ? '[&>div]:bg-amber-500'
      : '[&>div]:bg-emerald-500'

  const remaining = Math.max(0, creditLimit - conversationsUsed)

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 dark:border-slate-800',
        'bg-white dark:bg-slate-900/50 p-5 md:p-6 shadow-md h-full flex flex-col'
      )}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white">
              Usage &amp; Plan
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Track your current limits
            </p>
          </div>
        </div>

        <span
          className={cn(
            'px-2.5 py-1 rounded-full text-xs font-semibold',
            PLAN_BADGE[plan]
          )}
        >
          {planDisplay}
        </span>
      </div>

      <div className="flex-1 space-y-5">
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Conversations this month
            </span>
            <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-white">
              {isUltimate
                ? `${conversationsUsed.toLocaleString()} / ∞`
                : `${conversationsUsed.toLocaleString()} / ${creditLimit.toLocaleString()}`}
            </span>
          </div>
          <Progress
            value={isUltimate ? 0 : conversationPercentage}
            className={cn('h-2', isUltimate ? '[&>div]:bg-emerald-500' : barColor)}
          />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isUltimate
              ? 'Unlimited conversations'
              : `${remaining.toLocaleString()} remaining this month`}
          </p>
        </div>

        <div className="flex gap-2">
          <div
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-xl',
              'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50'
            )}
          >
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Domains
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {domainsUsed} / {isUltimate ? '∞' : domainLimit}
            </span>
          </div>

          <div
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-xl',
              'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50'
            )}
          >
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Chatbots
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {domainsUsed} / {isUltimate ? '∞' : planLimits.chatbots}
            </span>
          </div>

          <div
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-xl',
              'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50'
            )}
          >
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Campaigns
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              — / {isUltimate ? '∞' : planLimits.campaigns}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="/account/billing"
          className={cn(
            'flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg',
            'font-medium text-sm transition-all group',
            PLAN_BUTTON[plan]
          )}
        >
          {isUltimate ? 'Manage Billing' : 'Upgrade Plan'}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}
