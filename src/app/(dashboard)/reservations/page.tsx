'use client'

import { useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { onGetDomainReservations, onUpdateReservationStatus } from '@/actions/reservations'
import { Utensils } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow, format, isToday } from 'date-fns'
import { Button } from '@/components/ui/button'

type Reservation = {
  id: string
  customerName: string
  email: string
  phone: string | null
  partySize: number
  date: Date
  timeSlot: string
  specialOccasion: string | null
  dietaryNotes: string | null
  seatingPref: string | null
  status: string
  createdAt: Date
}

type Stats = { today: number; thisWeek: number; pending: number; total: number }

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  PENDING: { label: 'Pending', className: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' },
  COMPLETED: { label: 'Completed', className: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700' },
}

type DateFilter = 'today' | 'week' | 'all'

export default function ReservationsPage() {
  const searchParams = useSearchParams()
  const domainId = searchParams.get('domain') ?? ''

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [stats, setStats] = useState<Stats>({ today: 0, thisWeek: 0, pending: 0, total: 0 })
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  const load = (filter: DateFilter = 'all') => {
    if (!domainId) return
    setLoading(true)
    onGetDomainReservations(domainId, filter).then(res => {
      setReservations(res.reservations as Reservation[])
      setStats(res.stats)
      setLoading(false)
    })
  }

  useEffect(() => { load(dateFilter) }, [domainId, dateFilter])

  const handleStatus = (id: string, status: string) => {
    startTransition(async () => {
      await onUpdateReservationStatus(id, status)
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    })
  }

  const todayReservations = reservations.filter(r => isToday(new Date(r.date)))

  if (!domainId) {
    return (
      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Utensils className="h-12 w-12 text-slate-300 dark:text-slate-700" />
        <p className="text-slate-500 dark:text-slate-400 text-center">
          No domain selected. Use the sidebar to navigate to a domain&apos;s reservations.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Reservations</h1>
        <div className="flex flex-wrap gap-3 mb-5">
          {[
            { label: "Today", value: stats.today, color: 'text-blue-600 dark:text-blue-400' },
            { label: "This Week", value: stats.thisWeek, color: 'text-purple-600 dark:text-purple-400' },
            { label: "Pending", value: stats.pending, color: 'text-amber-600 dark:text-amber-400' },
            { label: "Total", value: stats.total, color: 'text-slate-700 dark:text-slate-300' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className={cn('text-lg font-bold', stat.color)}>{stat.value}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {(['today', 'week', 'all'] as DateFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all',
                dateFilter === f
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400'
              )}
            >
              {f === 'today' ? 'Today' : f === 'week' ? 'This Week' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 dark:border-slate-700 border-t-slate-900 dark:border-t-white" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              {reservations.length} reservation{reservations.length !== 1 ? 's' : ''}
            </h2>
            {reservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <Utensils className="h-8 w-8 text-slate-300 dark:text-slate-700" />
                <p className="text-slate-400 dark:text-slate-600 text-sm">No reservations found</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Guest</span>
                  <span className="mr-4">Party</span>
                  <span className="mr-4">Date & Time</span>
                  <span className="mr-4">Status</span>
                  <span>Actions</span>
                </div>
                {reservations.map((r, i) => {
                  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING
                  return (
                    <div
                      key={r.id}
                      className={cn(
                        'grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 items-center px-4 py-3 text-sm',
                        i % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/30',
                        'border-b border-slate-100 dark:border-slate-800/50 last:border-0'
                      )}
                    >
                      <div className="min-w-0 pr-3">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{r.customerName}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{r.email}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mr-4">{r.partySize}</span>
                      <div className="mr-4 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{format(new Date(r.date), 'MMM d')}</p>
                        <p className="text-xs text-slate-400">{r.timeSlot}</p>
                      </div>
                      <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border mr-4', cfg.className)}>
                        {cfg.label}
                      </span>
                      <div className="flex gap-1.5">
                        {r.status === 'PENDING' && (
                          <Button
                            onClick={() => handleStatus(r.id, 'CONFIRMED')}
                            disabled={isPending}
                            size="sm"
                            className="h-7 text-[10px] px-2 bg-green-600 hover:bg-green-700 text-white"
                          >
                            Confirm
                          </Button>
                        )}
                        {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                          <Button
                            onClick={() => handleStatus(r.id, 'CANCELLED')}
                            disabled={isPending}
                            size="sm"
                            variant="ghost"
                            className="h-7 text-[10px] px-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                          >
                            Cancel
                          </Button>
                        )}
                        {r.status === 'CONFIRMED' && (
                          <Button
                            onClick={() => handleStatus(r.id, 'COMPLETED')}
                            disabled={isPending}
                            size="sm"
                            variant="outline"
                            className="h-7 text-[10px] px-2"
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Today&apos;s Bookings
            </h2>
            {todayReservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 dark:text-slate-600 text-sm text-center">No reservations today</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {todayReservations.map(r => {
                  const cfg = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.PENDING
                  return (
                    <div key={r.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{r.timeSlot}</span>
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border', cfg.className)}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{r.customerName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Party of {r.partySize}</p>
                      {r.specialOccasion && (
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">🎉 {r.specialOccasion}</p>
                      )}
                      {r.dietaryNotes && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">⚠️ {r.dietaryNotes}</p>
                      )}
                      {r.status === 'PENDING' && (
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => handleStatus(r.id, 'CONFIRMED')}
                            disabled={isPending}
                            size="sm"
                            className="flex-1 h-8 text-xs bg-green-600 hover:bg-green-700 text-white"
                          >
                            Confirm
                          </Button>
                          <Button
                            onClick={() => handleStatus(r.id, 'CANCELLED')}
                            disabled={isPending}
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs text-red-600 dark:text-red-400"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
