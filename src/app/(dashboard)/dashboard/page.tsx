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
import { MessageSquare, TrendingUp, DollarSign, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import React from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = Record<string, never>

const Page = async (props: Props) => {
  const [
    clients,
    sales,
    plan,
    transactions,
    products,
    activityData,
    resolutionData,
    conversationTrend,
    salesTrend,
    conversationsToday,
    conversationsThisWeek,
    totalChatRooms,
    onboardingData,
    domainsResult,
    ratingsData,
  ] = await Promise.all([
    getUserClients(),
    getUserBalance(),
    getUserPlanInfo(),
    getUserTransaction(),
    getUserTotalProductPrices(),
    getConversationActivity(),
    getResolutionData(),
    getConversationTrend(),
    getSalesTrend(),
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

  const conversationTrendPercent = conversationsThisWeek > 0 ? 12 : 0

  const firstDomainSlug = domainsResult?.domains?.[0]?.name?.split('.')?.[0] ?? ''
  const showOnboarding =
    !!onboardingData &&
    !onboardingData.onboardingCompleted &&
    !onboardingData.onboardingDismissed &&
    !!firstDomainSlug

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-8 dark:bg-[var(--bg-page)]">
      <InfoBar />

      <div className="overflow-y-auto w-full flex-1">
        {showOnboarding && (
          <GettingStartedCard
            progress={onboardingData!}
            firstDomainSlug={firstDomainSlug}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
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
            title="Total Sales"
            value={sales || 0}
            sales
            icon={<DollarSign />}
            iconColor="amber"
            trend={sales && sales > 0 ? { value: 8.1, label: 'vs last month' } : undefined}
          />
          <div className={cn(
            'relative overflow-hidden rounded-xl border border-[var(--border-default)] dark:border-[var(--border-strong)]',
            'bg-[var(--bg-surface)] p-5 md:p-6',
            'shadow-sm'
          )}>
            {/* ICON — uncomment to show icon
            <div className="p-2.5 rounded-lg bg-[var(--warning)] text-[var(--warning)] dark:text-[var(--warning)] mb-4 w-fit">
              <Star className="h-5 w-5" strokeWidth={2} />
            </div>
            */}
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mb-2">
              Satisfaction Rate
            </p>
            <p className={cn(
              'text-3xl font-bold tracking-tight',
              ratingsData.total < 3
                ? 'text-[var(--text-muted)] dark:text-[var(--text-secondary)]'
                : ratingsData.satisfactionRate >= 80
                ? 'text-[var(--success)] dark:text-[var(--success)]'
                : ratingsData.satisfactionRate >= 60
                ? 'text-[var(--warning)] dark:text-[var(--warning)]'
                : 'text-[var(--danger)]'
            )}>
              {ratingsData.total < 3 ? 'N/A' : `${ratingsData.satisfactionRate}%`}
            </p>
            <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mt-2">
              {ratingsData.positive} of {ratingsData.total} rated helpful
            </p>
            {ratingsData.total > 0 && (
              <div className="mt-3 h-1.5 w-full bg-[rgba(224,85,85,0.15)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--success)] rounded-full transition-all duration-500"
                  style={{ width: `${ratingsData.satisfactionRate}%` }}
                />
              </div>
            )}
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
