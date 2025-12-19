import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import { Lock, ExternalLink } from 'lucide-react'

type DomainUpdateProps = {
  name: string
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
}

export const DomainUpdate = ({ name, register, errors }: DomainUpdateProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        
        <div className="relative flex items-center gap-3 p-5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-all duration-300">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 flex-shrink-0">
            <Lock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Domain Name
              </p>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                LOCKED
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-slate-900 dark:text-white truncate">
                {name}
              </p>
              <ExternalLink className="h-4 w-4 text-slate-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900 flex-shrink-0 mt-0.5">
          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">!</span>
        </div>
        <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
          <span className="font-bold">Security Notice:</span> Domain changes require verification. Contact support to update your domain name.
        </p>
      </div>
    </div>
  )
}