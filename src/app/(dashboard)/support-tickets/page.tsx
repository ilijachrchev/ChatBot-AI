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
  OPEN: { label: 'Open', className: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' },
  IN_PROGRESS: { label: 'In Progress', className: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  RESOLVED: { label: 'Resolved', className: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' },
  ESCALATED: { label: 'Escalated', className: 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
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
        <Headphones className="h-12 w-12 text-slate-300 dark:text-slate-700" />
        <p className="text-slate-500 dark:text-slate-400 text-center">
          No domain selected. Use the sidebar to navigate to a domain&apos;s support tickets.
        </p>
      </div>
    )
  }

  return (
    <div className="px-4 py-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-3xl font-bold text-slate-900 dark:text-white">Support Tickets</h1>
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { label: 'Open', value: counts.open, color: 'text-red-600 dark:text-red-400' },
            { label: 'In Progress', value: counts.inProgress, color: 'text-amber-600 dark:text-amber-400' },
            { label: 'Resolved', value: counts.resolved, color: 'text-green-600 dark:text-green-400' },
            { label: 'Escalated', value: counts.escalated, color: 'text-purple-600 dark:text-purple-400' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className={cn('text-lg font-bold', stat.color)}>{stat.value}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</span>
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
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400'
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
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-slate-400 dark:focus:border-slate-600"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-slate-900 dark:border-t-white" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Headphones className="h-10 w-10 text-slate-300 dark:text-slate-700" />
          <p className="text-slate-400 dark:text-slate-600 text-sm">No support tickets yet</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="min-w-[680px] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_2fr_auto_auto_auto] gap-0 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                    i % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/30',
                    'border-b border-slate-100 dark:border-slate-800/50 last:border-0'
                  )}
                >
                  <span className="font-medium text-slate-900 dark:text-white truncate pr-3">
                    {ticket.Customer?.email ?? 'Anonymous'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 truncate pr-3">
                    {lastMsg.slice(0, 80)}{lastMsg.length > 80 ? '…' : ''}
                  </span>
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border mr-4', cfg.className)}>
                    {cfg.label}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-600 mr-4 whitespace-nowrap">
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
                      <ExternalLink className="h-4 w-4 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
          </div>
          </div>
          {hasMore && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-6 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
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
