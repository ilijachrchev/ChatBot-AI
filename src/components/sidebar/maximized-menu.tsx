import { SIDE_BAR_MENU } from '@/constants/menu'
import { LogOut, Menu, MonitorSmartphone } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import DomainMenu from './domain-menu'
import MenuItem from './menu-item'

type Props = {
  onExpand(): void
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

const MaxMenu = ({ current, domains, onExpand, onSignOut }: Props) => {
  return (
    <div className="py-2 px-3 md:py-3 md:px-4 flex flex-col h-full">
      <div className="flex justify-between items-center mb-3 md:mb-6">
        <Image
          src="/images/fulllogo.png"
          alt="LOGO"
          className="animate-fade-in opacity-0 delay-300 fill-mode-forwards"
          width={140}
          height={40}
        />
        <button
          onClick={onExpand}
          className={`
              p-1.5 md:p-2 rounded-lg text-slate-600 dark:text-slate-400
              hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white
              transition-all duration-200 cursor-pointer
              animate-fade-in opacity-0 delay-300 fill-mode-forwards
            `}
        >
          <Menu className='w-5 h-5' />
        </button>
      </div>

      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between flex-1 overflow-y-auto">
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 md:mb-2">Menu</p>
          <div className='flex flex-col mb-1 md:mb-2'>
            {SIDE_BAR_MENU.map((menu, key) => (
              <MenuItem
                size="max"
                {...menu}
                key={key}
                current={current}
              />
            ))}
          </div>

          <DomainMenu domains={domains} />
        </div>

        <div className="flex flex-col border-t border-slate-200 dark:border-slate-800 pt-2 md:pt-3 mt-2 md:mt-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 md:mb-2">Options</p>
          <button
            onClick={onSignOut}
            className={`
                flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2.5 rounded-lg text-slate-600 dark:text-slate-400
                hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400
                transition-all duration-250 group
              `}
          >
            <LogOut className='w-4 h-4 md:w-5 md:h-5  group-hover:scale-110 transition-transform' />
            <span className='text-sm'>Sign Out</span>
          </button>
          
          <MenuItem
            size="max"
            label="Mobile App"
            icon={<MonitorSmartphone />}
          />
        </div>
      </div>
    </div>
  )
}

export default MaxMenu