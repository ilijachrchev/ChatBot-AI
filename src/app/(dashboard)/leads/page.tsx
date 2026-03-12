"use client"
import React, { useEffect, useState, useMemo } from 'react'
import { onGetAllLeads, LeadItem } from '@/actions/leads'
import { downloadCSV } from '@/lib/csv'
import { Download, MessageSquare, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import InfoBar from '@/components/infobar'

export const dynamic = 'force-dynamic'

const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
]

const DOMAIN_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
]

function getAvatarColor(email: string): string {
  const code = (email || '').charCodeAt(0) || 0
  return AVATAR_COLORS[code % 5]
}

function getDomainColor(name: string): string {
  const code = (name || '').charCodeAt(0) || 0
  return DOMAIN_COLORS[code % 5]
}

function relativeTime(date: Date | null): string {
  if (!date) return 'Never'
  const ms = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(ms / 60000)
  const hours = Math.floor(ms / 3600000)
  const days = Math.floor(ms / 86400000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDate(date: Date | null): string {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const PAGE_SIZE = 25

type DateRange = '7d' | '30d' | '90d' | 'all'
const DATE_RANGES: { label: string; value: DateRange }[] = [
  { label: 'Last 7 days', value: '7d' },
  { label: 'Last 30 days', value: '30d' },
  { label: 'Last 90 days', value: '90d' },
  { label: 'All time', value: 'all' },
]

const LeadsPage = () => {
  const [leads, setLeads] = useState<LeadItem[]>([])
  const [loading, setLoading] = useState(true)
  const [domainFilter, setDomainFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchLeads = async () => {
      const result = await onGetAllLeads()
      setLeads(result)
      setLoading(false)
    }
    fetchLeads()
  }, [])

  const domains = useMemo(() => {
    const map = new Map<string, string>()
    leads.forEach((l) => map.set(l.domainId, l.domainName))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [leads])

  const stats = useMemo(() => {
    const now = Date.now()
    const week = 7 * 24 * 60 * 60 * 1000
    const day = 24 * 60 * 60 * 1000
    const total = leads.length
    const newThisWeek = leads.filter(
      (l) => l.firstSeen && now - new Date(l.firstSeen).getTime() < week
    ).length
    const activeConversations = leads.filter(
      (l) => l.lastMessageDate && now - new Date(l.lastMessageDate).getTime() < day
    ).length
    const totalConvs = leads.reduce((s, l) => s + l.conversationCount, 0)
    const avgConversations = total > 0 ? (totalConvs / total).toFixed(1) : '0'
    return { total, newThisWeek, activeConversations, avgConversations }
  }, [leads])

  const filteredLeads = useMemo(() => {
    let result = [...leads]

    if (domainFilter !== 'all') {
      result = result.filter((l) => l.domainId === domainFilter)
    }

    if (dateRange !== 'all') {
      const days = { '7d': 7, '30d': 30, '90d': 90 }[dateRange]
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
      result = result.filter(
        (l) => l.lastMessageDate && new Date(l.lastMessageDate).getTime() > cutoff
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((l) => l.email?.toLowerCase().includes(q))
    }

    return result
  }, [leads, domainFilter, dateRange, searchQuery])

  const totalPages = Math.ceil(filteredLeads.length / PAGE_SIZE)
  const paginatedLeads = filteredLeads.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedLeads.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedLeads.map((l) => l.id)))
    }
  }

  const handleExportAll = () => {
    const data = filteredLeads.map((l) => ({
      Email: l.email ?? '',
      Domain: l.domainName,
      Conversations: l.conversationCount,
      'Last Message': l.lastMessage ?? '',
      'Last Activity': l.lastMessageDate ? new Date(l.lastMessageDate).toISOString() : '',
      'First Seen': l.firstSeen ? new Date(l.firstSeen).toISOString() : '',
    }))
    const date = new Date().toISOString().split('T')[0]
    downloadCSV(data, `sendwise-leads-${date}.csv`)
  }

  const handleExportSelected = () => {
    const data = filteredLeads
      .filter((l) => selectedIds.has(l.id))
      .map((l) => ({
        Email: l.email ?? '',
        Domain: l.domainName,
        Conversations: l.conversationCount,
        'Last Message': l.lastMessage ?? '',
        'Last Activity': l.lastMessageDate ? new Date(l.lastMessageDate).toISOString() : '',
        'First Seen': l.firstSeen ? new Date(l.firstSeen).toISOString() : '',
      }))
    const date = new Date().toISOString().split('T')[0]
    downloadCSV(data, `sendwise-leads-selected-${date}.csv`)
  }

  const statCards = [
    { label: 'Total Leads', value: stats.total },
    { label: 'New This Week', value: stats.newThisWeek },
    { label: 'Active Today', value: stats.activeConversations },
    { label: 'Avg Conversations', value: stats.avgConversations },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 border-b">
        <InfoBar />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Leads</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                All customers who have interacted with your chatbots
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground px-3 py-1.5 rounded-full bg-muted">
                {stats.total} total leads
              </span>
              <Button variant="outline" size="sm" onClick={handleExportAll} className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-background border rounded-xl p-4 space-y-1"
              >
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={domainFilter}
              onChange={(e) => { setDomainFilter(e.target.value); setPage(1) }}
              className="text-sm border rounded-md px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All domains</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <div className="flex items-center gap-1 flex-wrap">
              {DATE_RANGES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setDateRange(r.value); setPage(1) }}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full border transition-all duration-150',
                    dateRange === r.value
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-muted-foreground hover:border-foreground/50'
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <Input
              className="h-8 w-full sm:w-56 text-sm"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
            />
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 px-4 py-2 bg-muted rounded-lg">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <Button variant="outline" size="sm" onClick={handleExportSelected} className="h-7 text-xs gap-1">
                <Download className="h-3 w-3" />
                Export selected
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="h-7 text-xs text-muted-foreground"
              >
                Clear
              </Button>
            </div>
          )}

          <div className="bg-background border rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                Loading leads...
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground/30" />
                <p className="font-medium">No leads yet</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Leads appear here when visitors interact with your chatbots
                </p>
                <Link href="/conversation" className="text-sm text-indigo-500 hover:underline mt-1">
                  Go to Conversations →
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[860px]">
                  <div className="grid grid-cols-[24px_1fr_140px_72px_2fr_110px_110px_90px] gap-3 px-4 py-2.5 border-b text-xs font-medium text-muted-foreground bg-muted/40">
                    <input
                      type="checkbox"
                      className="mt-0.5"
                      checked={selectedIds.size === paginatedLeads.length && paginatedLeads.length > 0}
                      onChange={toggleSelectAll}
                    />
                    <span>Email</span>
                    <span>Domain</span>
                    <span>Convs</span>
                    <span>Last Message</span>
                    <span>Last Activity</span>
                    <span>First Seen</span>
                    <span>Actions</span>
                  </div>

                  {paginatedLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="grid grid-cols-[24px_1fr_140px_72px_2fr_110px_110px_90px] gap-3 px-4 py-3.5 border-b last:border-0 hover:bg-muted/30 items-center transition-all duration-150"
                    >
                      <input
                        type="checkbox"
                        checked={selectedIds.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                      />

                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0',
                            getAvatarColor(lead.email ?? '')
                          )}
                        >
                          {(lead.email ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium truncate">
                          {lead.email ?? 'Anonymous'}
                        </span>
                      </div>

                      <div>
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded-full',
                            getDomainColor(lead.domainName)
                          )}
                        >
                          {lead.domainName}
                        </span>
                      </div>

                      <div>
                        <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded-full">
                          {lead.conversationCount}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground truncate">
                        {lead.lastMessage
                          ? lead.lastMessage.substring(0, 40) +
                            (lead.lastMessage.length > 40 ? '...' : '')
                          : '—'}
                      </p>

                      <span className="text-xs text-muted-foreground">
                        {relativeTime(lead.lastMessageDate)}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {formatDate(lead.firstSeen)}
                      </span>

                      <Link
                        href="/conversation"
                        className="text-xs text-indigo-500 hover:text-blue-700 hover:underline whitespace-nowrap"
                      >
                        View chat →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!loading && filteredLeads.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filteredLeads.length)} of {filteredLeads.length} leads
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LeadsPage
