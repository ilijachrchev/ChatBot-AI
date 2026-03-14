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
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-page)] to-[var(--bg-page)] dark:from-[var(--bg-page)] dark:to-[var(--bg-page)] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
        
        <div className="relative flex items-center gap-3 p-5 rounded-xl border-2 border-[var(--border-default)] bg-[var(--bg-page)] transition-all duration-300">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--bg-card)] flex-shrink-0">
            <Lock className="h-5 w-5 text-[var(--text-secondary)]" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Domain Name
              </p>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                LOCKED
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-bold text-[var(--text-primary)] truncate">
                {name}
              </p>
              <ExternalLink className="h-4 w-4 text-[var(--text-muted)] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-4 rounded-lg bg-[var(--warning)] dark:bg-[var(--warning)] border border-[var(--warning)] dark:border-[var(--warning)]">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--warning)] dark:bg-[var(--warning)] flex-shrink-0 mt-0.5">
          <span className="text-xs font-bold text-[var(--warning)] dark:text-[var(--warning)]">!</span>
        </div>
        <p className="text-xs text-[var(--warning)] dark:text-[var(--warning)] leading-relaxed">
          <span className="font-bold">Security Notice:</span> Domain changes require verification. Contact support to update your domain name.
        </p>
      </div>
    </div>
  )
}