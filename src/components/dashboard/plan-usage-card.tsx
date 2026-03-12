import React from 'react'
import { PlanUsage } from './plan-usage' 
import { Activity, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type PlanUsageCardProps = {
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  creditsUsed: number
  domainsUsed: number
  clientsUsed: number
}

const PLAN_LIMITS = {
  STANDARD: { credits: 10, domains: 1, clients: 10 },
  PRO: { credits: 50, domains: 2, clients: 50 },
  ULTIMATE: { credits: 500, domains: 100, clients: 500 },
}

export const PlanUsageCard = ({ 
    plan, 
    creditsUsed, 
    domainsUsed, 
    clientsUsed 
}: PlanUsageCardProps) => {
  
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.STANDARD;
  const isUltimate = plan === 'ULTIMATE';

  return (
    <div className={cn(
      "rounded-xl border border-[var(--border-default)]",
      "bg-[var(--bg-page)]/50 p-5 md:p-6 shadow-md h-full"
    )}>
      <div className="flex items-start justify-between mb-5 md:mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className='font-bold text-lg md:text-xl text-[var(--text-primary)]'>
              Plan Usage ({plan.charAt(0) + plan.slice(1).toLowerCase()} Plan)
            </h2>
            <p className='text-xs md:text-sm text-[var(--text-secondary)]'>
              Track your current usage and limits
            </p>
          </div>
        </div>
        
        <Link 
            href="/account/billing" 
            className="flex items-center gap-1 text-sm font-medium text-indigo-500 hover:text-blue-700 dark:text-[var(--text-accent)] dark:hover:text-blue-300 transition-colors group p-1"
        >
            {isUltimate ? 'Manage Plan' : 'Upgrade'}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <PlanUsage
        plan={plan}
        credits={creditsUsed}
        domains={domainsUsed}
        clients={clientsUsed}
        creditLimit={limits.credits}
        domainLimit={limits.domains}
        clientLimit={limits.clients}
      />
    </div>
  )
}