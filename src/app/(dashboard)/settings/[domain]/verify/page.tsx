import { onGetDomainVerificationStatus } from '@/actions/domain'
import { onGetCurrentDomainInfo } from '@/actions/settings'
import InfoBar from '@/components/infobar'
import { DomainVerificationClient } from '@/components/domain/domain-verification-client'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  params: Promise<{ domain: string }>
}

const DomainVerifyPage = async ({ params }: Props) => {
  const { domain } = await params
  
  if (!domain) redirect('/dashboard')

  const domainInfo = await onGetCurrentDomainInfo(domain)

  if (!domainInfo || !domainInfo.domains || domainInfo.domains.length === 0) {
    return redirect('/dashboard')
  }

  const currentDomain = domainInfo.domains[0]

  const verificationData = await onGetDomainVerificationStatus(currentDomain.id)

  if (!verificationData || verificationData.status !== 200 || !verificationData.domain) {
    return redirect(`/settings/${domain}`)
  }

  return (
    <>
      <InfoBar />
      <div className='overflow-y-auto w-full chat-window flex-1 h-0'>
        <div className='max-w-5xl mx-auto py-8 px-4 md:px-6'>
          <DomainVerificationClient
            domainId={currentDomain.id}
            domainName={verificationData.domain.name}
            verificationToken={verificationData.domain.verificationToken}
            verificationStatus={verificationData.domain.verificationStatus}
            verificationMethod={verificationData.domain.verificationMethod}
            verifiedAt={verificationData.domain.verifiedAt}
          />
        </div>
      </div>
    </>
  )
}

export default DomainVerifyPage