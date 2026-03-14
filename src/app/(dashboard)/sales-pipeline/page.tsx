import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { GripVertical, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

export const dynamic = 'force-dynamic'

const STAGES = [
  { key: 'NEW', label: 'New', color: 'border-[var(--border-strong)]', headerColor: 'bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] text-[var(--text-secondary)]' },
  { key: 'CONTACTED', label: 'Contacted', color: 'border-[var(--primary)] dark:border-[var(--border-accent)]', headerColor: 'bg-[var(--primary)] dark:bg-[var(--primary)] text-[var(--primary)] dark:text-[var(--primary)]' },
  { key: 'QUALIFIED', label: 'Qualified', color: 'border-[var(--warning)] dark:border-[var(--warning)]', headerColor: 'bg-[var(--warning)] dark:bg-[var(--warning)] text-[var(--warning)] dark:text-[var(--warning)]' },
  { key: 'PROPOSAL', label: 'Proposal', color: 'border-[var(--border-strong)]', headerColor: 'bg-[var(--primary-light)] text-[var(--primary)]' },
  { key: 'CLOSED', label: 'Closed', color: 'border-[var(--success)] dark:border-[var(--success)]', headerColor: 'bg-[var(--success)] dark:bg-[var(--success)] text-[var(--success)] dark:text-[var(--success)]' },
]

type Props = {
  searchParams: Promise<{ domain?: string }>
}

export default async function SalesPipelinePage({ searchParams }: Props) {
  const { domain: domainId } = await searchParams
  const user = await currentUser()
  if (!user) return null

  const dbUser = await client.user.findUnique({
    where: { clerkId: user.id },
    select: {
      domains: {
        select: {
          id: true,
          name: true,
          chatBot: { select: { persona: true } },
        },
      },
    },
  })

  const salesDomains = dbUser?.domains.filter(d => d.chatBot?.persona === 'SALES_AGENT') ?? []

  if (!domainId) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Sales Pipeline</h1>
        <p className="text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mb-8">Select a domain to view its pipeline.</p>
        <div className="flex flex-col gap-3">
          {salesDomains.map(d => (
            <Link
              key={d.id}
              href={`/sales-pipeline?domain=${d.id}`}
              className="flex items-center justify-between p-4 rounded-xl border-2 border-[var(--border-default)] hover:border-[var(--border-default)] bg-[var(--bg-page)] transition-all"
            >
              <span className="font-semibold text-[var(--text-primary)]">{d.name}</span>
              <ExternalLink className="h-4 w-4 text-[var(--text-muted)]" />
            </Link>
          ))}
          {salesDomains.length === 0 && (
            <p className="text-[var(--text-muted)] dark:text-[var(--text-muted)] text-sm">No domains with Sales Agent persona found.</p>
          )}
        </div>
      </div>
    )
  }

  const domain = await client.domain.findUnique({
    where: { id: domainId },
    select: { name: true },
  })

  const customers = await (client as any).customer.findMany({
    where: { domainId },
    select: {
      id: true,
      email: true,
      salesStage: true,
      chatRoom: {
        orderBy: { updatedAt: 'desc' },
        take: 1,
        select: {
          id: true,
          updatedAt: true,
          message: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { message: true },
          },
        },
      },
    },
    orderBy: { chatRoom: { _count: 'desc' } },
  }) as Array<{
    id: string
    email: string | null
    salesStage: string
    chatRoom: Array<{ id: string; updatedAt: Date; message: Array<{ message: string }> }>
  }>

  const grouped = STAGES.reduce<Record<string, typeof customers>>((acc, s) => {
    acc[s.key] = customers.filter(c => (c.salesStage ?? 'NEW') === s.key)
    return acc
  }, {})

  return (
    <div className="px-4 py-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-[var(--text-primary)]">Sales Pipeline</h1>
          <div className="flex items-center gap-3 mt-1">
            {domain && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[var(--primary)] dark:bg-[var(--primary)] text-[var(--primary)] dark:text-[var(--primary)] border border-[var(--primary)] dark:border-[var(--border-accent)]">
                {domain.name}
              </span>
            )}
            <span className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">{customers.length} leads total</span>
          </div>
        </div>
        {salesDomains.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {salesDomains.map(d => (
              <Link
                key={d.id}
                href={`/sales-pipeline?domain=${d.id}`}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-lg border font-medium transition-all',
                  d.id === domainId
                    ? 'bg-[var(--primary)] text-white border-[var(--border-strong)] dark:border-white'
                    : 'border-[var(--border-default)] dark:border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--border-default)]'
                )}
              >
                {d.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => {
          const leads = grouped[stage.key] ?? []
          return (
            <div key={stage.key} className="flex-shrink-0 w-72">
              <div className={cn('flex items-center justify-between px-3 py-2 rounded-xl mb-3', stage.headerColor)}>
                <span className="text-sm font-bold uppercase tracking-wide">{stage.label}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/20">
                  {leads.length}
                </span>
              </div>

              <div className={cn('rounded-xl border-2 min-h-[200px] p-2 flex flex-col gap-2', stage.color, 'bg-[var(--bg-surface)]/50 dark:bg-[var(--bg-page)]/30')}>
                {leads.length === 0 && (
                  <div className="flex-1 flex items-center justify-center border-2 border-dashed border-[var(--border-default)] rounded-lg p-6">
                    <span className="text-xs text-[var(--text-muted)] dark:text-[var(--text-secondary)] text-center">No leads in this stage</span>
                  </div>
                )}
                {leads.map(lead => {
                  const room = lead.chatRoom[0]
                  const lastMsg = room?.message[0]?.message ?? ''
                  return (
                    <div
                      key={lead.id}
                      className="bg-[var(--bg-page)] rounded-lg border border-[var(--border-default)] p-3 flex flex-col gap-1.5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                          {lead.email ?? 'Anonymous'}
                        </span>
                        <GripVertical className="h-4 w-4 text-[var(--text-muted)] dark:text-[var(--text-secondary)] flex-shrink-0" />
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] line-clamp-2">
                          {lastMsg.slice(0, 60)}{lastMsg.length > 60 ? '…' : ''}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-1">
                        {room?.updatedAt && (
                          <span className="text-[10px] text-[var(--text-muted)] dark:text-[var(--text-secondary)]">
                            {formatDistanceToNow(new Date(room.updatedAt), { addSuffix: true })}
                          </span>
                        )}
                        {room && (
                          <Link
                            href={`/conversation/${room.id}`}
                            className="text-[10px] font-semibold text-[var(--text-accent)] hover:underline flex items-center gap-0.5"
                          >
                            View <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
