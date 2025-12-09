import { getUserAppointments } from '@/actions/appointment'
import { getUserBalance, getUserClients, getUserPlanInfo, getUserTotalProductPrices, getUserTransaction } from '@/actions/dashboard'
import DashboardCard from '@/components/dashboard/cards'
import { PlanUsageCard } from '@/components/dashboard/plan-usage-card'
import { RecentTransactionsCard } from '@/components/dashboard/recent-transactions-card'
import InfoBar from '@/components/infobar'
import CalIcon from '@/icons/cal-icon'
import PersonIcon from '@/icons/person-icon'
import { DollarSign, TrendingUp } from 'lucide-react'
import React from 'react'

type Props = {}

const Page = async (props: Props) => {
  const [clients, sales, bookings, plan, transactions, products] = await Promise.all([
    getUserClients(),
    getUserBalance(),
    getUserAppointments(),
    getUserPlanInfo(),
    getUserTransaction(),
    getUserTotalProductPrices(),
  ])

  const pipelineValue = (products ?? 0) * (clients ?? 0)

  const dummyTrend = { value: 4.5, isPositive: true }

  return (
    <div className='w-full h-full flex flex-col p-4 md:p-6'> 
      <InfoBar />
      
      <div className='overflow-y-auto w-full flex-1'>
        
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          <DashboardCard
            value={clients || 0}
            title="Potential Clients"
            icon={<PersonIcon />}
            trend={dummyTrend} 
          />
          <DashboardCard
            value={pipelineValue || 0}
            sales
            title="Pipeline Value"
            icon={<TrendingUp />}
            trend={{ value: 12.8, isPositive: false }}
          />
          <DashboardCard
            value={bookings || 0}
            title="Appointments"
            icon={<CalIcon />}
            trend={dummyTrend}
          />
          <DashboardCard
            value={sales || 0}
            sales
            title="Total Sales"
            icon={<DollarSign />}
            trend={{ value: 8.1, isPositive: true }}
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
          <div className='lg:col-span-2'>
            <PlanUsageCard 
              plan={plan?.plan || 'STANDARD'} 
              creditsUsed={plan?.credits || 0}
              domainsUsed={plan?.domains || 0}
              clientsUsed={clients || 0}
            />
          </div>

          <div className='lg:col-span-1'>
            <RecentTransactionsCard transactions={transactions?.data} />
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default Page