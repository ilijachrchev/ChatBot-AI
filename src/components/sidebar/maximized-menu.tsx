import { SIDE_BAR_MENU } from '@/constants/menu'
import { cn } from '@/lib/utils'
import {
  Briefcase,
  Calendar,
  Headphones,
  Home,
  LogOut,
  Menu,
  MonitorSmartphone,
  Rocket,
  ShoppingBag,
  Sparkles,
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

type Props = {
  onExpand(): void
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
    text: 'text-blue-600',
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

const MaxMenu = ({
  current,
  domains,
  onExpand,
  onSignOut,
  onboardingCompleted,
  onboardingDismissed,
  stepsCompleted,
  unreadCount,
  leadCount,
  feedbackCount,
  personaItems,
}: Props) => {
  const showOnboarding = !onboardingCompleted && !onboardingDismissed
  const isOnboardingActive = current === 'getting-started'

  return (
    <div className="py-2 px-3 md:py-3 md:px-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-3 md:mb-6">
        <Image
          src="/images/fulllogo.png"
          alt="LOGO"
          className="animate-fade-in opacity-0 delay-300 fill-mode-forwards"
          width={140}
          height={40}
        />
        <button
          onClick={onExpand}
          className={`
            p-1.5 md:p-2 rounded-lg text-slate-600 dark:text-slate-400
            hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white
            transition-all duration-200 cursor-pointer
            animate-fade-in opacity-0 delay-300 fill-mode-forwards
          `}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between flex-1 overflow-y-auto">
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 md:mb-2">
            Menu
          </p>
          <div className="flex flex-col mb-1 md:mb-2">
            {SIDE_BAR_MENU.map((menu, key) => (
              <MenuItem
                size="max"
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
                  'flex items-center md:gap-3 gap-2 md:px-3 px-2 md:py-2.5 py-1.5 rounded-lg my-0.5',
                  'transition-all duration-200 ease-in-out',
                  'group relative overflow-hidden',
                  isOnboardingActive
                    ? [
                        'bg-white dark:bg-slate-800',
                        'font-semibold text-slate-900 dark:text-white',
                        'shadow-sm',
                        'before:absolute before:left-0 before:top-0 before:bottom-0',
                        'before:w-1 before:bg-gradient-to-b before:from-blue-500 before:to-blue-600',
                        'before:rounded-l-lg',
                      ]
                    : [
                        'text-slate-600 dark:text-slate-400',
                        'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                        'hover:text-slate-900 dark:hover:text-white',
                      ]
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center md:w-5 w-4 md:h-5 h-4 transition-transform duration-200',
                    'group-hover:scale-110',
                    isOnboardingActive && 'text-blue-600 dark:text-blue-400'
                  )}
                >
                  <Rocket />
                </div>
                <span className="text-sm flex-1">Getting Started</span>

                {stepsCompleted === 4 ? (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex-shrink-0">
                    ✓
                  </span>
                ) : (
                  <span
                    className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500 text-white flex-shrink-0',
                      stepsCompleted === 0 && 'animate-pulse'
                    )}
                  >
                    {stepsCompleted}/4
                  </span>
                )}

                {!isOnboardingActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </Link>
            )}
          </div>

          <DomainMenu domains={domains} />
        </div>

        {personaItems.length > 0 && (
          <div className="mx-0 mt-2">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950/50 p-2">
              <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
                <Sparkles className="w-3 h-3 text-slate-400" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  Tailored Features
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                {personaItems.map((item) => {
                  const basePath = item.path.split('?')[0]
                  const isActive = current === basePath
                  const iconConfig = PERSONA_ICON_MAP[item.icon]
                  return (
                    <Link
                      key={`${item.domainId}-${item.persona}`}
                      href={`/${item.path}`}
                      className={cn(
                        'flex items-center gap-2 px-2 py-2 rounded-lg transition-colors',
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800'
                          : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/50'
                      )}
                    >
                      {iconConfig && (
                        <div
                          className={cn(
                            'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                            iconConfig.bg,
                            iconConfig.text
                          )}
                        >
                          {iconConfig.icon}
                        </div>
                      )}
                      <div className="flex-1 min-w-0 ml-0">
                        <p
                          className={cn(
                            'text-sm leading-tight',
                            isActive
                              ? 'font-semibold text-slate-900 dark:text-white'
                              : 'font-medium text-slate-700 dark:text-slate-300'
                          )}
                        >
                          {item.label}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{item.domainName}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col border-t border-slate-200 dark:border-slate-800 pt-2 md:pt-3 mt-2 md:mt-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 md:mb-2">
            Options
          </p>
          <button
            onClick={onSignOut}
            className={`
              flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2.5 rounded-lg text-slate-600 dark:text-slate-400
              hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400
              transition-all duration-250 group
            `}
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm">Sign Out</span>
          </button>

          <MenuItem size="max" label="Mobile App" icon={<MonitorSmartphone />} />
        </div>
      </div>
    </div>
  )
}

export default MaxMenu
