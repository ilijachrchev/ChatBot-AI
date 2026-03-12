'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type ActivityChartProps = {
  data: Array<{ date: string; ai: number; human: number }>
}

type Period = 'weekly' | 'monthly' | 'yearly'

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-default)] dark:border-[var(--border-strong)] rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-[var(--text-secondary)] capitalize">{entry.dataKey}:</span>
            <span className="font-medium text-[var(--text-primary)]">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const ActivityChart = ({ data }: ActivityChartProps) => {
  const [activePeriod, setActivePeriod] = useState<Period>('weekly')
  const weekTotal = data.reduce((sum, d) => sum + d.ai + d.human, 0)

  const periodLabel = activePeriod === 'weekly' ? 'week' : activePeriod === 'monthly' ? 'month' : 'year'

  return (
    <div className={cn(
      'rounded-xl border border-[var(--border-default)] dark:border-[var(--border-strong)]',
      'bg-white dark:bg-[var(--bg-surface)] shadow-sm'
    )}>
      <div className="p-5 md:p-6 pb-2">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">
              Conversation Activity
            </h3>
            {weekTotal > 0 && (
              <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-[var(--text-accent)]">
                {weekTotal.toLocaleString()} this {periodLabel}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[var(--bg-surface)]">
            {(['Weekly', 'Monthly', 'Yearly'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setActivePeriod(period.toLowerCase() as Period)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-all',
                  activePeriod === period.toLowerCase()
                    ? 'bg-white dark:bg-[var(--bg-active)] text-[var(--text-primary)] shadow-sm'
                    : 'text-slate-500 dark:text-[var(--text-secondary)] hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm mt-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'rgb(99, 179, 246)' }} />
            <span className="text-slate-500 dark:text-[var(--text-secondary)]">AI Handled</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: 'rgb(192, 132, 252)' }} />
            <span className="text-slate-500 dark:text-[var(--text-secondary)]">Human</span>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-6 pb-5 md:pb-6">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(99, 179, 246)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="humanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(192, 132, 252)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="1 4"
                stroke="currentColor"
                className="stroke-[rgba(0,0,0,0.06)] dark:stroke-[rgba(255,255,255,0.06)]"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgb(148, 163, 184)', fontSize: 11 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgb(148, 163, 184)', fontSize: 11 }}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="ai"
                stroke="rgb(99, 179, 246)"
                strokeWidth={2}
                fill="url(#aiGradient)"
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="human"
                stroke="rgb(192, 132, 252)"
                strokeWidth={2}
                fill="url(#humanGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
