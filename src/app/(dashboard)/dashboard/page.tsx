import { getUserAppointments } from '@/actions/appointment'
import { 
  getUserBalance, 
  getUserClients, 
  getUserPlanInfo, 
  getUserTotalProductPrices, 
  getUserTransaction 
} from '@/actions/dashboard'
import {
  getConversationActivity,
  getResolutionData,
  getConversationTrend,
  getSalesTrend,
  getBookingsTrend,
  getConversationsToday,
  getConversationsThisWeek, 
  getTotalChatRooms,
} from '@/actions/analytics'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { ActivityChart } from '@/components/dashboard/activity-chart'
import { AIResolutionChart } from '@/components/dashboard/ai-resolution-chart'
import { EnhancedPlanUsage } from '@/components/dashboard/enhanced-plan-usage'
import { RecentTransactionsCard } from '@/components/dashboard/recent-transactions-card'
import InfoBar from '@/components/infobar'
import { MessageSquare, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import React from 'react'

type Props = {}

const Page = async (props: Props) => {
  const [
    clients,
    sales,
    bookings,
    plan,
    transactions,
    products,
    activityData,
    resolutionData,
    conversationTrend,
    salesTrend,
    bookingsTrend,
    conversationsToday,
    conversationsThisWeek, 
    totalChatRooms, 
  ] = await Promise.all([
    getUserClients(),
    getUserBalance(),
    getUserAppointments(),
    getUserPlanInfo(),
    getUserTransaction(),
    getUserTotalProductPrices(),
    getConversationActivity(),
    getResolutionData(),
    getConversationTrend(),
    getSalesTrend(),
    getBookingsTrend(),
    getConversationsToday(),
    getConversationsThisWeek(),
    getTotalChatRooms(), 
  ])

  const pipelineValue = (products ?? 0) * (clients ?? 0)

  const PLAN_LIMITS = {
    STANDARD: { credits: 10, domains: 1, clients: 10 },
    PRO: { credits: 50, domains: 2, clients: 50 },
    ULTIMATE: { credits: 500, domains: 100, clients: 500 },
  }

  const currentPlan = plan?.plan || 'STANDARD'
  const limits = PLAN_LIMITS[currentPlan]

  const defaultActivityData = [
    { date: 'Mon', ai: 0, human: 0 },
    { date: 'Tue', ai: 0, human: 0 },
    { date: 'Wed', ai: 0, human: 0 },
    { date: 'Thu', ai: 0, human: 0 },
    { date: 'Fri', ai: 0, human: 0 },
    { date: 'Sat', ai: 0, human: 0 },
    { date: 'Sun', ai: 0, human: 0 },
  ]

  const defaultResolutionData = [
    { period: 'Week 1', ai: 0, human: 0 },
    { period: 'Week 2', ai: 0, human: 0 },
    { period: 'Week 3', ai: 0, human: 0 },
    { period: 'Week 4', ai: 0, human: 0 },
  ]

  const finalActivityData = activityData || defaultActivityData
  const finalResolutionData = resolutionData || defaultResolutionData

  const totalAI = finalResolutionData.reduce((sum, item) => sum + item.ai, 0)
  const totalHuman = finalResolutionData.reduce((sum, item) => sum + item.human, 0)
  const totalResolutions = totalAI + totalHuman
  const aiResolutionRate = totalResolutions > 0 
    ? Math.round((totalAI / totalResolutions) * 100)
    : 0

  const hasConversationData = conversationTrend && conversationTrend.length > 0 && conversationTrend.some(v => v > 0)
  const hasSalesData = salesTrend && salesTrend.length > 0 && salesTrend.some(v => v > 0)
  const hasBookingsData = bookingsTrend && bookingsTrend.length > 0 && bookingsTrend.some(v => v > 0)

  const conversationTrendPercent = conversationsThisWeek > 0 ? 12 : 0

  console.log('Dashboard Data:', {
    conversationsToday,
    conversationsThisWeek,
    totalChatRooms,
    clients,
    aiResolutionRate,
  })

  return (
    <div className='w-full h-full flex flex-col p-4 md:p-6 lg:p-8'> 
      <InfoBar />
      
      <div className='overflow-y-auto w-full flex-1'>
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Welcome back. Here's what your AI has been doing.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8'>
          <KpiCard
            title="Conversations Today"
            value={conversationsToday}
            icon={<MessageSquare />}
            iconColor="blue"
            trend={conversationsToday > 0 ? { value: conversationTrendPercent, label: 'vs yesterday' } : undefined}
            sparklineData={hasConversationData ? conversationTrend : undefined}
          />
          <KpiCard
            title="Pipeline Value"
            value={pipelineValue || 0}
            sales
            icon={<TrendingUp />}
            iconColor="green"
            sparklineData={hasSalesData ? salesTrend : undefined}
          />
          <KpiCard
            title="Appointments"
            value={bookings || 0}
            icon={<Calendar />}
            iconColor="purple"
            trend={bookings && bookings > 0 ? { value: 4.5, label: 'vs last week' } : undefined}
            sparklineData={hasBookingsData ? bookingsTrend : undefined}
          />
          <KpiCard
            title="Total Sales"
            value={sales || 0}
            sales
            icon={<DollarSign />}
            iconColor="amber"
            trend={sales && sales > 0 ? { value: 8.1, label: 'vs last month' } : undefined}
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8'>
          <ActivityChart data={finalActivityData} />
          <AIResolutionChart 
            data={finalResolutionData} 
            resolutionRate={aiResolutionRate} 
          />
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6'>
          <div className='lg:col-span-2'>
            <RecentTransactionsCard transactions={transactions?.data} />
          </div>

          <div className='lg:col-span-1'>
            <EnhancedPlanUsage
              plan={currentPlan}
              creditsUsed={plan?.credits || 0}
              creditLimit={limits.credits}
              domainsUsed={plan?.domains || 0}
              domainLimit={limits.domains}
              clientsUsed={clients || 0}
              clientLimit={limits.clients}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page
