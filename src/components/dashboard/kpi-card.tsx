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
  blue: 'bg-[var(--primary-light)] text-[var(--primary)]',
  green: 'bg-[rgba(61,184,130,0.15)] text-[var(--success)]',
  purple: 'bg-[var(--primary-light)] text-[var(--primary)]',
  amber: 'bg-[rgba(224,155,26,0.15)] text-[var(--warning)]',
  rose: 'bg-[rgba(224,85,85,0.15)] text-[var(--danger)]',
}

const sparklineColors = {
  blue: 'var(--primary)',
  green: 'var(--success)',
  purple: 'var(--primary)',
  amber: 'var(--warning)',
  rose: 'var(--danger)',
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
      'relative overflow-hidden rounded-xl border border-[var(--border-default)] dark:border-[var(--border-strong)]',
      'bg-[var(--bg-surface)] p-5 md:p-6',
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

      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
        {title}
      </p>

      <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
        {sales && '$'}
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>

      {trend && typeof value === 'number' && value > 0 && (
        <div className="mt-3 flex items-center gap-1.5">
          {isPositive && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[rgba(61,184,130,0.15)] text-[var(--success)]">
              +{trend.value}%
            </span>
          )}
          {isNegative && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[rgba(224,85,85,0.15)] text-[var(--danger)]">
              {trend.value}%
            </span>
          )}
          <span className="text-xs text-[var(--text-muted)]">{trend.label}</span>
        </div>
      )}

      {value === 0 && (
        <p className="text-xl font-medium text-[var(--text-muted)] mt-3 select-none">
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
