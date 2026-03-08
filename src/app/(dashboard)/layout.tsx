import { onLoginUser } from '@/actions/auth'
import { onGetOnboardingProgress } from '@/actions/onboarding'
import { OnboardingOverlay } from '@/components/onboarding/onboarding-overlay'
import { ChatProvider } from '@/context/user-chat-context'
import { OAuthTypeUpdater } from '@/components/auth/oauth-tpy-updater'
import { onGetUnreadConversationCount } from '@/actions/conversation'
import { onGetLeadCount } from '@/actions/leads'
import { onGetNewFeedbackCount } from '@/actions/ratings'
import { onGetPersonaSidebarItems } from '@/actions/settings'
import DashboardShell from '@/components/sidebar/dashboard-shell'
import React from 'react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  children: React.ReactNode
}

const OwnerLayout = async ({ children }: Props) => {
  const authenticated = await onLoginUser()
  if (authenticated?.status !== 200) return null

  const hasDomains = (authenticated.domains?.length ?? 0) > 0

  const [progress, unreadResult, leadCount, feedbackCount, personaItems] = await Promise.all([
    hasDomains ? onGetOnboardingProgress() : Promise.resolve(null),
    onGetUnreadConversationCount(),
    onGetLeadCount(),
    onGetNewFeedbackCount(),
    onGetPersonaSidebarItems(),
  ])

  const stepsCompleted = progress
    ? [
        progress.customizedChatbot,
        progress.uploadedKnowledge,
        progress.copiedEmbedCode,
        progress.exploredPricing,
      ].filter(Boolean).length
    : 0

  return (
    <ChatProvider>
      <OAuthTypeUpdater />
      <DashboardShell
        domains={authenticated.domains}
        onboardingCompleted={progress?.onboardingCompleted ?? false}
        onboardingDismissed={progress?.onboardingDismissed ?? false}
        stepsCompleted={stepsCompleted}
        unreadCount={unreadResult.count}
        leadCount={leadCount}
        feedbackCount={feedbackCount}
        personaItems={personaItems ?? []}
      >
        {children}
      </DashboardShell>
      {!hasDomains && <OnboardingOverlay />}
    </ChatProvider>
  )
}

export default OwnerLayout
