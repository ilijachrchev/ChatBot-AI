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
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </span>
        <span className={cn(
          'text-sm font-semibold tabular-nums',
          isOverLimit
            ? 'text-rose-600 dark:text-rose-400'
            : isNearLimit
            ? 'text-amber-600 dark:text-amber-400'
            : 'text-slate-900 dark:text-white' 
        )}>
          {displayValue}
        </span>
      </div>
      
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out relative',
            isOverLimit
              ? 'bg-rose-500' 
              : isNearLimit
              ? 'bg-amber-500' 
              : 'bg-blue-500' 
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      {isOverLimit && (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pt-1">
          ⚠️ Limit reached - consider upgrading your plan.
        </p>
      )}
      {!isOverLimit && remainingCredits > 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 font-normal pt-1">
             {remainingCredits.toLocaleString()} {label.toLowerCase().includes('credit') ? 'credits' : label.toLowerCase().includes('domain') ? 'domains' : 'contacts'} remaining.
          </p>
      )}
    </div>
  )
}