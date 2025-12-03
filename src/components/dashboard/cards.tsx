import React from 'react'
import { cn } from '@/lib/utils'

type Props = {
  title: string
  value: number
  icon: JSX.Element
  sales?: boolean
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

const DashboardCard = ({
  icon,
  title,
  value,
  sales,
  trend,
  className
}: Props) => {
  return (
    <div className={cn(
      'group relative overflow-hidden',
      'rounded-xl border border-slate-200 dark:border-slate-800',
      'bg-white dark:bg-slate-900/50',
      'p-4 md:p-6',
      'transition-all duration-300',
      'hover:shadow-card-hover hover:border-blue-200 dark:hover:border-blue-800',
      'hover:-translate-y-1',
      className
    )}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex flex-col gap-3 md:gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 transition-transform duration-200 group-hover:scale-110">
              {React.cloneElement(icon, { 
                className: 'h-5 w-5',
                strokeWidth: 2.5 
              })}
            </div>
            
            <div>
              <h3 className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400">
                {title}
              </h3>
            </div>
          </div>
          
          {trend && (
            <div className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold',
              trend.isPositive 
                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' 
                : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              {trend.value}%
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <p className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            {sales && '$'}
            {value.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DashboardCard