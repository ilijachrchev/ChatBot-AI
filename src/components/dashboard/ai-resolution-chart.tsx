'use client'
import { cn } from '@/lib/utils'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type AIResolutionChartProps = {
  data: Array<{ period: string; ai: number; human: number }>
  resolutionRate: number
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0)

    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-[var(--text-primary)] mb-2">{label}</p>
        {total > 0 ? (
          payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[var(--text-secondary)] capitalize">
                {entry.dataKey === 'ai' ? 'AI' : 'Human'}:
              </span>
              <span className="font-medium text-[var(--text-primary)]">{entry.value}</span>
              <span className="text-[var(--text-muted)] text-xs">
                ({Math.round((entry.value / total) * 100)}%)
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-[var(--text-muted)]">No data for this period</p>
        )}
      </div>
    )
  }
  return null
}

export const AIResolutionChart = ({ data, resolutionRate }: AIResolutionChartProps) => {
  return (
    <div className={cn(
      'rounded-xl border border-[var(--border-default)] dark:border-[var(--border-strong)]',
      'bg-[var(--bg-surface)] shadow-sm'
    )}>
      <div className="p-5 md:p-6 pb-2">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)]">
              AI vs Human Resolution
            </h3>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Last 4 weeks
            </p>
          </div>
          <div className="flex flex-col items-end gap-0.5 pt-0.5">
            <div className="flex items-baseline gap-1 px-3 py-1.5 rounded-xl dark:bg-[var(--bg-surface)]">
              <span className="text-2xl font-bold text-[var(--text-accent)] tabular-nums">
                {resolutionRate}%
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">AI resolved</p>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-6 pb-5 md:pb-6">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
              barGap={4}
              barCategoryGap="35%"
            >
              <CartesianGrid
                strokeDasharray="1 4"
                stroke="currentColor"
                className="stroke-[rgba(0,0,0,0.06)] dark:stroke-[rgba(255,255,255,0.06)]"
                vertical={false}
              />
              <XAxis
                dataKey="period"
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
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgb(148 163 184 / 0.1)' }}
              />
              <Bar
                dataKey="ai"
                fill="rgb(59, 130, 246)"
                radius={[4, 4, 0, 0]}
                name="AI"
                barSize={28}
              />
              <Bar
                dataKey="human"
                fill="rgb(168, 85, 247)"
                radius={[4, 4, 0, 0]}
                name="Human"
                barSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-[var(--border-default)] dark:border-[var(--border-strong)]">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-indigo-500" />
            <span className="text-sm text-[var(--text-secondary)]">AI Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-purple-500" />
            <span className="text-sm text-[var(--text-secondary)]">Human Handled</span>
          </div>
        </div>
      </div>
    </div>
  )
}
