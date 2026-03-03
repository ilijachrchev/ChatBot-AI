import { onGetOnboardingProgress } from '@/actions/onboarding'
import { onGetAllAccountDomains } from '@/actions/settings'
import { GettingStartedCard } from '@/components/onboarding/getting-started-card'
import InfoBar from '@/components/infobar'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const GettingStartedPage = async () => {
  const [progress, domainsResult] = await Promise.all([
    onGetOnboardingProgress(),
    onGetAllAccountDomains(),
  ])

  if (!progress) redirect('/dashboard')

  const firstDomain = domainsResult?.domains?.[0]
  if (!firstDomain) redirect('/dashboard')

  const firstDomainSlug = firstDomain.name.split('.')[0]

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-8">
      <InfoBar />

      <div className="max-w-2xl w-full mx-auto mt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-1">Getting Started</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Your setup checklist for SendWise AI
        </p>

        <GettingStartedCard progress={progress} firstDomainSlug={firstDomainSlug} />
      </div>
    </div>
  )
}

export default GettingStartedPage
