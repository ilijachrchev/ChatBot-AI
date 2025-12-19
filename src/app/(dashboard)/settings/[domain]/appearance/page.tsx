import { onGetCurrentDomainInfo } from '@/actions/settings'
import InfoBar from '@/components/infobar'
import { redirect } from 'next/navigation'
import React from 'react'
import { cn } from '@/lib/utils'
import { DomainLockedOverlay } from '@/components/domain/domain-locked-overlay'
import { DomainSettingsNav } from '@/components/domain/domain-settings-nav'
import { PlanLockedOverlay } from '@/components/plan/plan-locked-overlay'
import { AppearanceForm } from '@/components/forms/settings/appearance-form'

type Props = {
  params: Promise<{ domain: string }>
}

const AppearancePage = async ({ params }: Props) => {
  const { domain } = await params
  if (!domain) redirect('/dashboard')

  const domainInfo = await onGetCurrentDomainInfo(domain)

  if (!domainInfo || !domainInfo.domains || domainInfo.domains.length === 0) {
    return redirect('/dashboard')
  }

  const currentDomain = domainInfo.domains[0]
  const isLocked = currentDomain.verificationStatus !== 'VERIFIED'
  const isAppearanceLocked = domainInfo.subscription?.plan === 'STANDARD'

  return (
    <>
      <InfoBar />
      
      <DomainSettingsNav domain={domain} />

      <div className="relative overflow-y-auto w-full chat-window flex-1 h-0">
        <div className={cn(
          'px-4 md:px-6 py-8',
          isLocked && 'opacity-40 blur-[1px] pointer-events-none'
        )}>
          <div className="relative min-h-[500px]">
            <div className={cn(
              isAppearanceLocked && 'opacity-40 blur-[1px] pointer-events-none'
            )}>
              <AppearanceForm
                id={currentDomain.id}
                chatBot={currentDomain.chatBot}
                plan={domainInfo.subscription?.plan! || 'STANDARD'}
              />
            </div>

            {isAppearanceLocked && (
              <PlanLockedOverlay 
                currentPlan={domainInfo.subscription?.plan! || 'STANDARD'} 
                feature="Chatbot Appearance"
              />
            )}
          </div>
        </div>
        
        {isLocked && <DomainLockedOverlay />}
      </div>
    </>
  )
}

export default AppearancePage