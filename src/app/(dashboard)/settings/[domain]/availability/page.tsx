import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AvailabilityTab } from '@/components/domain/availability-tab' 
import { onGetCurrentDomainInfo } from '@/actions/settings'
import { onGetDomainWorkingHours } from '@/actions/working-hours'
import { DomainSettingsNav } from '@/components/domain/domain-settings-nav'
import InfoBar from '@/components/infobar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: Promise<{
    domain: string
  }>
}

const AvailabilityPage = async ({ params }: PageProps) => {
  const user = await currentUser()
  if (!user) redirect('/auth/sign-in')

  const { domain } = await params
  const domainInfo = await onGetCurrentDomainInfo(domain)
  
  if (!domainInfo) {
    redirect('/dashboard')
  }

  const domainData = domainInfo.domains[0]
  const workingHours = await onGetDomainWorkingHours(domainData.id)

  return (
    <>
      <InfoBar />
      
      <DomainSettingsNav domain={domain} />

      <div className="relative overflow-y-auto w-full chat-window flex-1 h-0">
        <div className='p-6'>
          <AvailabilityTab
            domainId={domainData.id}
            timezone={domainData.timezone}
            workingHours={workingHours}
            offlineBehavior={domainData.chatBot?.offlineBehavior || 'SHOW_HOURS_AND_EMAIL'}
            offlineMessage={domainData.chatBot?.offlineCustomMessage ?? undefined}
          />
        </div>
      </div>
    </>
  )
}

export default AvailabilityPage