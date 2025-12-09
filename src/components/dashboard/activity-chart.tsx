'use client'
import React from 'react'
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-slate-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600 dark:text-slate-400 capitalize">{entry.dataKey}:</span>
            <span className="font-medium text-slate-900 dark:text-white">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const ActivityChart = ({ data }: ActivityChartProps) => {
  return (
    <div className={cn(
      'rounded-xl border border-slate-200 dark:border-slate-800',
      'bg-white dark:bg-slate-900/50 shadow-md'
    )}>
      <div className="p-5 md:p-6 pb-2">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Conversation Activity
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-600 dark:text-slate-400">AI Handled</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span className="text-slate-600 dark:text-slate-400">Human</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-5 md:px-6 pb-5 md:pb-6">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="humanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="stroke-slate-200 dark:stroke-slate-800"
                vertical={false}
              />
              <XAxis
                dataKey="date"
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
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="ai"
                stroke="rgb(59, 130, 246)"
                strokeWidth={2}
                fill="url(#aiGradient)"
              />
              <Area
                type="monotone"
                dataKey="human"
                stroke="rgb(168, 85, 247)"
                strokeWidth={2}
                fill="url(#humanGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}