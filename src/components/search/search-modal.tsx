'use client'

import { useEffect, useRef, useState, useCallback, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Globe,
  MessageSquare,
  User,
  FileText,
  X,
  Loader2,
  LayoutDashboard,
  MessagesSquare,
  Users,
  Star,
  FlaskConical,
  Plug,
  Mail,
  Rocket,
  BookOpen,
  UserCircle,
  Shield,
  CreditCard,
  Bell,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { globalSearch } from '@/actions/search'
import { Skeleton } from '@/components/ui/skeleton'

type SearchResults = Awaited<ReturnType<typeof globalSearch>>

const PAGE_ICONS: Record<string, React.ReactNode> = {
  '/dashboard': <LayoutDashboard className="h-4 w-4 text-sky-500" />,
  '/conversations': <MessagesSquare className="h-4 w-4 text-violet-500" />,
  '/leads': <Users className="h-4 w-4 text-emerald-500" />,
  '/feedback': <Star className="h-4 w-4 text-amber-500" />,
  '/playground': <FlaskConical className="h-4 w-4 text-pink-500" />,
  '/integrations': <Plug className="h-4 w-4 text-orange-500" />,
  '/email-marketing': <Mail className="h-4 w-4 text-blue-500" />,
  '/getting-started': <Rocket className="h-4 w-4 text-rose-500" />,
  '/knowledge-base': <BookOpen className="h-4 w-4 text-teal-500" />,
  '/account': <UserCircle className="h-4 w-4 text-indigo-500" />,
  '/account/security': <Shield className="h-4 w-4 text-purple-500" />,
  '/billing': <CreditCard className="h-4 w-4 text-green-500" />,
  '/account/notifications': <Bell className="h-4 w-4 text-yellow-500" />,
  '/account/preferences': <Settings className="h-4 w-4 text-slate-500" />,
}

type FlatResult = {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  href: string
  category: string
}

function flattenResults(results: SearchResults): FlatResult[] {
  const flat: FlatResult[] = []

  for (const p of results.pages) {
    flat.push({
      id: `page-${p.path}`,
      title: p.title,
      subtitle: p.description,
      icon: PAGE_ICONS[p.path] ?? <LayoutDashboard className="h-4 w-4 text-muted-foreground" />,
      href: p.path,
      category: 'Pages',
    })
  }

  for (const d of results.domains) {
    flat.push({
      id: `domain-${d.id}`,
      title: d.name,
      subtitle: 'Domain',
      icon: <Globe className="h-4 w-4 text-blue-500" />,
      href: `/settings/${d.name.split('.')[0]}`,
      category: 'Domains',
    })
  }

  for (const c of results.conversations) {
    flat.push({
      id: `conv-${c.id}`,
      title: c.Customer?.email ?? 'Unknown visitor',
      subtitle: c.Domain?.name ?? 'Conversation',
      icon: <MessageSquare className="h-4 w-4 text-purple-500" />,
      href: `/conversations?chatroom=${c.id}`,
      category: 'Conversations',
    })
  }

  for (const l of results.leads) {
    flat.push({
      id: `lead-${l.id}`,
      title: l.email ?? 'Unknown lead',
      subtitle: l.Domain?.name ?? 'Lead',
      icon: <User className="h-4 w-4 text-emerald-500" />,
      href: `/leads`,
      category: 'Leads',
    })
  }

  for (const f of results.files) {
    flat.push({
      id: `file-${f.id}`,
      title: f.filename,
      subtitle: f.Domain?.name ? `${f.Domain.name} · ${f.fileType}` : f.fileType,
      icon: <FileText className="h-4 w-4 text-amber-500" />,
      href: f.domainId ? `/settings/${f.domainId}/knowledge-base` : `/knowledge-base`,
      category: 'Knowledge Base',
    })
  }

  return flat
}

type Props = {
  open: boolean
  onClose: () => void
}

export function SearchModal({ open, onClose }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({
    pages: [],
    domains: [],
    conversations: [],
    leads: [],
    files: [],
  })
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults({ pages: [], domains: [], conversations: [], leads: [], files: [] })
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const search = useCallback((q: string) => {
    if (q.length < 2) {
      setResults({ pages: [], domains: [], conversations: [], leads: [], files: [] })
      return
    }
    startTransition(async () => {
      const data = await globalSearch(q)
      setResults(data)
      setActiveIndex(0)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(val), 300)
  }

  const flat = flattenResults(results)
  const total = flat.length

  const navigate = (href: string) => {
    onClose()
    router.push(href)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, total - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && flat[activeIndex]) {
      navigate(flat[activeIndex].href)
    }
  }

  const categories = ['Pages', 'Domains', 'Conversations', 'Leads', 'Knowledge Base']
  const hasResults = total > 0
  const showEmpty = query.length >= 2 && !isPending && !hasResults

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div
        className={cn(
          'relative z-10 w-full max-w-2xl mx-4',
          'rounded-xl border border-border bg-background shadow-2xl',
          'flex flex-col overflow-hidden'
        )}
        onKeyDown={handleKeyDown}
      >
        <div className="flex items-center gap-3 px-4 border-b border-border">
          {isPending ? (
            <Loader2 className="h-4 w-4 shrink-0 text-muted-foreground animate-spin" />
          ) : (
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            placeholder="Search pages, domains, conversations, leads..."
            className={cn(
              'flex-1 h-14 bg-transparent text-sm text-foreground',
              'placeholder:text-muted-foreground focus:outline-none'
            )}
          />
          <button
            onClick={onClose}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {isPending && query.length >= 2 ? (
            <div className="p-3 space-y-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <Skeleton className="h-7 w-7 rounded-md shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-2/5" />
                    <Skeleton className="h-2.5 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : showEmpty ? (
            <div className="flex flex-col items-center justify-center gap-2 py-14">
              <Search className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm font-medium text-muted-foreground">No results found</p>
              <p className="text-xs text-muted-foreground/60">
                Try searching with a different term
              </p>
            </div>
          ) : hasResults ? (
            <div className="p-2">
              {categories.map((cat) => {
                const items = flat.filter((r) => r.category === cat)
                if (!items.length) return null
                return (
                  <div key={cat} className="mb-1">
                    <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {cat}
                    </p>
                    {items.map((item) => {
                      const globalIdx = flat.indexOf(item)
                      const isActive = globalIdx === activeIndex
                      return (
                        <button
                          key={item.id}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                          onClick={() => navigate(item.href)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                            isActive ? 'bg-muted' : 'hover:bg-muted/50'
                          )}
                        >
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                          </div>
                          {isActive && (
                            <kbd className="shrink-0 hidden sm:flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground">
                              ↵
                            </kbd>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-14">
              <Search className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">
                Type at least 2 characters to search
              </p>
            </div>
          )}
        </div>

        {hasResults && (
          <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[11px] text-muted-foreground/60">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1">↑</kbd>
              <kbd className="rounded border border-border bg-muted px-1">↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1">↵</kbd>
              open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1">esc</kbd>
              close
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
