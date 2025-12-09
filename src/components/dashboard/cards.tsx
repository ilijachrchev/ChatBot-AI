import React from 'react'
import { cn } from '@/lib/utils'
import { ArrowDown, ArrowUp } from 'lucide-react'

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

  const iconColorClass = sales ? 'text-amber-500' : 'text-blue-500';

  const shouldDisplayTrend = trend && value > 0;

  return (
    <div className={cn(
      'group relative overflow-hidden',
      'rounded-xl border border-slate-200 dark:border-slate-800',
      'bg-white dark:bg-slate-900/50',
      'p-5 md:p-6',
      'transition-all duration-300',
      'shadow-md hover:shadow-lg',
      className
    )}>
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs md:text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </h3>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0">
            {React.cloneElement(icon, { 
              className: cn('h-4 w-4', iconColorClass),
              strokeWidth: 2, 
            })}
          </div>
        </div>

        <p className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-none">
          {sales && '$'}
          {value.toLocaleString()}
        </p>

        {shouldDisplayTrend ? (
          <div className={cn(
            'flex items-center gap-1 text-sm font-semibold',
            trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          )}>
            {trend.isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {trend.value}%
            <span className='text-slate-500 dark:text-slate-400 font-normal ml-1'>vs last month</span>
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {value === 0 ? 'Start tracking activity to see trends.' : 'Metrics calculated in real-time.'}
          </p>
        )}
      </div>
    </div>
  )
}

export default DashboardCard