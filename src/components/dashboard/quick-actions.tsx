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
    iconBg: 'bg-[var(--primary)] dark:bg-[var(--primary)]',
    iconText: 'text-[var(--text-accent)]',
    hoverBorder: 'hover:border-[var(--primary)] dark:hover:border-[var(--primary)]',
    chevron: 'group-hover:text-[var(--primary)] dark:group-hover:text-[var(--primary)]',
  },
  green: {
    iconBg: 'bg-[var(--success)] dark:bg-[var(--success)]',
    iconText: 'text-[var(--success)] dark:text-[var(--success)]',
    hoverBorder: 'hover:border-[var(--success)] dark:hover:border-[var(--success)]',
    chevron: 'group-hover:text-[var(--success)] dark:group-hover:text-[var(--success)]',
  },
  purple: {
    iconBg: 'bg-[var(--primary-light)]',
    iconText: 'text-[var(--primary)]',
    hoverBorder: 'hover:border-[var(--primary)]',
    chevron: 'group-hover:text-[var(--primary)]',
  },
  amber: {
    iconBg: 'bg-[var(--warning)] dark:bg-[var(--warning)]',
    iconText: 'text-[var(--warning)] dark:text-[var(--warning)]',
    hoverBorder: 'hover:border-[var(--warning)] dark:hover:border-[var(--warning)]',
    chevron: 'group-hover:text-[var(--warning)] dark:group-hover:text-[var(--warning)]',
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
        'bg-[var(--bg-surface)] p-5 md:p-6 shadow-sm h-full flex flex-col'
      )}
    >
      <div className="mb-5">
        <h2 className="font-bold text-lg md:text-xl text-[var(--text-primary)]">
          Quick Actions
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-0.5">
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
                'bg-[var(--bg-card)]/60',
                'hover:bg-[var(--bg-surface)]',
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
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-tight">
                  {action.description}
                </p>
              </div>

              <ChevronRight
                className={cn(
                  'h-4 w-4 shrink-0 text-[var(--text-muted)]',
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
