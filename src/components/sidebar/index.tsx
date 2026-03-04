"use client"
import useSideBar from '@/context/use-sidebar'
import { cn } from '@/lib/utils'
import React from 'react'
import MaxMenu from './maximized-menu'
import { MinMenu } from './minimized-menu'

type Props = {
  domains:
    | {
        id: string
        name: string
        icon: string
      }[]
    | null
    | undefined
  onboardingCompleted: boolean
  onboardingDismissed: boolean
  stepsCompleted: number
  unreadCount: number
  leadCount: number
  feedbackCount: number
}

const SideBar = ({
  domains,
  onboardingCompleted,
  onboardingDismissed,
  stepsCompleted,
  unreadCount,
  leadCount,
  feedbackCount,
}: Props) => {
  const { expand, onExpand, page, onSignOut } = useSideBar()

  return (
    <div
      className={cn(
        'bg-cream dark:bg-neutral-950 h-full w-[60px] fill-mode-forwards fixed md:relative',
        expand == undefined && '',
        expand == true
          ? 'animate-open-sidebar'
          : expand == false && 'animate-close-sidebar'
      )}
    >
      {expand ? (
        <MaxMenu
          domains={domains}
          current={page!}
          onExpand={onExpand}
          onSignOut={onSignOut}
          onboardingCompleted={onboardingCompleted}
          onboardingDismissed={onboardingDismissed}
          stepsCompleted={stepsCompleted}
          unreadCount={unreadCount}
          leadCount={leadCount}
          feedbackCount={feedbackCount}
        />
      ) : (
        <MinMenu
          domains={domains}
          onShrink={onExpand}
          current={page!}
          onSignOut={onSignOut}
          onboardingCompleted={onboardingCompleted}
          onboardingDismissed={onboardingDismissed}
          stepsCompleted={stepsCompleted}
          unreadCount={unreadCount}
          leadCount={leadCount}
          feedbackCount={feedbackCount}
        />
      )}
    </div>
  )
}

export default SideBar
