'use client'

import { cn } from '@/lib/utils'
import {
  User,
  Shield,
  Settings,
  Bell,
  CreditCard,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface SettingsSidebarProps {
  userName?: string
  userEmail?: string
  userAvatar?: string
}

const navItems = [
  { id: 'profile', label: 'Profile', icon: User, group: 'Account', href: '/account/profile' },
  { id: 'security', label: 'Security', icon: Shield, group: 'Account', href: '/account/security' },
  { id: 'preferences', label: 'Preferences', icon: Settings, group: 'Experience', href: '/account/preferences' },
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'Experience', href: '/account' },
  { id: 'billing', label: 'Billing', icon: CreditCard, group: 'Billing', href: '/account' },
]

const groups = ['Account', 'Experience', 'Billing']

export function SettingsSidebar({
  userName = 'User',
  userEmail = '',
  userAvatar,
}: SettingsSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const getActiveSection = () => {
    if (pathname?.includes('/profile')) return 'profile'
    if (pathname?.includes('/security')) return 'security'
    if (pathname?.includes('/preferences')) return 'preferences'
    return 'notifications'
  }

  const activeSection = getActiveSection()

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className='lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm'
      >
        <Menu className='w-5 h-5' />
      </button>

      {mobileOpen && (
        <div
          className='lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40'
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transition-all duration-300 ease-out',
          collapsed ? 'w-20' : 'w-72',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className='flex flex-col h-full'>
          <div
            className={cn(
              'flex items-center p-6 border-b border-slate-200 dark:border-slate-800',
              collapsed ? 'justify-center' : 'justify-between'
            )}
          >
            {!collapsed && (
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20'>
                  <Settings className='w-5 h-5 text-white' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-slate-900 dark:text-white'>
                    Settings
                  </h2>
                  <p className='text-xs text-slate-500 dark:text-slate-400'>
                    Manage your account
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className='hidden lg:block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors'
            >
              {collapsed ? (
                <ChevronLeft className='w-4 h-4 rotate-180' />
              ) : (
                <ChevronLeft className='w-4 h-4' />
              )}
            </button>

            <button
              onClick={() => setMobileOpen(false)}
              className='lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          <nav className='flex-1 overflow-y-auto p-4'>
            <div className='space-y-6'>
              {groups.map((group) => {
                const groupItems = navItems.filter((item) => item.group === group)
                if (groupItems.length === 0) return null

                return (
                  <div key={group}>
                    {!collapsed && (
                      <span className='text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 mb-2 block'>
                        {group}
                      </span>
                    )}
                    <ul className='space-y-1'>
                      {groupItems.map((item) => {
                        const isActive = activeSection === item.id
                        const Icon = item.icon

                        return (
                          <li key={item.id}>
                            <button
                              onClick={() => {
                                router.push(item.href)
                                setMobileOpen(false)
                              }}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                                collapsed && 'justify-center',
                                isActive
                                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                              )}
                              title={collapsed ? item.label : undefined}
                            >
                              <Icon className='w-5 h-5 flex-shrink-0' />
                              {!collapsed && (
                                <span className='truncate'>{item.label}</span>
                              )}
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          </nav>

          {!collapsed && (
            <div className='p-4 border-t border-slate-200 dark:border-slate-800'>
              <div className='flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50'>
                <div className='w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm'>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-slate-900 dark:text-white truncate'>
                    {userName}
                  </p>
                  <p className='text-xs text-slate-500 dark:text-slate-400 truncate'>
                    {userEmail}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}