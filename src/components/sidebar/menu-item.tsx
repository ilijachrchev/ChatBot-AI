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
  badge?: number
}

const MenuItem = ({ size, path, icon, label, current, onSignOut, badge }: Props) => {

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
              'bg-[var(--bg-active)]',
              'font-semibold text-[var(--text-primary)]',
              'shadow-sm',
              'before:absolute before:left-0 before:top-0 before:bottom-0',
              'before:w-1 before:bg-gradient-to-b before:from-[var(--primary)] before:to-[var(--primary-light)]',
              'before:rounded-l-lg',
            ],

            !isActive && [
              'text-[var(--text-secondary)]',
              'hover:bg-[var(--bg-hover)]',
              'hover:text-[var(--text-primary)]',
            ]
          )}
          href={path ? `/${path}` : '#'}
        >
          <div className={cn(
            'flex items-center justify-center md:w-5 w-4 md:h-5 h-4 transition-transform duration-200',
            'group-hover:scale-110',
            isActive && 'text-[var(--text-accent)]'
          )}>
            {icon}
          </div>
          <span className='text-sm flex-1'>{label}</span>

          {badge !== undefined && badge > 0 && (
            <span className="ml-auto h-5 min-w-5 px-1 rounded-full bg-[var(--primary)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {badge > 99 ? '99+' : badge}
            </span>
          )}

          {!isActive && (
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
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
              'bg-[var(--bg-active)]',
              'text-[var(--text-accent)]',
              'shadow-sm',
            ],

            !isActive && [
              'text-[var(--text-secondary)]',
              'hover:bg-[var(--bg-hover)]',
              'hover:text-[var(--text-primary)]',
            ]
          )}
          href={path ? `/${path}` : '#'}
        >
          <div className={cn(
            'transition-transform duration-200',
            'group-hover:scale-110',
            'relative'
          )}>
            {icon}
            {badge !== undefined && badge > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-4 px-0.5 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold flex items-center justify-center">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </div>
          {isActive && (
            <div className='absolute md:bottom-1 bottom-0.5 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-full'></div>
          )}
        </Link>
      )
    default:
      return null
  }
}

export default MenuItem
