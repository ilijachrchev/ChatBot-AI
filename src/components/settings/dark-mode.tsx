"use client"
import { useThemeMode } from '@/hooks/settings/use-settings'
import React, { useEffect, useState } from 'react'
import { Section } from '../section-label'
import { cn } from '@/lib/utils'
import { SystemMode } from '../themes-placeholder/systemmode'
import { LightMode } from '../themes-placeholder/lightmode'
import { DarkMode } from '../themes-placeholder/darkmode'
import { Palette, Check } from 'lucide-react'

type Props = {}

const DarkModetoggle = (props: Props) => {
  const { setTheme, theme } = useThemeMode()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => setMounted(true), [])
  
  if (!mounted) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
          <div className="lg:col-span-3 flex lg:flex-row flex-col items-start gap-4">
            <div className="h-40 w-full lg:w-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-40 w-full lg:w-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-40 w-full lg:w-64 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 md:gap-8">
        <div className="lg:col-span-1">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <Palette className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Interface Theme
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Select or customize your UI theme
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={cn(
              'group relative rounded-xl overflow-hidden cursor-pointer',
              'border-2 transition-all duration-200',
              theme === 'system' 
                ? 'border-blue-500 shadow-lg shadow-blue-500/30' 
                : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
            )}
            onClick={() => setTheme('system')}
          >
            <SystemMode />
            {theme === 'system' && (
              <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-white font-semibold text-sm">System</p>
              <p className="text-white/80 text-xs">Auto-adjust based on device</p>
            </div>
          </div>

          <div
            className={cn(
              'group relative rounded-xl overflow-hidden cursor-pointer',
              'border-2 transition-all duration-200',
              theme === 'light' 
                ? 'border-blue-500 shadow-lg shadow-blue-500/30' 
                : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
            )}
            onClick={() => setTheme('light')}
          >
            <LightMode />
            {theme === 'light' && (
              <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-white font-semibold text-sm">Light</p>
              <p className="text-white/80 text-xs">Bright and clear</p>
            </div>
          </div>

          <div
            className={cn(
              'group relative rounded-xl overflow-hidden cursor-pointer',
              'border-2 transition-all duration-200',
              theme === 'dark' 
                ? 'border-blue-500 shadow-lg shadow-blue-500/30' 
                : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
            )}
            onClick={() => setTheme('dark')}
          >
            <DarkMode />
            {theme === 'dark' && (
              <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
              <p className="text-white font-semibold text-sm">Dark</p>
              <p className="text-white/80 text-xs">Easy on the eyes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DarkModetoggle