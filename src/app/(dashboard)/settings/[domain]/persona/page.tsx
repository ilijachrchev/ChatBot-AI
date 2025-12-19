import { onGetCurrentDomainInfo } from '@/actions/settings'
import InfoBar from '@/components/infobar'
import { redirect } from 'next/navigation'
import React from 'react'
import { cn } from '@/lib/utils'
import { DomainLockedOverlay } from '@/components/domain/domain-locked-overlay'
import { DomainSettingsNav } from '@/components/domain/domain-settings-nav'
import { PersonaSelector } from '@/components/settings/preferences/persona-selector'

type Props = {
  params: Promise<{ domain: string }>
}

const AIPersonaPage = async ({ params }: Props) => {
  const { domain } = await params
  if (!domain) redirect('/dashboard')

  const domainInfo = await onGetCurrentDomainInfo(domain)

  if (!domainInfo || !domainInfo.domains || domainInfo.domains.length === 0) {
    return redirect('/dashboard')
  }

  const currentDomain = domainInfo.domains[0]
  const isLocked = currentDomain.verificationStatus !== 'VERIFIED'

  return (
    <>
      <InfoBar />
      
      <DomainSettingsNav domain={domain} />

      <div className="relative overflow-y-auto w-full chat-window flex-1 h-0">
        <div className={cn(
          'px-4 md:px-6 py-8',
          isLocked && 'opacity-40 blur-[1px] pointer-events-none'
        )}>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
            <PersonaSelector
              chatBotId={currentDomain.chatBot?.id || ''}
              currentPersona={(currentDomain.chatBot?.persona as any) || 'SALES_AGENT'}
              currentCustomPrompt={currentDomain.chatBot?.customPrompt}
            />
          </div>
        </div>
        
        {isLocked && <DomainLockedOverlay />}
      </div>
    </>
  )
}

export default AIPersonaPage