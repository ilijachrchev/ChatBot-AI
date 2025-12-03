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
  const percentage = Math.min((credits / end) * 100, 100)
  const isNearLimit = percentage > 80
  const isOverLimit = percentage >= 100

  return (
    <div className={cn('flex flex-col gap-2', className)}>
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
            : 'text-slate-600 dark:text-slate-400'
        )}>
          {credits.toLocaleString()} / {end.toLocaleString()}
        </span>
      </div>
      
      <div className="relative h-2.5 md:h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden',
            isOverLimit
              ? 'bg-gradient-to-r from-rose-500 to-rose-600'
              : isNearLimit
              ? 'bg-gradient-to-r from-amber-500 to-amber-600'
              : 'bg-gradient-to-r from-blue-500 to-blue-600'
          )}
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer-slow" />
        </div>
      </div>
      
      {isOverLimit && (
        <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
          ⚠️ Limit reached - consider upgrading your plan
        </p>
      )}
    </div>
  )
}