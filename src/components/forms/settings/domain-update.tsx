import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import { Lock } from 'lucide-react'

type DomainUpdateProps = {
  name: string
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
}

export const DomainUpdate = ({ name, register, errors }: DomainUpdateProps) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <Lock className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Domain Name (Locked)</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{name}</p>
        </div>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Contact support to change your domain name
      </p>
    </div>
  )
}