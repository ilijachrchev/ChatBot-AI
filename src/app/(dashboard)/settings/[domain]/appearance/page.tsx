import { onGetCurrentDomainInfo } from '@/actions/settings'
import InfoBar from '@/components/infobar'
import { redirect } from 'next/navigation'
import { cn } from '@/lib/utils'
import { DomainLockedOverlay } from '@/components/domain/domain-locked-overlay'
import { DomainSettingsNav } from '@/components/domain/domain-settings-nav'
import { AppearanceForm } from '@/components/forms/settings/appearance-form'
import { StepTracker } from '@/components/onboarding/step-tracker'

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

  return (
    <>
      <StepTracker step="customizedChatbot" />
      <InfoBar />

      <DomainSettingsNav domain={domain} />

      <div className="relative overflow-y-auto w-full chat-window flex-1 h-0">
        <div className={cn(
          'px-4 md:px-6 py-8',
          isLocked && 'opacity-40 blur-[1px] pointer-events-none'
        )}>
          <AppearanceForm
            id={currentDomain.id}
            chatBot={currentDomain.chatBot}
            plan={domainInfo.subscription?.plan ?? 'STANDARD'}
          />
        </div>

        {isLocked && <DomainLockedOverlay domainId={currentDomain.id} />}
      </div>
    </>
  )
}

export default AppearancePage
