import React from 'react'
import { ProgressBar } from './progress-bar'

type PlanUsageProps = {
  plan: 'STANDARD' | 'PRO' | 'ULTIMATE'
  credits: number
  creditLimit: number 
  domains: number
  domainLimit: number 
  clients: number
  clientLimit: number 
}

export const PlanUsage = ({
  plan,
  credits,
  creditLimit,
  domains,
  domainLimit,
  clients,
  clientLimit,
}: PlanUsageProps) => {
  return (
    <div className="flex flex-col gap-4 md:gap-5 py-4 md:py-5"> 
      <ProgressBar
        end={creditLimit}
        label="Email Credits"
        credits={credits}
      />
      <ProgressBar
        end={domainLimit}
        label="Domains"
        credits={domains}
      />
      <ProgressBar
        end={clientLimit}
        label="Contacts"
        credits={clients}
      />
    </div>
  )
}