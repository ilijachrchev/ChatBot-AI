'use client'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import Image from 'next/image'
import SideBar from '@/components/sidebar'
import React from 'react'

type PersonaSidebarItem = {
  persona: string
  domainId: string
  domainName: string
  label: string
  path: string
  icon: string
}

type Props = {
  children: React.ReactNode
  domains: { id: string; name: string; icon: string }[] | null | undefined
  onboardingCompleted: boolean
  onboardingDismissed: boolean
  stepsCompleted: number
  unreadCount: number
  leadCount: number
  feedbackCount: number
  personaItems: PersonaSidebarItem[]
}

export default function DashboardShell({
  children,
  domains,
  onboardingCompleted,
  onboardingDismissed,
  stepsCompleted,
  unreadCount,
  leadCount,
  feedbackCount,
  personaItems,
}: Props) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <SideBar
        domains={domains}
        onboardingCompleted={onboardingCompleted}
        onboardingDismissed={onboardingDismissed}
        stepsCompleted={stepsCompleted}
        unreadCount={unreadCount}
        leadCount={leadCount}
        feedbackCount={feedbackCount}
        personaItems={personaItems}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="md:hidden flex items-center justify-between h-14 px-4 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 z-20">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors min-w-10 min-h-10 flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Image
            src="/images/fulllogo.png"
            alt="SendWise"
            width={110}
            height={32}
            className="object-contain"
          />
          <div className="w-10" />
        </div>
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
