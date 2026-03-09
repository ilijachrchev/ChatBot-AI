'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

type KpiCardProps = {
  title: string
  value: string | number
  icon: React.ReactNode
  iconColor?: 'blue' | 'green' | 'purple' | 'amber' | 'rose'
  trend?: {
    value: number
    label: string
  }
  sparklineData?: number[]
  sales?: boolean
}

const iconColorClasses = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
}

const sparklineColors = {
  blue: 'rgb(59, 130, 246)',
  green: 'rgb(16, 185, 129)',
  purple: 'rgb(168, 85, 247)',
  amber: 'rgb(245, 158, 11)',
  rose: 'rgb(244, 63, 94)',
}

export const KpiCard = ({
  title,
  value,
  icon,
  iconColor = 'blue',
  trend,
  sparklineData,
  sales,
}: KpiCardProps) => {
  const isPositive = trend && trend.value > 0
  const isNegative = trend && trend.value < 0

  const chartData = sparklineData?.map((val, idx) => ({ value: val, idx })) || []

  return (
    <div className={cn(
      'relative overflow-hidden rounded-xl border border-slate-200 dark:border-[#2a3a52]',
      'bg-white dark:bg-[#1a2640]/80 p-5 md:p-6',
      'shadow-sm'
    )}>
      {/* ICON — uncomment to show icon
      <div className={cn('p-2.5 rounded-lg mb-4 w-fit', iconColorClasses[iconColor])}>
        {React.cloneElement(icon as React.ReactElement, {
          className: 'h-5 w-5',
          strokeWidth: 2
        })}
      </div>
      */}

      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
        {title}
      </p>

      <p className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
        {sales && '$'}
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>

      {trend && typeof value === 'number' && value > 0 && (
        <div className="mt-3 flex items-center gap-1.5">
          {isPositive && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              +{trend.value}%
            </span>
          )}
          {isNegative && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400">
              {trend.value}%
            </span>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400">{trend.label}</span>
        </div>
      )}

      {value === 0 && (
        <p className="text-xl font-medium text-slate-300 dark:text-slate-700 mt-3 select-none">
          —
        </p>
      )}

      {sparklineData && sparklineData.length > 0 && (
        <div className="absolute bottom-3 right-3 h-12 w-24 opacity-60 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`sparkline-${iconColor}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparklineColors[iconColor]} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={sparklineColors[iconColor]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparklineColors[iconColor]}
                strokeWidth={1.5}
                fill={`url(#sparkline-${iconColor})`}
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
