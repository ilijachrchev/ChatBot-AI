'use client'
import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Plus, BookOpen, Mail, MessageSquare, ChevronRight } from 'lucide-react'

type QuickAction = {
  icon: React.ReactNode
  label: string
  description: string
  href: string
  accentColor: 'blue' | 'green' | 'purple' | 'amber'
}

const accentClasses: Record<
  string,
  { iconBg: string; iconText: string; hoverBorder: string; chevron: string }
> = {
  blue: {
    iconBg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
    iconText: 'text-[var(--text-accent)]',
    hoverBorder: 'hover:border-blue-200 dark:hover:border-blue-800',
    chevron: 'group-hover:text-indigo-500 dark:group-hover:text-indigo-400',
  },
  green: {
    iconBg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    iconText: 'text-emerald-600 dark:text-emerald-400',
    hoverBorder: 'hover:border-emerald-200 dark:hover:border-emerald-800',
    chevron: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400',
  },
  purple: {
    iconBg: 'bg-purple-500/10 dark:bg-purple-500/15',
    iconText: 'text-purple-600 dark:text-purple-400',
    hoverBorder: 'hover:border-purple-200 dark:hover:border-purple-800',
    chevron: 'group-hover:text-purple-500 dark:group-hover:text-purple-400',
  },
  amber: {
    iconBg: 'bg-amber-500/10 dark:bg-amber-500/15',
    iconText: 'text-amber-600 dark:text-amber-400',
    hoverBorder: 'hover:border-amber-200 dark:hover:border-amber-800',
    chevron: 'group-hover:text-amber-500 dark:group-hover:text-amber-400',
  },
}

const ACTIONS: QuickAction[] = [
  {
    icon: <Plus className="h-5 w-5" />,
    label: 'Add Domain',
    description: 'Connect a new website',
    href: '/settings',
    accentColor: 'blue',
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    label: 'Knowledge Base',
    description: 'Upload files or scrape website',
    href: '/settings',
    accentColor: 'green',
  },
  {
    icon: <Mail className="h-5 w-5" />,
    label: 'New Campaign',
    description: 'Send email to your leads',
    href: '/email-marketing',
    accentColor: 'purple',
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    label: 'View Conversations',
    description: 'See all customer chats',
    href: '/conversation',
    accentColor: 'amber',
  },
]

export const QuickActions = () => {
  return (
    <div
      className={cn(
        'rounded-xl border border-[var(--border-default)] dark:border-[var(--border-strong)]',
        'bg-white dark:bg-[var(--bg-surface)] p-5 md:p-6 shadow-sm h-full flex flex-col'
      )}
    >
      <div className="mb-5">
        <h2 className="font-bold text-lg md:text-xl text-[var(--text-primary)]">
          Quick Actions
        </h2>
        <p className="text-sm text-slate-500 dark:text-[var(--text-secondary)] mt-0.5">
          Common tasks to manage your chatbot
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 content-start">
        {ACTIONS.map((action) => {
          const colors = accentClasses[action.accentColor]
          return (
            <Link
              key={action.label}
              href={action.href}
              className={cn(
                'group flex items-center gap-3 p-3.5 rounded-xl',
                'border border-[var(--border-default)] dark:border-[var(--border-strong)]',
                'bg-slate-50/50 dark:bg-[var(--bg-surface)]/60',
                'hover:bg-white dark:hover:bg-[#243044]',
                'hover:shadow-sm',
                colors.hoverBorder,
                'transition-all duration-200 hover:scale-[1.01]'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  colors.iconBg,
                  colors.iconText
                )}
              >
                {action.icon}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                  {action.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-[var(--text-secondary)] mt-0.5 leading-tight">
                  {action.description}
                </p>
              </div>

              <ChevronRight
                className={cn(
                  'h-4 w-4 shrink-0 text-slate-400 dark:text-[var(--text-muted)]',
                  'group-hover:translate-x-0.5 transition-all duration-200',
                  colors.chevron
                )}
              />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
