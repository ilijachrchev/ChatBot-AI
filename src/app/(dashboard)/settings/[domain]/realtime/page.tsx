import { onGetCurrentDomainInfo } from '@/actions/settings'
import InfoBar from '@/components/infobar'
import { DomainSettingsNav } from '@/components/domain/domain-settings-nav'
import { RealtimeSettings } from '@/components/domain/realtime-settings'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  params: Promise<{ domain: string }>
}

const DomainRealtimePage = async ({ params }: Props) => {
  const { domain } = await params
  if (!domain) redirect('/dashboard')

  const domainInfo = await onGetCurrentDomainInfo(domain)

  if (!domainInfo?.domains?.length) redirect('/dashboard')

  const currentDomain = domainInfo.domains[0]

  return (
    <>
      <InfoBar />

      <DomainSettingsNav domain={domain} />

      <div className="relative overflow-y-auto w-full flex-1 h-0">
        <div className="p-6">
          <RealtimeSettings
            domainId={currentDomain.id}
            initialEnabled={currentDomain.realtimeEnabled ?? true}
          />
        </div>
      </div>
    </>
  )
}

export default DomainRealtimePage
