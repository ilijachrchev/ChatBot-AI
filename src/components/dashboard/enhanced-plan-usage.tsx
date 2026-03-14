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
  STANDARD: 'bg-[var(--bg-card)] text-[var(--text-muted)]',
  PRO: 'bg-[var(--primary)] text-[var(--primary)] dark:text-[var(--text-accent)]',
  ULTIMATE: 'bg-[var(--warning)] text-[var(--warning)] dark:text-[var(--warning)]',
}

const PLAN_BUTTON: Record<string, string> = {
  STANDARD:
    'bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-white dark:bg-[var(--bg-hover)] dark:hover:bg-[var(--bg-surface)] dark:text-[var(--text-primary)]',
  PRO: 'bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white',
  ULTIMATE:
    'bg-[var(--bg-card)] text-[var(--text-muted)] hover:bg-[var(--bg-card)]',
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
      ? '[&>div]:bg-[var(--danger)]'
      : conversationPercentage >= 70
      ? '[&>div]:bg-[var(--warning)]'
      : '[&>div]:bg-[var(--success)]'

  const remaining = Math.max(0, creditLimit - conversationsUsed)

  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border-default)] dark:border-[var(--border-strong)]',
        'bg-[var(--bg-surface)] p-5 md:p-6 shadow-sm h-full flex flex-col'
      )}
    >
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white shadow-lg shadow-[var(--primary)]">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-lg md:text-xl text-[var(--text-primary)]">
              Usage &amp; Plan
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
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
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              Conversations this month
            </span>
            <span className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
              {isUltimate
                ? `${conversationsUsed.toLocaleString()} / ∞`
                : `${conversationsUsed.toLocaleString()} / ${creditLimit.toLocaleString()}`}
            </span>
          </div>
          <Progress
            value={isUltimate ? 0 : conversationPercentage}
            className={cn('h-2', isUltimate ? '[&>div]:bg-[var(--success)]' : barColor)}
          />
          <p className="text-xs text-[var(--text-muted)]">
            {isUltimate
              ? 'Unlimited conversations'
              : `${remaining.toLocaleString()} remaining this month`}
          </p>
        </div>

        <div className="flex gap-2">
          <div
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-xl',
              'bg-[var(--bg-card)] border border-[var(--border)]'
            )}
          >
            <span className="text-xs font-medium text-[var(--text-muted)]">
              Domains
            </span>
            <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
              {domainsUsed} / {isUltimate ? '∞' : domainLimit}
            </span>
          </div>

          <div
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-xl',
              'bg-[var(--bg-card)] border border-[var(--border)]'
            )}
          >
            <span className="text-xs font-medium text-[var(--text-muted)]">
              Chatbots
            </span>
            <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
              {domainsUsed} / {isUltimate ? '∞' : planLimits.chatbots}
            </span>
          </div>

          <div
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 px-2 rounded-xl',
              'bg-[var(--bg-card)] border border-[var(--border)]'
            )}
          >
            <span className="text-xs font-medium text-[var(--text-muted)]">
              Campaigns
            </span>
            <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
              — / {isUltimate ? '∞' : planLimits.campaigns}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-[var(--border-default)] dark:border-[var(--border-strong)]">
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
