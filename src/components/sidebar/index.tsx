"use client"
import useSideBar from '@/context/use-sidebar'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import MaxMenu from './maximized-menu'
import { MinMenu } from './minimized-menu'
import { usePathname } from 'next/navigation'

type PersonaSidebarItem = {
  persona: string
  domainId: string
  domainName: string
  label: string
  path: string
  icon: string
}

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
  personaItems: PersonaSidebarItem[]
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const SideBar = ({
  domains,
  onboardingCompleted,
  onboardingDismissed,
  stepsCompleted,
  unreadCount,
  leadCount,
  feedbackCount,
  personaItems,
  mobileOpen = false,
  onMobileClose,
}: Props) => {
  const { expand, onExpand, page, onSignOut } = useSideBar()
  const pathname = usePathname()

  useEffect(() => {
    if (mobileOpen && onMobileClose) {
      onMobileClose()
    }
  }, [pathname])

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}
      <div
        className={cn(
          'bg-[var(--bg-surface)] border-r border-[var(--border-default)] h-full fill-mode-forwards',
          'fixed md:relative',
          'z-50 md:z-auto',
          'w-72 md:w-[60px]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'transition-transform duration-300',
          'md:translate-x-0 md:transition-none',
          expand == true
            ? 'md:animate-open-sidebar'
            : expand == false && 'md:animate-close-sidebar'
        )}
      >
        {expand || mobileOpen ? (
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
            personaItems={personaItems}
            onMobileClose={onMobileClose}
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
            personaItems={personaItems}
          />
        )}
      </div>
    </>
  )
}

export default SideBar
