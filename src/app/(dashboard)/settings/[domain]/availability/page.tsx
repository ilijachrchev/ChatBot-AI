import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { AvailabilityTab } from '@/components/domain/availability-tab' 
import { onGetCurrentDomainInfo } from '@/actions/settings'
import { onGetDomainWorkingHours } from '@/actions/working-hours'

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
    <div className='p-6'>
      <AvailabilityTab
        domainId={domainData.id}
        timezone={domainData.timezone}
        workingHours={workingHours}
        offlineBehavior={domainData.chatBot?.presenceMode}
        offlineMessage={domainData.chatBot?.offlineCustomMessage ?? undefined}
      />
    </div>
  )
}

export default AvailabilityPage