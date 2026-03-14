'use client'

import { useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { onGetSupportTickets, onUpdateTicketStatus } from '@/actions/conversation'
import { Headphones, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Ticket = {
  id: string
  ticketStatus: string
  createdAt: Date
  updatedAt: Date
  Customer: { email: string | null } | null
  message: Array<{ message: string; createdAt: Date }>
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  OPEN: { label: 'Open', className: 'bg-[var(--danger)] dark:bg-[var(--danger)] text-[var(--danger)] dark:text-[var(--danger)] border-[var(--danger)] dark:border-[var(--danger)]' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-[var(--warning)] dark:bg-[var(--warning)] text-[var(--warning)] dark:text-[var(--warning)] border-[var(--warning)] dark:border-[var(--warning)]' },
  RESOLVED: { label: 'Resolved', className: 'bg-[var(--success)] dark:bg-[var(--success)] text-[var(--success)] dark:text-[var(--success)] border-[var(--success)] dark:border-[var(--success)]' },
  ESCALATED: { label: 'Escalated', className: 'bg-[var(--primary-light)] text-[var(--primary)] border-[var(--border-strong)]' },
}

const PAGE_SIZE = 20

export default function SupportTicketsPage() {
  const searchParams = useSearchParams()
  const domainId = searchParams.get('domain') ?? ''

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [counts, setCounts] = useState({ open: 0, inProgress: 0, resolved: 0, escalated: 0 })
  const [filter, setFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!domainId) return
    setLoading(true)
    onGetSupportTickets(domainId).then(res => {
      setTickets(res.tickets as Ticket[])
      setCounts(res.counts)
      setLoading(false)
    })
  }, [domainId])

  const handleStatusChange = (ticketId: string, status: string) => {
    startTransition(async () => {
      await onUpdateTicketStatus(ticketId, status)
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ticketStatus: status } : t))
      setCounts(prev => {
        const old = tickets.find(t => t.id === ticketId)?.ticketStatus ?? 'OPEN'
        const next = { ...prev }
        if (old === 'OPEN') next.open--
        if (old === 'IN_PROGRESS') next.inProgress--
        if (old === 'RESOLVED') next.resolved--
        if (old === 'ESCALATED') next.escalated--
        if (status === 'OPEN') next.open++
        if (status === 'IN_PROGRESS') next.inProgress++
        if (status === 'RESOLVED') next.resolved++
        if (status === 'ESCALATED') next.escalated++
        return next
      })
    })
  }

  const filtered = tickets
    .filter(t => filter === 'ALL' || t.ticketStatus === filter)
    .filter(t => !search || (t.Customer?.email ?? '').toLowerCase().includes(search.toLowerCase()))

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = filtered.length > paginated.length

  if (!domainId) {
    return (
      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Headphones className="h-12 w-12 text-[var(--text-muted)] dark:text-[var(--text-secondary)]" />
        <p className="text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-center">
          No domain selected. Use the sidebar to navigate to a domain&apos;s support tickets.
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-[var(--text-primary)]">Support Tickets</h1>
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { label: 'Open', value: counts.open, color: 'text-[var(--danger)] dark:text-[var(--danger)]' },
            { label: 'In Progress', value: counts.inProgress, color: 'text-[var(--warning)] dark:text-[var(--warning)]' },
            { label: 'Resolved', value: counts.resolved, color: 'text-[var(--success)] dark:text-[var(--success)]' },
            { label: 'Escalated', value: counts.escalated, color: 'text-[var(--primary)]' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)]">
              <span className={cn('text-lg font-bold', stat.color)}>{stat.value}</span>
              <span className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'ESCALATED'].map(s => (
            <button
              key={s}
              onClick={() => { setFilter(s); setPage(1) }}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                filter === s
                  ? 'bg-[var(--primary)] text-white border-transparent'
                  : 'bg-[var(--bg-page)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-default)]'
              )}
            >
              {s === 'ALL' ? 'All' : s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by email..."
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-page)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--border-default)] dark:focus:border-[var(--border-default)]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border-default)] border-t-[var(--text-primary)]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Headphones className="h-10 w-10 text-[var(--text-muted)] dark:text-[var(--text-secondary)]" />
          <p className="text-[var(--text-muted)] dark:text-[var(--text-secondary)] text-sm">No support tickets yet</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-[var(--border-default)]">
          <div className="min-w-[680px] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_2fr_auto_auto_auto] gap-0 bg-[var(--bg-surface)] dark:bg-[var(--bg-page)]/50 border-b border-[var(--border-default)] px-4 py-3 text-xs font-bold text-[var(--text-secondary)] dark:text-[var(--text-secondary)] uppercase tracking-wider">
              <span>Customer</span>
              <span>Last Message</span>
              <span>Status</span>
              <span>Time</span>
              <span>Actions</span>
            </div>
            {paginated.map((ticket, i) => {
              const lastMsg = ticket.message[0]?.message ?? ''
              const cfg = STATUS_CONFIG[ticket.ticketStatus] ?? STATUS_CONFIG.OPEN
              return (
                <div
                  key={ticket.id}
                  className={cn(
                    'grid grid-cols-[1fr_2fr_auto_auto_auto] gap-0 items-center px-4 py-3 text-sm',
                    i % 2 === 0 ? 'bg-[var(--bg-page)]' : 'bg-[var(--bg-surface)]/50 dark:bg-[var(--bg-page)]/30',
                    'border-b border-[var(--border-default)]/50 last:border-0'
                  )}
                >
                  <span className="font-medium text-[var(--text-primary)] truncate pr-3">
                    {ticket.Customer?.email ?? 'Anonymous'}
                  </span>
                  <span className="text-[var(--text-secondary)] dark:text-[var(--text-secondary)] truncate pr-3">
                    {lastMsg.slice(0, 80)}{lastMsg.length > 80 ? '…' : ''}
                  </span>
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border mr-4', cfg.className)}>
                    {cfg.label}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] dark:text-[var(--text-secondary)] mr-4 whitespace-nowrap">
                    {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                  </span>
                  <div className="flex items-center gap-2">
                    <Select
                      value={ticket.ticketStatus}
                      onValueChange={v => handleStatusChange(ticket.id, v)}
                      disabled={isPending}
                    >
                      <SelectTrigger className="h-7 text-xs w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="ESCALATED">Escalated</SelectItem>
                      </SelectContent>
                    </Select>
                    <Link href={`/conversation/${ticket.id}`}>
                      <ExternalLink className="h-4 w-4 text-[var(--text-muted)] hover:text-[var(--text-secondary)] dark:hover:text-white transition-colors" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
          </div>
          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-2 text-sm font-semibold rounded-xl border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-all"
              >
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
