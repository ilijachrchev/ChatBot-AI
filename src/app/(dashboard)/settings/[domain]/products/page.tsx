import { onGetCurrentDomainInfo } from '@/actions/settings'
import { redirect } from 'next/navigation'
import InfoBar from '@/components/infobar'
import { DomainSettingsNav } from '@/components/domain/domain-settings-nav'
import { DomainLockedOverlay } from '@/components/domain/domain-locked-overlay'

type Props = {
  params: Promise<{ domain: string }>
}

const ProductsPage = async ({ params }: Props) => {
  const { domain } = await params
  const domainInfo = await onGetCurrentDomainInfo(domain)

  if (!domainInfo?.domains?.length) redirect('/dashboard')

  const currentDomain = domainInfo.domains[0]
  const isLocked = currentDomain.verificationStatus !== 'VERIFIED'

  if (!isLocked) {
    redirect(`/products?domain=${currentDomain.id}`)
  }

  return (
    <>
      <InfoBar />

      <DomainSettingsNav domain={domain} />

      <div className="relative overflow-y-auto w-full chat-window flex-1 h-0">
        <div className="opacity-40 blur-[1px] pointer-events-none px-4 md:px-6 py-8">
          <div className="h-64" />
        </div>

        <DomainLockedOverlay domainId={currentDomain.id} />
      </div>
    </>
  )
}

export default ProductsPage
