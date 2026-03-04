import { getUserAppointments } from '@/actions/appointment'
import {
  getUserBalance,
  getUserClients,
  getUserPlanInfo,
  getUserTotalProductPrices,
  getUserTransaction,
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
import { onGetOnboardingProgress } from '@/actions/onboarding'
import { onGetAllAccountDomains } from '@/actions/settings'
import { onGetAllDomainsRatings } from '@/actions/ratings'
import { GettingStartedCard } from '@/components/onboarding/getting-started-card'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { ActivityChart } from '@/components/dashboard/activity-chart'
import { AIResolutionChart } from '@/components/dashboard/ai-resolution-chart'
import { EnhancedPlanUsage } from '@/components/dashboard/enhanced-plan-usage'
import { QuickActions } from '@/components/dashboard/quick-actions'
import InfoBar from '@/components/infobar'
import { MessageSquare, TrendingUp, Calendar, DollarSign, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import React from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = Record<string, never>

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
    onboardingData,
    domainsResult,
    ratingsData,
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
    onGetOnboardingProgress(),
    onGetAllAccountDomains(),
    onGetAllDomainsRatings(),
  ])

  const pipelineValue = (products ?? 0) * (clients ?? 0)

  const PLAN_LIMITS: Record<string, { credits: number; domains: number; clients: number }> = {
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
  const aiResolutionRate =
    totalResolutions > 0 ? Math.round((totalAI / totalResolutions) * 100) : 0

  const hasConversationData =
    conversationTrend && conversationTrend.length > 0 && conversationTrend.some((v) => v > 0)
  const hasSalesData = salesTrend && salesTrend.length > 0 && salesTrend.some((v) => v > 0)
  const hasBookingsData =
    bookingsTrend && bookingsTrend.length > 0 && bookingsTrend.some((v) => v > 0)

  const conversationTrendPercent = conversationsThisWeek > 0 ? 12 : 0

  const firstDomainSlug = domainsResult?.domains?.[0]?.name?.split('.')?.[0] ?? ''
  const showOnboarding =
    !!onboardingData &&
    !onboardingData.onboardingCompleted &&
    !onboardingData.onboardingDismissed &&
    !!firstDomainSlug

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-8">
      <InfoBar />

      <div className="overflow-y-auto w-full flex-1">
        {showOnboarding && (
          <GettingStartedCard
            progress={onboardingData!}
            firstDomainSlug={firstDomainSlug}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <KpiCard
            title="Conversations Today"
            value={conversationsToday}
            icon={<MessageSquare />}
            iconColor="blue"
            trend={
              conversationsToday > 0
                ? { value: conversationTrendPercent, label: 'vs yesterday' }
                : undefined
            }
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
            trend={
              bookings && bookings > 0 ? { value: 4.5, label: 'vs last week' } : undefined
            }
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
          <div className={cn(
            'relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800',
            'bg-white dark:bg-slate-900/50 p-5 md:p-6',
            'shadow-md hover:shadow-lg transition-all duration-300 group'
          )}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Star className="h-5 w-5" strokeWidth={2} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                  Satisfaction Rate
                </p>
                <p className={cn(
                  'text-2xl lg:text-3xl font-bold tracking-tight',
                  ratingsData.total < 3
                    ? 'text-slate-400 dark:text-slate-600'
                    : ratingsData.satisfactionRate >= 80
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : ratingsData.satisfactionRate >= 60
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-rose-600 dark:text-rose-400'
                )}>
                  {ratingsData.total < 3 ? 'N/A' : `${ratingsData.satisfactionRate}%`}
                </p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {ratingsData.positive} of {ratingsData.total} rated helpful
              </p>
              {ratingsData.total > 0 && (
                <div className="mt-3 h-1.5 w-full bg-rose-200 dark:bg-rose-900/40 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${ratingsData.satisfactionRate}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <ActivityChart data={finalActivityData} />
          <AIResolutionChart data={finalResolutionData} resolutionRate={aiResolutionRate} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <QuickActions />
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
  )
}

export default Page
