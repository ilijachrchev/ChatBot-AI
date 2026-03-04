import { onLoginUser } from '@/actions/auth'
import { onGetOnboardingProgress } from '@/actions/onboarding'
import SideBar from '@/components/sidebar'
import { OnboardingOverlay } from '@/components/onboarding/onboarding-overlay'
import { ChatProvider } from '@/context/user-chat-context'
import { OAuthTypeUpdater } from '@/components/auth/oauth-tpy-updater'
import { onGetUnreadConversationCount } from '@/actions/conversation'
import { onGetLeadCount } from '@/actions/leads'
import { onGetNewFeedbackCount } from '@/actions/ratings'
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

  const [progress, unreadResult, leadCount, feedbackCount] = await Promise.all([
    hasDomains ? onGetOnboardingProgress() : Promise.resolve(null),
    onGetUnreadConversationCount(),
    onGetLeadCount(),
    onGetNewFeedbackCount(),
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
      <div className="flex h-screen w-full overflow-hidden">
        <SideBar
          domains={authenticated.domains}
          onboardingCompleted={progress?.onboardingCompleted ?? false}
          onboardingDismissed={progress?.onboardingDismissed ?? false}
          stepsCompleted={stepsCompleted}
          unreadCount={unreadResult.count}
          leadCount={leadCount}
          feedbackCount={feedbackCount}
        />
        <div className="w-full h-screen flex flex-col pl-20 md:pl-4 overflow-y-auto">
          {children}
        </div>
      </div>
      {!hasDomains && <OnboardingOverlay />}
    </ChatProvider>
  )
}

export default OwnerLayout
