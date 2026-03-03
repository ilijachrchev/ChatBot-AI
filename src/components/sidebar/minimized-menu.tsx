import { SIDE_BAR_MENU } from '@/constants/menu'
import { cn } from '@/lib/utils'
import { LogOut, MonitorSmartphone, Rocket } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import DomainMenu from './domain-menu'
import MenuItem from './menu-item'

type MinMenuProps = {
  onShrink(): void
  current: string
  onSignOut(): void
  onboardingCompleted: boolean
  onboardingDismissed: boolean
  stepsCompleted: number
  domains:
    | {
        id: string
        name: string
        icon: string | null
      }[]
    | null
    | undefined
}

export const MinMenu = ({
  onShrink,
  current,
  onSignOut,
  domains,
  onboardingCompleted,
  onboardingDismissed,
  stepsCompleted,
}: MinMenuProps) => {
  const showOnboarding = !onboardingCompleted && !onboardingDismissed
  const isOnboardingActive = current === 'getting-started'

  return (
    <div className="p-2 md:p-3 flex flex-col items-center h-full">
      <button
        onClick={onShrink}
        className={`
          animate-fade-in opacity-0 delay-300 fill-mode-forwards cursor-pointer p-2 rounded-lg
          hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 mb-3 md:mb-6
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
            <MenuItem size="min" {...menu} key={key} current={current} />
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
                      'bg-white dark:bg-slate-800',
                      'text-blue-600 dark:text-blue-400',
                      'shadow-sm',
                    ]
                  : [
                      'text-slate-600 dark:text-slate-400',
                      'hover:bg-slate-50 dark:hover:bg-slate-800/50',
                      'hover:text-slate-900 dark:hover:text-white',
                    ]
              )}
            >
              <div className="relative transition-transform duration-200 group-hover:scale-110">
                <Rocket className="md:w-5 md:h-5 w-4 h-4" />
                {stepsCompleted < 4 && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-background',
                      stepsCompleted === 0 && 'animate-pulse'
                    )}
                  />
                )}
              </div>

              {isOnboardingActive && (
                <div className="absolute md:bottom-1 bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" />
              )}

              <div
                className={`
                  absolute left-full ml-2 px-2 py-1 rounded-md bg-slate-900 dark:bg-slate-700 text-white text-xs
                  whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50
                  flex items-center gap-1.5
                `}
              >
                Getting Started
                {stepsCompleted > 0 && stepsCompleted < 4 && (
                  <span className="text-blue-300 font-medium">{stepsCompleted}/4</span>
                )}
              </div>
            </Link>
          )}

          <DomainMenu min domains={domains} />
        </div>

        <div className="flex flex-col border-t border-slate-200 dark:border-slate-800 pt-2 mt-2 md:pt-3 md:mt-3">
          <button
            onClick={onSignOut}
            className={`
              flex flex-col items-center justify-center rounded-lg py-2 md:py-2 text-slate-600 dark:text-slate-400
              hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400
              transition-all duration-200 group relative
            `}
          >
            <LogOut className="md:w-5 md:h-5 h-4 w-4 group-hover:scale-110 transition-transform" />
            <div
              className={`
                absolute left-full ml-2 px-2 py-1 rounded-md bg-slate-900 dark:bg-slate-700 text-white text-xs
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
