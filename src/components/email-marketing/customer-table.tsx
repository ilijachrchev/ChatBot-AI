'use client'
import React from 'react'
import { DataTable } from '../table'
import { EMAIL_MARKETING_HEADER } from '@/constants/menu'
import { TableCell, TableRow } from '../ui/table'
import { Card } from '../ui/card'
import { cn } from '@/lib/utils'
import { SideSheet } from '../sheet'
import Answers from './answers'
import { Eye, CheckCircle2, Circle, Globe } from 'lucide-react'

type CustomerTableProps = {
  domains: {
    customer: {
      Domain: {
        name: string
      } | null
      id: string
      email: string | null
    }[]
  }[]
  onSelect(email: string): void
  select: string[]
  onId(id: string): void
  id?: string
}

export const CustomerTable = ({
  domains,
  onSelect,
  select,
  onId,
  id,
}: CustomerTableProps) => {
  return (
    <DataTable headers={EMAIL_MARKETING_HEADER}>
      {domains.map((domain) =>
        domain.customer.map((c) => (
          <TableRow
            key={c.id}
            className={cn(
              'transition-all duration-200',
              'hover:bg-[var(--bg-hover)]',
              select.includes(c.email as string) && 'bg-slate-100 dark:bg-[var(--bg-hover)]'
            )}
          >
            <TableCell>
              <button
                onClick={() => onSelect(c.email as string)}
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200',
                  select.includes(c.email as string)
                    ? 'bg-indigo-500 border-indigo-500 text-white'
                    : 'border-[var(--border-strong)] hover:border-slate-500 dark:hover:border-slate-500'
                )}
              >
                {select.includes(c.email as string) && (
                  <CheckCircle2 className="h-4 w-4" />
                )}
              </button>
            </TableCell>

            <TableCell className="font-medium text-slate-950 dark:text-[var(--text-primary)]">
              {c.email}
            </TableCell>

            <TableCell>
              <SideSheet
                title="Customer Answers"
                description="View responses collected by the bot from customer interactions."
                trigger={
                  <div
                    className={cn(
                      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer',
                      'text-sm font-medium transition-all duration-200',
                      'bg-slate-100 dark:bg-[var(--bg-surface)]',
                      'hover:bg-slate-200 dark:hover:bg-[var(--bg-active)]',
                      'text-[var(--text-secondary)]',
                      'hover:text-slate-900 dark:hover:text-white',
                      'border border-[var(--border-default)] dark:border-[var(--border-strong)]',
                      'hover:border-slate-400 dark:hover:border-slate-500'
                    )}
                    onClick={() => onId(c.id)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </div>
                }
              >
                <Answers id={id} />
              </SideSheet>
            </TableCell>

            <TableCell className="text-right">
              {c.Domain?.name ? (
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-[var(--bg-surface)] text-sm text-[var(--text-secondary)]">
                  <Globe className="h-3.5 w-3.5" />
                  {c.Domain.name}
                </div>
              ) : (
                <span className="text-sm text-slate-400 dark:text-[var(--text-secondary)]">
                  No domain
                </span>
              )}
            </TableCell>
          </TableRow>
        ))
      )}
    </DataTable>
  )
}