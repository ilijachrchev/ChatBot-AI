import { SIDE_BAR_MENU } from '@/constants/menu'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  Calendar,
  Headphones,
  Home,
  LogOut,
  MonitorSmartphone,
  Rocket,
  ShoppingBag,
  Stethoscope,
  Utensils,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import DomainMenu from './domain-menu'
import MenuItem from './menu-item'

type PersonaSidebarItem = {
  persona: string
  domainId: string
  domainName: string
  label: string
  path: string
  icon: string
}

type MinMenuProps = {
  onShrink(): void
  current: string
  onSignOut(): void
  onboardingCompleted: boolean
  onboardingDismissed: boolean
  stepsCompleted: number
  unreadCount: number
  leadCount: number
  feedbackCount: number
  personaItems: PersonaSidebarItem[]
  domains:
    | {
        id: string
        name: string
        icon: string | null
      }[]
    | null
    | undefined
}

const PERSONA_ICON_MAP: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
  BRIEFCASE: {
    icon: <Briefcase className="w-3.5 h-3.5" />,
    bg: 'bg-blue-100 dark:bg-blue-950/50',
    text: 'text-indigo-500',
  },
  HEADPHONES: {
    icon: <Headphones className="w-3.5 h-3.5" />,
    bg: 'bg-green-100 dark:bg-green-950/50',
    text: 'text-green-600',
  },
  HOME: {
    icon: <Home className="w-3.5 h-3.5" />,
    bg: 'bg-orange-100 dark:bg-orange-950/50',
    text: 'text-orange-600',
  },
  UTENSILS: {
    icon: <Utensils className="w-3.5 h-3.5" />,
    bg: 'bg-yellow-100 dark:bg-yellow-950/50',
    text: 'text-yellow-600',
  },
  STETHOSCOPE: {
    icon: <Stethoscope className="w-3.5 h-3.5" />,
    bg: 'bg-cyan-100 dark:bg-cyan-950/50',
    text: 'text-cyan-600',
  },
  CALENDAR: {
    icon: <Calendar className="w-3.5 h-3.5" />,
    bg: 'bg-purple-100 dark:bg-purple-950/50',
    text: 'text-purple-600',
  },
  SHOPPING_BAG: {
    icon: <ShoppingBag className="w-3.5 h-3.5" />,
    bg: 'bg-pink-100 dark:bg-pink-950/50',
    text: 'text-pink-600',
  },
}

export const MinMenu = ({
  onShrink,
  current,
  onSignOut,
  domains,
  onboardingCompleted,
  onboardingDismissed,
  stepsCompleted,
  unreadCount,
  leadCount,
  feedbackCount,
  personaItems,
}: MinMenuProps) => {
  const showOnboarding = !onboardingCompleted && !onboardingDismissed
  const isOnboardingActive = current === 'getting-started'

  return (
    <div className="p-2 md:p-3 flex flex-col items-center h-full">
      <button
        onClick={onShrink}
        className={`
          animate-fade-in opacity-0 delay-300 fill-mode-forwards cursor-pointer p-2 rounded-lg
          hover:bg-[var(--bg-hover)] transition-all duration-200 mb-3 md:mb-6
        `}
      >
        <Image
          src="/images/minilogo.png"
          alt="LOGO"
          width={32}
          height={32}
          className="md:w-8 md:h-8"
        />
      </button>

      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between flex-1 w-full overflow-y-auto">
        <div className="flex flex-col">
          {SIDE_BAR_MENU.map((menu, key) => (
            <MenuItem
              size="min"
              {...menu}
              key={key}
              current={current}
              badge={
                menu.path === 'conversation'
                  ? unreadCount
                  : menu.path === 'leads'
                  ? leadCount
                  : menu.path === 'feedback'
                  ? feedbackCount
                  : undefined
              }
            />
          ))}

          {showOnboarding && (
            <Link
              href="/getting-started"
              className={cn(
                'flex items-center justify-center rounded-lg md:py-3 py-2 my-0.5 md:my-1',
                'transition-all duration-200 ease-in-out',
                'group relative',
                isOnboardingActive
                  ? [
                      'bg-[var(--bg-active)]',
                      'text-[var(--text-accent)]',
                      'shadow-sm',
                    ]
                  : [
                      'text-[var(--text-secondary)]',
                      'hover:bg-[var(--bg-hover)]',
                      'hover:text-slate-900 dark:hover:text-white',
                    ]
              )}
            >
              <div className="relative transition-transform duration-200 group-hover:scale-110">
                <Rocket className="md:w-5 md:h-5 w-4 h-4" />
                {stepsCompleted < 4 && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-[var(--bg-surface)]',
                      stepsCompleted === 0 && 'animate-pulse'
                    )}
                  />
                )}
              </div>

              {isOnboardingActive && (
                <div className="absolute md:bottom-1 bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" />
              )}

              <div
                className={`
                  absolute left-full ml-2 px-2 py-1 rounded-md bg-slate-900 dark:bg-[var(--bg-active)] text-white text-xs
                  whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50
                  flex items-center gap-1.5
                `}
              >
                Getting Started
                {stepsCompleted > 0 && stepsCompleted < 4 && (
                  <span className="text-[var(--text-accent)] font-medium">{stepsCompleted}/4</span>
                )}
              </div>
            </Link>
          )}

          <DomainMenu min domains={domains} />

          {personaItems.map((item) => {
            const basePath = item.path.split('?')[0]
            const isActive = current === basePath
            const iconConfig = PERSONA_ICON_MAP[item.icon]
            return (
              <Link
                key={`${item.domainId}-${item.persona}`}
                href={`/${item.path}`}
                className={cn(
                  'flex items-center justify-center rounded-lg md:py-2 py-1.5 my-0.5 md:my-1',
                  'transition-all duration-200 ease-in-out group relative',
                  isActive
                    ? 'bg-[var(--bg-surface)] shadow-sm'
                    : 'hover:bg-[var(--bg-hover)]'
                )}
              >
                {iconConfig && (
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
                      iconConfig.bg,
                      iconConfig.text
                    )}
                  >
                    {iconConfig.icon}
                  </div>
                )}
                <div className="absolute left-full ml-2 px-2 py-1 rounded-md bg-slate-900 dark:bg-[var(--bg-active)] text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50">
                  {item.label} — {item.domainName}
                </div>
              </Link>
            )
          })}
        </div>

        <div className="flex flex-col border-t border-[var(--border-default)] pt-2 mt-2 md:pt-3 md:mt-3">
          <button
            onClick={onSignOut}
            className={`
              flex flex-col items-center justify-center rounded-lg py-2 md:py-2 text-[var(--text-secondary)]
              hover:bg-rose-950/20 hover:text-rose-400
              transition-all duration-200 group relative
            `}
          >
            <LogOut className="md:w-5 md:h-5 h-4 w-4 group-hover:scale-110 transition-transform" />
            <div
              className={`
                absolute left-full ml-2 px-2 py-1 rounded-md bg-slate-900 dark:bg-[var(--bg-active)] text-white text-xs
                whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50
              `}
            >
              Sign Out
            </div>
          </button>

          <MenuItem size="min" label="Mobile App" icon={<MonitorSmartphone />} />
        </div>
      </div>
    </div>
  )
}
