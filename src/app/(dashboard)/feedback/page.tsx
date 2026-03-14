'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { onGetAllRatings } from '@/actions/ratings'
import InfoBar from '@/components/infobar'
import { cn } from '@/lib/utils'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type RatingItem = {
  id: string
  chatRoomId: string
  domainId: string
  domainName: string
  rating: string
  feedback: string | null
  createdAt: Date
}

const DOMAIN_COLORS = [
  'bg-[var(--primary-light)] text-[var(--text-primary)]',
  'bg-[var(--primary-light)] text-[var(--text-primary)]',
  'bg-[rgba(61,184,130,0.15)] text-[var(--success)]',
  'bg-[rgba(224,155,26,0.15)] text-[var(--warning)]',
  'bg-[rgba(224,85,85,0.15)] text-[var(--danger)]',
]

function getDomainColor(name: string): string {
  const code = (name || '').charCodeAt(0) || 0
  return DOMAIN_COLORS[code % 5]
}

function relativeTime(date: Date): string {
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

const PAGE_SIZE = 20

const FeedbackPage = () => {
  const [ratings, setRatings] = useState<RatingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [domainFilter, setDomainFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const fetchRatings = async () => {
      const data = await onGetAllRatings()
      setRatings(data as RatingItem[])
      setLoading(false)
    }
    fetchRatings()
  }, [])

  const domains = useMemo(() => {
    const map = new Map<string, string>()
    ratings.forEach((r) => map.set(r.domainId, r.domainName))
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [ratings])

  const filtered = useMemo(() => {
    if (domainFilter === 'all') return ratings
    return ratings.filter((r) => r.domainId === domainFilter)
  }, [ratings, domainFilter])

  const total = filtered.length
  const positive = filtered.filter((r) => r.rating === 'POSITIVE').length
  const negative = filtered.length - positive
  const satisfactionRate = total > 0 ? Math.round((positive / total) * 100) : 0
  const feedbackCount = filtered.filter((r) => r.rating === 'NEGATIVE' && r.feedback).length

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const statCards = [
    { label: 'Total Ratings', value: total },
    { label: `Satisfaction Rate`, value: total < 3 ? 'N/A' : `${satisfactionRate}%` },
    { label: 'Feedback Submissions', value: feedbackCount },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 border-b">
        <InfoBar />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Customer Feedback</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Negative ratings with customer comments
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {statCards.map((card) => (
              <div key={card.label} className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl p-4 space-y-1">
                <p className="text-2xl font-bold">{card.value}</p>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={domainFilter}
              onChange={(e) => { setDomainFilter(e.target.value); setPage(1) }}
              className="text-sm border border-[var(--border-default)] rounded-md px-3 py-1.5 bg-[var(--bg-card)] focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All domains</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground text-sm">
                Loading feedback...
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                <Star className="h-16 w-16 text-muted-foreground/30" />
                <p className="font-medium">No feedback yet</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Ratings will appear here once customers rate conversations
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  <div className="grid grid-cols-[110px_130px_80px_1fr_90px] gap-3 px-4 py-2.5 border-b text-xs font-medium text-muted-foreground bg-[var(--bg-surface)]">
                    <span>Date</span>
                    <span>Domain</span>
                    <span>Rating</span>
                    <span>Feedback</span>
                    <span>Actions</span>
                  </div>

                  {paginated.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[110px_130px_80px_1fr_90px] gap-3 px-4 py-3.5 border-b last:border-0 hover:bg-[var(--primary-light)] items-start transition-all duration-150"
                    >
                      <span className="text-xs text-muted-foreground pt-0.5">
                        {relativeTime(item.createdAt)}
                      </span>

                      <div>
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', getDomainColor(item.domainName))}>
                          {item.domainName}
                        </span>
                      </div>

                      <div>
                        {item.rating === 'POSITIVE' ? (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[rgba(61,184,130,0.15)] text-[var(--success)]">
                            👍 Yes
                          </span>
                        ) : (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[rgba(224,85,85,0.15)] text-[var(--danger)]">
                            👎 No
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.feedback ?? <span className="italic opacity-50">No comment</span>}
                      </p>

                      <Link
                        href="/conversation"
                        className="text-xs text-[var(--primary)] hover:text-[var(--primary)] hover:underline whitespace-nowrap pt-0.5"
                      >
                        View chat →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} entries
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
                <span className="text-xs">Page {page} of {totalPages}</span>
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

export default FeedbackPage
