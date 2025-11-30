import { SIDE_BAR_MENU } from '@/constants/menu'
import React from 'react'
import { LogOut, MonitorSmartphone } from 'lucide-react'
import MenuItem from './menu-item'
import DomainMenu from './domain-menu'
import Image from 'next/image'

type MinMenuProps = {
  onShrink(): void
  current: string
  onSignOut(): void
  domains:
    | {
        id: string
        name: string
        icon: string | null
      }[]
    | null
    | undefined
}

export const MinMenu = ({
  onShrink,
  current,
  onSignOut,
  domains,
}: MinMenuProps) => {
  return (
    <div className="p-2 md:p-3 flex flex-col items-center h-full">
      <button
        onClick={onShrink}
        className={`
            animate-fade-in opacity-0 delay-300 fill-mode-forwards cursor-pointer p-2 rounded-lg
            hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 mb-3 md:mb-6
          `}
      >
        <Image
          src="/images/minilogo.png"
          alt='LOGO'
          width={32}
          height={32}
          className='md:w-8 md:h-8'
        />
      </button>
      
      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between flex-1 w-full overflow-y-auto">
        <div className="flex flex-col">
          {SIDE_BAR_MENU.map((menu, key) => (
            <MenuItem
              size="min"
              {...menu}
              key={key}
              current={current}
            />
          ))}
          <DomainMenu
            min
            domains={domains}
          />
        </div>
        <div className="flex flex-col border-t border-slate-200 dark:border-slate-800 pt-2 mt-2 md:pt-3 md:mt-3">
          <button
            onClick={onSignOut}
            className={`
                flex flex-col items-center justify-center rounded-lg py-2 md:py-2 text-slate-600 dark:text-slate-400
                hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400
                transition-all duration-200 group relative
              `}
          >
            <LogOut className='md:w-5 md:h-5 h-4 w-4 group-hover:scale-110 transition-transform' />

            <div className={`
                absolute left-full ml-2 px-2 py-1 rounded-md bg-slate-900 dark:bg-slate-700 text-white text-xs
                whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50
              `}>
                Sign Out
              </div>
          </button>

          <MenuItem 
            size='min'
            label='Mobile App'
            icon={<MonitorSmartphone />}
          />
        </div>
      </div>
    </div>
  )
}