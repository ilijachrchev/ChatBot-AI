import { getUserAppointments } from '@/actions/appointment'
import { getUserBalance, getUserClients, getUserPlanInfo, getUserTotalProductPrices, getUserTransaction } from '@/actions/dashboard'
import DashboardCard from '@/components/dashboard/cards'
import InfoBar from '@/components/infobar'
import PersonIcon from '@/icons/person-icon'
import React from 'react'

type Props = {}

const page = async (props: Props) => {

  const clients = await getUserClients()
  const sales = await getUserBalance()
  const bookings = await getUserAppointments()
  const plan = await getUserPlanInfo();
  const transactions = await getUserTransaction()
  const products = await getUserTotalProductPrices()

  return (
    <>
    <InfoBar />
    <div className='overflow-y-auto w-full chat-window flex-1 h-0'>
      <div className='flex gap-5 flex-wrap'>
        <DashboardCard
          value={clients || 0}
          title="Potential Clients"
          icon={<PersonIcon />}
        />
      </div>
    </div>
    </>
  )
}

export default page