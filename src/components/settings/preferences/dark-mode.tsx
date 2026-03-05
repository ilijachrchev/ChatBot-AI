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
                className='h-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 animate-pulse'
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
                    ? 'border-slate-900 dark:border-white ring-2 ring-slate-900 dark:ring-white ring-offset-2 ring-offset-white dark:ring-offset-slate-950'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                {isActive && (
                  <span className='absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center z-10'>
                    <Check className='w-3 h-3 text-white dark:text-slate-900' />
                  </span>
                )}

                {value === 'light' && (
                  <div className='w-full h-24 rounded-lg bg-white border border-slate-200 flex flex-col justify-center gap-2 px-3 overflow-hidden'>
                    <div className='h-2 w-3/4 bg-slate-200 rounded-full' />
                    <div className='h-2 w-1/2 bg-slate-100 rounded-full' />
                    <div className='h-2 w-2/3 bg-slate-200 rounded-full' />
                    <div className='flex gap-1.5 mt-1'>
                      <div className='h-2 w-2 rounded-full bg-slate-300' />
                      <div className='h-2 w-2 rounded-full bg-slate-200' />
                      <div className='h-2 w-2 rounded-full bg-slate-300' />
                    </div>
                  </div>
                )}

                {value === 'system' && (
                  <div className='relative w-full h-24 rounded-lg overflow-hidden border border-slate-200'>
                    <div className='absolute inset-y-0 left-0 right-[50%] bg-white flex flex-col justify-center gap-2 px-3'>
                      <div className='h-2 w-full bg-slate-200 rounded-full' />
                      <div className='h-2 w-3/4 bg-slate-100 rounded-full' />
                      <div className='h-2 w-full bg-slate-200 rounded-full' />
                    </div>
                    <div className='absolute inset-y-0 right-0 left-[50%] bg-slate-900 flex flex-col justify-center gap-2 px-3'>
                      <div className='h-2 w-full bg-slate-700 rounded-full' />
                      <div className='h-2 w-3/4 bg-slate-800 rounded-full' />
                      <div className='h-2 w-full bg-slate-700 rounded-full' />
                    </div>
                    <div className='absolute inset-y-0 left-[47%] w-6 bg-gradient-to-r from-white to-slate-900 -skew-x-6' />
                  </div>
                )}

                {value === 'dark' && (
                  <div className='w-full h-24 rounded-lg bg-slate-900 flex flex-col justify-center gap-2 px-3 overflow-hidden'>
                    <div className='h-2 w-3/4 bg-slate-700 rounded-full' />
                    <div className='h-2 w-1/2 bg-slate-800 rounded-full' />
                    <div className='h-2 w-2/3 bg-slate-700 rounded-full' />
                    <div className='flex gap-1.5 mt-1'>
                      <div className='h-2 w-2 rounded-full bg-slate-600' />
                      <div className='h-2 w-2 rounded-full bg-slate-700' />
                      <div className='h-2 w-2 rounded-full bg-slate-600' />
                    </div>
                  </div>
                )}

                <div>
                  <p className='text-sm font-medium text-slate-900 dark:text-white'>
                    {label}
                  </p>
                  <p className='text-xs text-slate-500'>{subtext}</p>
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
