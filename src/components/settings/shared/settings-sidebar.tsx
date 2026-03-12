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
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'Experience', href: '/account/notifications' },
  { id: 'billing', label: 'Billing', icon: CreditCard, group: 'Billing', href: '/account/billing' },
]

const groups = ['Account', 'Experience', 'Billing']

export function SettingsSidebar({
  userName = 'User',
  userEmail = '',
}: SettingsSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const getActiveSection = () => {
    if (pathname?.includes('/profile')) return 'profile'
    if (pathname?.includes('/security')) return 'security'
    if (pathname?.includes('/preferences')) return 'preferences'
    if (pathname?.includes('/notifications')) return 'notifications'
    if (pathname?.includes('/billing')) return 'billing'
    return 'profile'
  }

  const activeSection = getActiveSection()

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className='lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[var(--bg-page)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shadow-sm'
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
          'fixed lg:sticky top-0 left-0 h-screen bg-[var(--bg-page)] border-r border-[var(--border-default)] z-50 transition-all duration-300 ease-out flex-shrink-0',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className='flex flex-col h-full'>
          <div
            className={cn(
              'flex items-center p-6 border-b border-[var(--border-default)]',
              collapsed ? 'justify-center' : 'justify-between'
            )}
          >
            {!collapsed && (
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center'>
                  <Settings className='w-5 h-5 text-[var(--text-primary)]' />
                </div>
                <div>
                  <h2 className='text-lg font-semibold text-[var(--text-primary)]'>
                    Settings
                  </h2>
                  <p className='text-xs text-[var(--text-muted)]'>
                    Manage your account
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setCollapsed(!collapsed)}
              className='hidden lg:block p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-slate-900 dark:hover:text-white transition-colors'
            >
              {collapsed ? (
                <ChevronLeft className='w-4 h-4 rotate-180' />
              ) : (
                <ChevronLeft className='w-4 h-4' />
              )}
            </button>

            <button
              onClick={() => setMobileOpen(false)}
              className='lg:hidden p-2 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'
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
                      <span className='text-[10px] font-medium uppercase tracking-widest text-[var(--text-muted)] px-3 mb-1 block'>
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
                                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                                collapsed ? 'justify-center' : 'justify-start',
                                isActive
                                  ? 'bg-indigo-500 text-white font-semibold'
                                  : 'font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-slate-900 dark:hover:text-white'
                              )}
                              title={collapsed ? item.label : undefined}
                            >
                              <Icon className='w-5 h-5 flex-shrink-0' />
                              {!collapsed && (
                                <span className='truncate text-left flex-1'>{item.label}</span>
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
            <div className='p-4 border-t border-[var(--border-default)]'>
              <div className='flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[var(--bg-page)] border border-[var(--border-default)]'>
                <div className='w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-[var(--text-primary)] font-semibold text-sm flex-shrink-0'>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-semibold text-[var(--text-primary)] truncate'>
                    {userName}
                  </p>
                  <p className='text-xs text-[var(--text-muted)] truncate'>
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
