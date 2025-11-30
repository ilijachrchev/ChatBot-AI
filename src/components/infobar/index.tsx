import React from 'react'
import BreadCrumb from './bread-crumb'
import { Headphones, Star, Trash, Bell } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { cn } from '@/lib/utils'

type Props = {}

const InfoBar = (props: Props) => {
  return (
    <div className="flex w-full justify-between items-start md:items-center py-3 md:py-4 mb-4 md:mb-6 gap-4 flex-col md:flex-row">
      <BreadCrumb />
      
      <div className="flex gap-2 md:gap-3 items-center">
        <div className="flex gap-2">
          <button 
            className={cn(
              "h-9 w-9 md:h-10 md:w-10 rounded-lg",
              "border border-slate-200 dark:border-slate-700",
              "bg-white dark:bg-slate-900",
              "hover:bg-slate-50 dark:hover:bg-slate-800",
              "hover:border-rose-300 dark:hover:border-rose-700",
              "transition-all duration-200",
              "flex items-center justify-center group"
            )}
          >
            <Trash className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-rose-500 transition-colors" />
          </button>
          
          <button 
            className={cn(
              "h-9 w-9 md:h-10 md:w-10 rounded-lg",
              "border border-slate-200 dark:border-slate-700",
              "bg-white dark:bg-slate-900",
              "hover:bg-slate-50 dark:hover:bg-slate-800",
              "hover:border-amber-300 dark:hover:border-amber-700",
              "transition-all duration-200",
              "flex items-center justify-center group"
            )}
          >
            <Star className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-amber-500 transition-colors" />
          </button>
        </div>

        <div className="relative">
          <button 
            className={cn(
              "h-9 w-9 md:h-10 md:w-10 rounded-lg",
              "border border-slate-200 dark:border-slate-700",
              "bg-white dark:bg-slate-900",
              "hover:bg-slate-50 dark:hover:bg-slate-800",
              "hover:border-blue-300 dark:hover:border-blue-700",
              "transition-all duration-200",
              "flex items-center justify-center group"
            )}
          >
            <Bell className="h-4 w-4 text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors" />
          </button>
          <span className={cn(
            "absolute -top-1 -right-1",
            "h-5 w-5 rounded-full",
            "bg-gradient-to-br from-rose-500 to-rose-600",
            "text-white text-xs font-semibold",
            "flex items-center justify-center",
            "shadow-lg shadow-rose-500/50",
            "ring-2 ring-white dark:ring-slate-900"
          )}>
            3
          </span>
        </div>

        <Avatar className={cn(
          "h-9 w-9 md:h-10 md:w-10",
          "ring-2 ring-offset-2 ring-blue-500/20",
          "hover:ring-blue-500/40",
          "transition-all cursor-pointer",
          "ring-offset-white dark:ring-offset-slate-950"
        )}>
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <Headphones className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>

        <Avatar className={cn(
          "h-9 w-9 md:h-10 md:w-10",
          "ring-2 ring-offset-2 ring-slate-200 dark:ring-slate-700",
          "hover:ring-blue-500/40",
          "transition-all cursor-pointer",
          "ring-offset-white dark:ring-offset-slate-950"
        )}>
          <AvatarImage src="https://github.com/shadcn.png" alt="User" />
          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white">
            CN
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}

export default InfoBar
