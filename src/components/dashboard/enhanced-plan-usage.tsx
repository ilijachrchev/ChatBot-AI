'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { Activity, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'

type EnhancedPlanUsageProps = {
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  creditsUsed: number
  creditLimit: number
  domainsUsed: number
  domainLimit: number
  clientsUsed: number
  clientLimit: number
}

const PLAN_BADGES = {
  STANDARD: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  PRO: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  ULTIMATE: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
}

const UsageItem = ({ 
  label, 
  used, 
  limit, 
  icon 
}: { 
  label: string
  used: number
  limit: number
  icon: React.ReactNode
}) => {
  const percentage = Math.min((used / limit) * 100, 100)
  const isNearLimit = percentage > 80 && percentage < 100
  const isOverLimit = percentage >= 100

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            'p-1.5 rounded-lg',
            isOverLimit 
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : isNearLimit
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
          )}>
            {icon}
          </div>
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {label}
          </span>
        </div>
        <span className={cn(
          'text-sm font-semibold tabular-nums',
          isOverLimit
            ? 'text-rose-600 dark:text-rose-400'
            : isNearLimit
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-slate-900 dark:text-white'
        )}>
          {used.toLocaleString()} / {limit.toLocaleString()}
        </span>
      </div>

      <Progress 
        value={percentage} 
        className={cn(
          'h-2',
          isOverLimit
            ? '[&>div]:bg-rose-500'
            : isNearLimit
            ? '[&>div]:bg-amber-500'
            : '[&>div]:bg-blue-500'
        )}
      />

      {isOverLimit ? (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
          ⚠️ Limit reached
        </p>
      ) : (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {(limit - used).toLocaleString()} remaining
        </p>
      )}
    </div>
  )
}

export const EnhancedPlanUsage = ({
  plan,
  creditsUsed,
  creditLimit,
  domainsUsed,
  domainLimit,
  clientsUsed,
  clientLimit,
}: EnhancedPlanUsageProps) => {
  const isUltimate = plan === 'ULTIMATE'
  const planDisplay = plan.charAt(0) + plan.slice(1).toLowerCase()

  return (
    <div className={cn(
      'rounded-xl border border-slate-200 dark:border-slate-800',
      'bg-white dark:bg-slate-900/50 p-5 md:p-6 shadow-md h-full flex flex-col'
    )}>
      <div className="flex items-start justify-between mb-5 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white">
              Usage & Plan
            </h2>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
              Track your current limits
            </p>
          </div>
        </div>

        <div className={cn(
          'px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm',
          PLAN_BADGES[plan]
        )}>
          {planDisplay}
        </div>
      </div>

      <div className="space-y-5 flex-grow">
        <UsageItem
          label="Email Credits"
          used={creditsUsed}
          limit={creditLimit}
          icon={<Sparkles className="h-4 w-4" />}
        />
        <UsageItem
          label="Domains"
          used={domainsUsed}
          limit={domainLimit}
          icon={<Activity className="h-4 w-4" />}
        />
        <UsageItem
          label="Contacts"
          used={clientsUsed}
          limit={clientLimit}
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
        <Link
          href="/settings/billing"
          className={cn(
            'flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg',
            'font-medium text-sm transition-all group',
            isUltimate
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg hover:shadow-blue-500/25'
          )}
        >
          {isUltimate ? 'Manage Plan' : 'Upgrade Now'}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  )
}