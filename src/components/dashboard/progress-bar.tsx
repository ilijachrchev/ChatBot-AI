'use client'
import React from 'react'
import { cn } from '@/lib/utils'

type ProgressBarProps = {
  label: string
  credits: number
  end: number
  className?: string
}

export const ProgressBar = ({
  label,
  credits,
  end,
  className
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max(0, credits) / end * 100, 100)
  const isNearLimit = percentage > 80 && percentage < 100
  const isOverLimit = percentage >= 100

  const remainingCredits = end - credits

  const displayValue = isOverLimit ? 'Limit Reached' : `${credits.toLocaleString()} / ${end.toLocaleString()}`


  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          {label}
        </span>
        <span className={cn(
          'text-sm font-semibold tabular-nums',
          isOverLimit
            ? 'text-[var(--danger)]'
            : isNearLimit
            ? 'text-[var(--warning)] dark:text-[var(--warning)]'
            : 'text-[var(--text-primary)]' 
        )}>
          {displayValue}
        </span>
      </div>
      
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out relative',
            isOverLimit
              ? 'bg-[var(--danger)]'
              : isNearLimit
              ? 'bg-[var(--warning)]' 
              : 'bg-[var(--primary)]' 
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {isOverLimit && (
        <p className="text-xs text-[var(--danger)] font-medium pt-1">
          ⚠️ Limit reached - consider upgrading your plan.
        </p>
      )}
      {!isOverLimit && remainingCredits > 0 && (
          <p className="text-xs text-[var(--text-muted)] font-normal pt-1">
             {remainingCredits.toLocaleString()} {label.toLowerCase().includes('credit') ? 'credits' : label.toLowerCase().includes('domain') ? 'domains' : 'contacts'} remaining.
          </p>
      )}
    </div>
  )
}