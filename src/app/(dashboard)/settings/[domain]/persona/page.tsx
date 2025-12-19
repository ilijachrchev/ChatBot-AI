import { onGetCurrentDomainInfo } from '@/actions/settings'
import InfoBar from '@/components/infobar'
import { redirect } from 'next/navigation'
import React from 'react'
import { cn } from '@/lib/utils'
import { DomainLockedOverlay } from '@/components/domain/domain-locked-overlay'
import { DomainSettingsNav } from '@/components/domain/domain-settings-nav'
import { AIPersonaForm } from '@/components/forms/settings/ai-persona-form'

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
          isLocked && 'opacity-40 blur-[1px] pointer-events-none'
        )}>
          <AIPersonaForm
            chatBotId={currentDomain.chatBot?.id || ''}
            currentPersona={(currentDomain.chatBot?.persona as any) || 'SALES_AGENT'}
            currentCustomPrompt={currentDomain.chatBot?.customPrompt}
          />
        </div>
        
        {isLocked && <DomainLockedOverlay />}
      </div>
    </>
  )
}

export default AIPersonaPage