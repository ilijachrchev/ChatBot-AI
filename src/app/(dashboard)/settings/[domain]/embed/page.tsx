import { onGetCurrentDomainInfo } from '@/actions/settings'
import { EmbedCodePanel } from '@/components/embed'
import { redirect } from 'next/navigation'
import { DomainSettingsNav } from '@/components/domain/domain-settings-nav'
import { DomainLockedOverlay } from '@/components/domain/domain-locked-overlay'
import InfoBar from '@/components/infobar'
import { StepTracker } from '@/components/onboarding/step-tracker'
import { cn } from '@/lib/utils'

type Props = {
  params: Promise<{ domain: string }>
}

const DomainEmbedPage = async ({ params }: Props) => {
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
      <StepTracker step="copiedEmbedCode" />
      <InfoBar />

      <DomainSettingsNav domain={domain} />

      <div className="relative overflow-y-auto w-full chat-window flex-1 h-0">
        <div className={cn(isLocked && 'opacity-40 blur-[1px] pointer-events-none')}>
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-20"
              style={{
                background: 'radial-gradient(ellipse at center, hsl(262 83% 58% / 0.3) 0%, transparent 70%)',
                filter: 'blur(100px)',
              }}
            />
            <div
              className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] opacity-10"
              style={{
                background: 'radial-gradient(circle at center, hsl(221 83% 53% / 0.4) 0%, transparent 70%)',
                filter: 'blur(80px)',
              }}
            />
          </div>

          <div className="relative z-10 px-4 md:px-6 py-8">
            <EmbedCodePanel
              domainId={currentDomain.id}
              domainName={currentDomain.name}
            />
          </div>
        </div>

        {isLocked && <DomainLockedOverlay domainId={currentDomain.id} />}
      </div>
    </>
  )
}

export default DomainEmbedPage
