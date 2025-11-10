import { onGetCurrentDomainInfo } from '@/actions/settings'
import BotTrainingForm from '@/components/forms/settings/bot-training'
import SettingsForm from '@/components/forms/settings/form'
import InfoBar from '@/components/infobar'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = { 
  params: Promise<{ domain: string }>
}

const DomainSettingsPage = async ({ params }: Props) => {
    const { domain } = await params
    if (!domain) redirect('/dashboard')
      const domainInfo = await onGetCurrentDomainInfo(domain)

    if (!domainInfo) redirect('/dashboard')
  return (
    <>
        <InfoBar />
        <div className='overflow-y-auto w-full chat-window flex-1 h-0'>
            <SettingsForm
                plan={domainInfo.subscription?.plan!}
                chatBot={domainInfo.domains[0].chatBot}
                id={domainInfo.domains[0].id}
                name={domainInfo.domains[0].name}
            />
            <BotTrainingForm id={domainInfo.domains[0].id} />
        </div>
    </>
  )
}

export default DomainSettingsPage