'use client'
import React from 'react'
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">{label}</p>
        {total > 0 ? (
          payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600 dark:text-slate-400 capitalize">
                {entry.dataKey === 'ai' ? 'AI' : 'Human'}:
              </span>
              <span className="font-medium text-slate-900 dark:text-white">{entry.value}</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs">
                ({Math.round((entry.value / total) * 100)}%)
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400">No data for this period</p>
        )}
      </div>
    )
  }
  return null
}

export const AIResolutionChart = ({ data, resolutionRate }: AIResolutionChartProps) => {
  return (
    <div className={cn(
      'rounded-xl border border-slate-200 dark:border-slate-800',
      'bg-white dark:bg-slate-900/50 shadow-md'
    )}>
      <div className="p-5 md:p-6 pb-2">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              AI vs Human Resolution
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Last 4 weeks
            </p>
          </div>
          <div className="flex flex-col items-end gap-0.5 pt-0.5">
            <div className="flex items-baseline gap-1 px-3 py-1.5 rounded-xl bg-blue-500/10 dark:bg-blue-500/15">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                {resolutionRate}%
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI resolved</p>
          </div>
        </div>
      </div>

      <div className="px-5 md:px-6 pb-5 md:pb-6">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="stroke-slate-200 dark:stroke-slate-800"
                vertical={false}
              />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="fill-slate-500 dark:fill-slate-400"
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 12 }}
                className="fill-slate-500 dark:fill-slate-400"
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
              />
              <Bar
                dataKey="human"
                fill="rgb(168, 85, 247)"
                radius={[4, 4, 0, 0]}
                name="Human"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-blue-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">AI Resolved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-purple-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Human Handled</span>
          </div>
        </div>
      </div>
    </div>
  )
}