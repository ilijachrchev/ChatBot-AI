import { onGetCurrentDomainInfo } from '@/actions/settings'
import { getKnowledgeBaseFiles } from '@/actions/knowledge-base'
import InfoBar from '@/components/infobar'
import { DomainSettingsNav } from '@/components/domain/domain-settings-nav'
import { DomainLockedOverlay } from '@/components/domain/domain-locked-overlay'
import KnowledgeBaseContent from '@/components/knowledge-base'
import { redirect } from 'next/navigation'
import { cn } from '@/lib/utils'
import React from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: Promise<{ domain: string }>
}

const DomainKnowledgeBasePage = async ({ params }: Props) => {
  const { domain } = await params
  if (!domain) redirect('/dashboard')

  const domainInfo = await onGetCurrentDomainInfo(domain)

  if (!domainInfo || !domainInfo.domains || domainInfo.domains.length === 0) {
    return redirect('/dashboard')
  }

  const currentDomain = domainInfo.domains[0]
  const domainId = currentDomain.id
  const userPlan = domainInfo.subscription?.plan ?? 'STANDARD'
  const isLocked = currentDomain.verificationStatus !== 'VERIFIED'

  const filesResult = await getKnowledgeBaseFiles(domainId)
  const files = filesResult.status === 200 ? filesResult.files : []

  return (
    <>
      <InfoBar />

      <DomainSettingsNav domain={domain} />

      <div className="relative overflow-y-auto w-full chat-window flex-1 h-0">
        <div className={cn(isLocked && 'opacity-40 blur-[1px] pointer-events-none')}>
          <KnowledgeBaseContent
            initialFiles={files || []}
            domainId={domainId}
            userPlan={userPlan}
          />
        </div>

        {isLocked && <DomainLockedOverlay domainId={domainId} />}
      </div>
    </>
  )
}

export default DomainKnowledgeBasePage
