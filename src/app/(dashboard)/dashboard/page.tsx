import { getUserAppointments } from '@/actions/appointment'
import { getUserBalance, getUserClients, getUserPlanInfo } from '@/actions/dashboard'
import React from 'react'

type Props = {}

const page = async (props: Props) => {

  const clients = await getUserClients()
  const sales = await getUserBalance()
  const bookings = await getUserAppointments()
  const plan = await getUserPlanInfo();

  return (
    <div>page</div>
  )
}

export default page