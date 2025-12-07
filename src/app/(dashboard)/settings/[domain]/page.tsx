import { onGetCurrentDomainInfo } from '@/actions/settings'
import BotTrainingForm from '@/components/forms/settings/bot-training'
import SettingsForm from '@/components/forms/settings/form'
import InfoBar from '@/components/infobar'
import ProductTable from '@/components/products'
import { redirect } from 'next/navigation'
import React from 'react'
import { cn } from '@/lib/utils'
import { DomainLockedOverlay } from '@/components/domain/domain-locked-overlay'

type Props = {
  params: Promise<{ domain: string }>
}

const DomainSettingsPage = async ({ params }: Props) => {
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

      <div className="relative overflow-y-auto w-full chat-window flex-1 h-0">
        <SettingsForm
          plan={domainInfo.subscription?.plan!}
          chatBot={currentDomain.chatBot}
          id={currentDomain.id}
          name={currentDomain.name}
          verificationStatus={currentDomain.verificationStatus}
          verifiedAt={currentDomain.verifiedAt}
          verificationMethod={currentDomain.verificationMethod}
          isLocked={isLocked}
        />

        <div className="relative min-h-[400px]">
          <div
            className={cn(
              'space-y-6 px-4 md:px-6 pb-10',
              isLocked && 'opacity-40 blur-[1px] pointer-events-none'
            )}
          >
            <BotTrainingForm id={currentDomain.id} />

            <ProductTable
              id={currentDomain.id}
              products={currentDomain.products || []}
            />
          </div>

          {isLocked && <DomainLockedOverlay />}
        </div>
      </div>
    </>
  )
}

export default DomainSettingsPage