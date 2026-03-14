'use client'

import { useThemeMode } from '@/hooks/settings/use-settings'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type ThemeOption = 'light' | 'system' | 'dark'

const DarkModetoggle = () => {
  const { setTheme, theme } = useThemeMode()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interface Theme</CardTitle>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-4'>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className='h-36 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] animate-pulse'
              />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const options: { value: ThemeOption; label: string; subtext: string }[] = [
    { value: 'light', label: 'Light', subtext: 'Clean white interface' },
    { value: 'system', label: 'System', subtext: 'Follows your OS' },
    { value: 'dark', label: 'Dark', subtext: 'Easy on the eyes' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interface Theme</CardTitle>
        <CardDescription>Choose your preferred color scheme</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          {options.map(({ value, label, subtext }) => {
            const isActive = theme === value
            return (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  'relative flex flex-col gap-3 p-3 rounded-xl border-2 text-left transition-all duration-200',
                  isActive
                    ? 'border-[var(--border-strong)] dark:border-white ring-2 ring-[var(--border-strong)] dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-slate-950'
                    : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                )}
              >
                {isActive && (
                  <span className='absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--bg-page)] dark:bg-white flex items-center justify-center z-10'>
                    <Check className='w-3 h-3 text-[var(--text-primary)]' />
                  </span>
                )}

                {value === 'light' && (
                  <div className='w-full h-24 rounded-lg bg-white border border-[var(--border-default)] flex flex-col justify-center gap-2 px-3 overflow-hidden'>
                    <div className='h-2 w-3/4 bg-[var(--bg-card)] rounded-full' />
                    <div className='h-2 w-1/2 bg-[var(--bg-surface)] rounded-full' />
                    <div className='h-2 w-2/3 bg-[var(--bg-card)] rounded-full' />
                    <div className='flex gap-1.5 mt-1'>
                      <div className='h-2 w-2 rounded-full bg-[var(--bg-card)]' />
                      <div className='h-2 w-2 rounded-full bg-[var(--bg-card)]' />
                      <div className='h-2 w-2 rounded-full bg-[var(--bg-card)]' />
                    </div>
                  </div>
                )}

                {value === 'system' && (
                  <div className='relative w-full h-24 rounded-lg overflow-hidden border border-[var(--border-default)]'>
                    <div className='absolute inset-y-0 left-0 right-[50%] bg-white flex flex-col justify-center gap-2 px-3'>
                      <div className='h-2 w-full bg-[var(--bg-card)] rounded-full' />
                      <div className='h-2 w-3/4 bg-[var(--bg-surface)] rounded-full' />
                      <div className='h-2 w-full bg-[var(--bg-card)] rounded-full' />
                    </div>
                    <div className='absolute inset-y-0 right-0 left-[50%] bg-[var(--bg-page)] flex flex-col justify-center gap-2 px-3'>
                      <div className='h-2 w-full bg-[var(--bg-active)] rounded-full' />
                      <div className='h-2 w-3/4 bg-[var(--bg-surface)] rounded-full' />
                      <div className='h-2 w-full bg-[var(--bg-active)] rounded-full' />
                    </div>
                    <div className='absolute inset-y-0 left-[47%] w-6 bg-gradient-to-r from-white to-[var(--bg-page)] -skew-x-6' />
                  </div>
                )}

                {value === 'dark' && (
                  <div className='w-full h-24 rounded-lg bg-[var(--bg-page)] flex flex-col justify-center gap-2 px-3 overflow-hidden'>
                    <div className='h-2 w-3/4 bg-[var(--bg-active)] rounded-full' />
                    <div className='h-2 w-1/2 bg-[var(--bg-surface)] rounded-full' />
                    <div className='h-2 w-2/3 bg-[var(--bg-active)] rounded-full' />
                    <div className='flex gap-1.5 mt-1'>
                      <div className='h-2 w-2 rounded-full bg-[var(--bg-card)]' />
                      <div className='h-2 w-2 rounded-full bg-[var(--bg-active)]' />
                      <div className='h-2 w-2 rounded-full bg-[var(--bg-card)]' />
                    </div>
                  </div>
                )}

                <div>
                  <p className='text-sm font-medium text-[var(--text-primary)]'>
                    {label}
                  </p>
                  <p className='text-xs text-[var(--text-muted)]'>{subtext}</p>
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default DarkModetoggle
