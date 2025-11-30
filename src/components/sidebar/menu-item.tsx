import { cn } from '@/lib/utils'
import Link from 'next/link'
import React, { JSX } from 'react'

type Props = {
  size: 'max' | 'min'
  label: string
  icon: JSX.Element
  path?: string
  current?: string
  onSignOut?(): void
}

const MenuItem = ({ size, path, icon, label, current, onSignOut }: Props) => {

  const isActive = current === path 

  switch (size) {
    case 'max':
      return (
        <Link
          onClick={onSignOut}
          className={cn(
            'flex items-center md:gap-3 gap-2 md:px-3 px-2 md:py-2.5 py-1.5 rounded-lg my-0.5',
            'transition-all duration-200 ease-in-out',
            'group relative overflow-hidden',

            isActive && [
              'bg-white dark:bg-slate-800',
              'font-semibold text-slate-900 dark:text-white',
              'shadow-sm',

              'before:absolute before:left-0 before:top-0 before:bottom-0',
              'before:w-1 before:bg-gradient-to-b before:from-blue-500 before:to-blue-600',
              'before:rounded-l-lg'
            ],

            !isActive && [
              'text-slate-600 dark:text-slate-400',
              'hover:bg-slate-50 dark:hover:bg-slate-800/50',
              'hover:text-slate-900 dark:hover:text-white'
            ]
          )}
          href={path ? `/${path}` : '#'}
        >
          <div className={cn(
            'flex items-center justify-center md:w-5 w-4 md:h-5 h-4 transition-transform duration-200',
            'group-hover:scale-110',
            isActive && 'text-blue-600 dark:text-blue-400'
          )}>
            {icon}
          </div>
          <span className='text-sm'>{label}</span>

          {!isActive && (
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
          )}
        </Link>
      )
    case 'min':
      return (
        <Link
          onClick={onSignOut}
          className={cn(
            'flex items-center justify-center rounded-lg md:py-3 py-2 my-0.5 md:my-1',
            'transition-all duration-200 ease-in-out',
            'group relative',
            
            isActive && [
              'bg-white dark:bg-slate-800',
              'text-blue-600 dark:text-blue-400',
              'shadow-sm',
            ],
            
            !isActive && [
              'text-slate-600 dark:text-slate-400',
              'hover:bg-slate-50 dark:hover:bg-slate-800/50',
              'hover:text-slate-900 dark:hover:text-white'
            ]
          )}
          href={path ? `/${path}` : '#'}
        >
          <div className={cn(
            'transition-transform duration-200',
            'group-hover:scale-110'
          )}>
            {icon}
          </div>
          {isActive && (
            <div className='absolute md:bottom-1 bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full'></div>
          )}
        </Link>
      )
    default:
      return null
  }
}

export default MenuItem