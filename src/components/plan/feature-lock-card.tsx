'use client'
import { Lock } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type Props = {
  planRequired: 'PRO' | 'ULTIMATE'
  feature: string
}

export const FeatureLockCard = ({ planRequired, feature }: Props) => {
  const isPro = planRequired === 'PRO'

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 max-w-[280px] w-full">
      <div className="flex flex-col items-center text-center gap-4">
        <div className={cn(
          'h-12 w-12 rounded-full flex items-center justify-center',
          isPro
            ? 'bg-blue-100 dark:bg-blue-950'
            : 'bg-amber-100 dark:bg-amber-950'
        )}>
          <Lock className={cn(
            'h-6 w-6',
            isPro
              ? 'text-blue-600 dark:text-blue-400'
              : 'text-amber-600 dark:text-amber-400'
          )} />
        </div>

        <div className="space-y-1">
          <p className="font-bold text-slate-900 dark:text-white text-sm">
            {isPro ? 'Pro Feature' : 'Ultimate Feature'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {feature}
          </p>
        </div>

        <Link
          href="/account/billing"
          className={cn(
            'w-full inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90',
            isPro
              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
              : 'bg-gradient-to-r from-amber-500 to-amber-600'
          )}
        >
          {isPro ? 'Upgrade to Pro →' : 'Upgrade to Ultimate →'}
        </Link>
      </div>
    </div>
  )
}
