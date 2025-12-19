'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Globe,
  Code,
  Sparkles,
  Palette,
  Brain,
  Package,
  Clock,
} from 'lucide-react'

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
  description: string
}

type DomainSettingsNavProps = {
  domain: string
}

export const DomainSettingsNav = ({ domain }: DomainSettingsNavProps) => {
  const pathname = usePathname()
  
  const navItems: NavItem[] = [
    {
      label: 'Configuration',
      href: `/settings/${domain}`,
      icon: <Globe className="h-4 w-4" />,
      description: 'Domain & basic setup',
    },
    {
      label: 'Embed Code',
      href: `/settings/${domain}/embed`,
      icon: <Code className="h-4 w-4" />,
      description: '15 language snippets',
    },
    {
      label: 'AI Persona',
      href: `/settings/${domain}#persona`,
      icon: <Sparkles className="h-4 w-4" />,
      description: 'Chatbot personality',
    },
    {
      label: 'Appearance',
      href: `/settings/${domain}#appearance`,
      icon: <Palette className="h-4 w-4" />,
      description: 'Visual customization',
    },
    {
      label: 'Bot Training',
      href: `/settings/${domain}#training`,
      icon: <Brain className="h-4 w-4" />,
      description: 'FAQ & questions',
    },
    {
      label: 'Products',
      href: `/settings/${domain}#products`,
      icon: <Package className="h-4 w-4" />,
      description: 'Store management',
    },
    {
      label: 'Availability',
      href: `/settings/${domain}/availability`,
      icon: <Clock className="h-4 w-4" />,
      description: 'Working hours',
    },
  ]

  const isActive = (href: string) => {
    if (href === `/settings/${domain}`) {
      return pathname === href
    }
    
    if (href.includes('/embed') || href.includes('/availability')) {
      return pathname.includes(href)
    }
    
    if (href.includes('#')) {
      return pathname === `/settings/${domain}`
    }
    
    return false
  }

  return (
    <div className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40">
      <div className="overflow-x-auto scrollbar-hide">
        <nav className="flex items-center gap-1 px-4 md:px-6 min-w-max">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors',
                'hover:text-slate-900 dark:hover:text-white',
                'border-b-2 -mb-[1px]',
                isActive(item.href)
                  ? 'text-slate-900 dark:text-white border-slate-900 dark:border-white'
                  : 'text-slate-500 dark:text-slate-400 border-transparent'
              )}
            >
              <span
                className={cn(
                  'transition-colors',
                  isActive(item.href)
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                )}
              >
                {item.icon}
              </span>
              <div className="flex flex-col">
                <span className="leading-none">{item.label}</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal mt-0.5">
                  {item.description}
                </span>
              </div>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}