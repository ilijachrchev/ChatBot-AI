import InfoBar from '@/components/infobar'
import BillingSettings from '@/components/settings/billing-settings'
import ChangePassword from '@/components/settings/change-password'
import DarkModetoggle from '@/components/settings/dark-mode'
import React from 'react'

type Props = {}

const Page = (props: Props) => {
  return <>
    <InfoBar />
    <div className='overflow-y-auto w-full chat-window flex-1 h-0 px-4 md:px-6 pb-8'>
      <div className='flex flex-col gap-8 md:gap-10'>
        <BillingSettings />
        <DarkModetoggle />
        <ChangePassword />
      </div>
    </div>
  </>
}

export default Page