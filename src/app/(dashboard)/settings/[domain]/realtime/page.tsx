import { onGetCurrentDomainInfo } from '@/actions/settings'
import InfoBar from '@/components/infobar'
import { DomainSettingsNav } from '@/components/domain/domain-settings-nav'
import { RealtimeSettings } from '@/components/domain/realtime-settings'
import { DomainLockedOverlay } from '@/components/domain/domain-locked-overlay'
import { redirect } from 'next/navigation'
import { currentUser } from '@clerk/nextjs/server'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: Promise<{ domain: string }>
}

const DomainRealtimePage = async ({ params }: Props) => {
  const { domain } = await params
  if (!domain) redirect('/dashboard')

  const [domainInfo, user] = await Promise.all([
    onGetCurrentDomainInfo(domain),
    currentUser(),
  ])

  if (!domainInfo?.domains?.length) redirect('/dashboard')

  const currentDomain = domainInfo.domains[0]
  const ownerEmail = user?.emailAddresses[0]?.emailAddress ?? ''
  const isLocked = currentDomain.verificationStatus !== 'VERIFIED'

  return (
    <>
      <InfoBar />

      <DomainSettingsNav domain={domain} />

      <div className="relative overflow-y-auto w-full flex-1 h-0">
        <div className={cn('p-6', isLocked && 'opacity-40 blur-[1px] pointer-events-none')}>
          <RealtimeSettings
            domainId={currentDomain.id}
            initialEnabled={currentDomain.realtimeEnabled ?? true}
            initialLiveNotifications={currentDomain.liveNotificationsEnabled ?? false}
            ownerEmail={ownerEmail}
          />
        </div>

        {isLocked && <DomainLockedOverlay domainId={currentDomain.id} />}
      </div>
    </>
  )
}

export default DomainRealtimePage
