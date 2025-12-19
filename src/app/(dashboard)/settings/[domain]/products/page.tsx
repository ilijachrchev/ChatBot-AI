import { onGetCurrentDomainInfo } from '@/actions/settings'
import InfoBar from '@/components/infobar'
import ProductTable from '@/components/products'
import { redirect } from 'next/navigation'
import React from 'react'
import { cn } from '@/lib/utils'
import { DomainLockedOverlay } from '@/components/domain/domain-locked-overlay'
import { DomainSettingsNav } from '@/components/domain/domain-settings-nav'

type Props = {
  params: Promise<{ domain: string }>
}

const ProductsPage = async ({ params }: Props) => {
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
          <ProductTable
            id={currentDomain.id}
            products={currentDomain.products || []}
          />
        </div>
        
        {isLocked && <DomainLockedOverlay />}
      </div>
    </>
  )
}

export default ProductsPage