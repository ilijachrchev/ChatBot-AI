'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown } from 'lucide-react'
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
      'relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800',
      'bg-white dark:bg-slate-900/50 p-5 md:p-6',
      'shadow-md hover:shadow-lg transition-all duration-300',
      'group'
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('p-2.5 rounded-lg', iconColorClasses[iconColor])}>
            {React.cloneElement(icon as React.ReactElement, { 
              className: 'h-5 w-5',
              strokeWidth: 2
            })}
          </div>
          
          {sparklineData && sparklineData.length > 0 && (
            <div className="h-10 w-20">
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
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {sales && '$'}
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>

        {trend && typeof value === 'number' && value > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            {isPositive && (
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">+{trend.value}%</span>
              </div>
            )}
            {isNegative && (
              <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                <TrendingDown className="h-3.5 w-3.5" />
                <span className="text-xs font-semibold">{trend.value}%</span>
              </div>
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400">{trend.label}</span>
          </div>
        )}

        {value === 0 && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Start tracking activity to see trends.
          </p>
        )}
      </div>
    </div>
  )
}