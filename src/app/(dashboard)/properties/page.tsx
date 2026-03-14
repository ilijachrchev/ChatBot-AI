'use client'

import { useEffect, useState, useTransition } from 'react'
import { useSearchParams } from 'next/navigation'
import { onGetDomainProperties, onCreateProperty, onUpdateProperty, onDeleteProperty } from '@/actions/properties'
import { Home, Plus, Pencil, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type Property = {
  id: string
  title: string
  description: string | null
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  location: string | null
  propertyType: string
  status: string
  imageUrl: string | null
  createdAt: Date
}

type FormData = {
  title: string
  description: string
  price: string
  bedrooms: string
  bathrooms: string
  location: string
  propertyType: string
  status: string
  imageUrl: string
}

const EMPTY_FORM: FormData = {
  title: '', description: '', price: '', bedrooms: '', bathrooms: '',
  location: '', propertyType: 'HOUSE', status: 'AVAILABLE', imageUrl: '',
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  AVAILABLE: { label: 'Available', className: 'bg-[var(--success)] dark:bg-[var(--success)] text-[var(--success)] dark:text-[var(--success)] border-[var(--success)] dark:border-[var(--success)]' },
  UNDER_OFFER: { label: 'Under Offer', className: 'bg-[var(--warning)] dark:bg-[var(--warning)] text-[var(--warning)] dark:text-[var(--warning)] border-[var(--warning)] dark:border-[var(--warning)]' },
  SOLD: { label: 'Sold', className: 'bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] dark:border-[var(--border-strong)]' },
}

const TYPE_CONFIG: Record<string, string> = {
  HOUSE: 'House', APARTMENT: 'Apartment', CONDO: 'Condo', COMMERCIAL: 'Commercial',
}

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const domainId = searchParams.get('domain') ?? ''

  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<FormData>(EMPTY_FORM)
  const [isPending, startTransition] = useTransition()

  const load = () => {
    if (!domainId) return
    setLoading(true)
    onGetDomainProperties(domainId).then(res => {
      setProperties(res.properties as Property[])
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [domainId])

  const openCreate = () => { setForm(EMPTY_FORM); setEditingId(null); setSheetOpen(true) }
  const openEdit = (p: Property) => {
    setForm({
      title: p.title,
      description: p.description ?? '',
      price: p.price?.toString() ?? '',
      bedrooms: p.bedrooms?.toString() ?? '',
      bathrooms: p.bathrooms?.toString() ?? '',
      location: p.location ?? '',
      propertyType: p.propertyType,
      status: p.status,
      imageUrl: p.imageUrl ?? '',
    })
    setEditingId(p.id)
    setSheetOpen(true)
  }

  const handleSave = () => {
    startTransition(async () => {
      const data = {
        title: form.title,
        description: form.description || null,
        price: form.price ? parseInt(form.price) : null,
        bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
        bathrooms: form.bathrooms ? parseInt(form.bathrooms) : null,
        location: form.location || null,
        propertyType: form.propertyType,
        status: form.status,
        imageUrl: form.imageUrl || null,
      }
      if (editingId) {
        await onUpdateProperty(editingId, data)
      } else {
        await onCreateProperty(domainId, data)
      }
      setSheetOpen(false)
      load()
    })
  }

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await onDeleteProperty(id)
      setDeleteId(null)
      load()
    })
  }

  const available = properties.filter(p => p.status === 'AVAILABLE').length
  const underOffer = properties.filter(p => p.status === 'UNDER_OFFER').length
  const sold = properties.filter(p => p.status === 'SOLD').length

  if (!domainId) {
    return (
      <div className="p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Home className="h-12 w-12 text-[var(--text-muted)] dark:text-[var(--text-secondary)]" />
        <p className="text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-center">
          No domain selected. Use the sidebar to navigate to a domain&apos;s properties.
        </p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Properties</h1>
          <div className="flex flex-wrap gap-3 mt-3">
            {[
              { label: 'Total', value: properties.length, color: 'text-[var(--text-secondary)]' },
              { label: 'Available', value: available, color: 'text-[var(--success)] dark:text-[var(--success)]' },
              { label: 'Under Offer', value: underOffer, color: 'text-[var(--warning)] dark:text-[var(--warning)]' },
              { label: 'Sold', value: sold, color: 'text-[var(--text-muted)]' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-page)] border border-[var(--border-default)]">
                <span className={cn('text-lg font-bold', stat.color)}>{stat.value}</span>
                <span className="text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <Button onClick={openCreate} className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Property
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--border-default)] border-t-[var(--text-primary)]" />
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Home className="h-12 w-12 text-[var(--text-muted)] dark:text-[var(--text-secondary)]" />
          <p className="text-[var(--text-muted)] dark:text-[var(--text-secondary)] text-sm">No properties listed yet</p>
          <Button onClick={openCreate} variant="outline">Add your first property</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {properties.map(p => {
            const statusCfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.AVAILABLE
            return (
              <div key={p.id} className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-page)] overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-36 bg-gradient-to-br from-[var(--bg-page)] to-[var(--bg-page)] dark:from-[var(--bg-page)] dark:to-[var(--bg-page)] relative overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Home className="h-10 w-10 text-[var(--text-muted)] dark:text-[var(--text-secondary)]" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border', statusCfg.className)}>
                      {statusCfg.label}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 dark:bg-[var(--bg-page)]/90 text-[var(--text-secondary)] border border-[var(--border-default)] dark:border-[var(--border-strong)]">
                      {TYPE_CONFIG[p.propertyType] ?? p.propertyType}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-[var(--text-primary)] text-sm mb-0.5 truncate">{p.title}</h3>
                  {p.location && <p className="text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)] mb-2 truncate">{p.location}</p>}
                  {p.price && (
                    <p className="text-lg font-bold text-[var(--text-primary)] mb-2">
                      ${p.price.toLocaleString()}
                    </p>
                  )}
                  <div className="flex gap-2 mb-3">
                    {p.bedrooms && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] text-[var(--text-secondary)]">
                        {p.bedrooms} bd
                      </span>
                    )}
                    {p.bathrooms && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] text-[var(--text-secondary)]">
                        {p.bathrooms} ba
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => openEdit(p)} variant="outline" size="sm" className="flex-1 h-8 text-xs">
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button onClick={() => setDeleteId(p.id)} variant="ghost" size="sm" className="h-8 text-xs text-[var(--danger)] dark:text-[var(--danger)] hover:bg-[var(--danger)] dark:hover:bg-[var(--danger)]">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingId ? 'Edit Property' : 'Add Property'}</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 mt-6">
            {[
              { label: 'Title *', key: 'title', type: 'text', placeholder: 'e.g. Modern 3-bed House' },
              { label: 'Location', key: 'location', type: 'text', placeholder: 'e.g. Austin, TX' },
              { label: 'Price ($)', key: 'price', type: 'number', placeholder: '0' },
              { label: 'Bedrooms', key: 'bedrooms', type: 'number', placeholder: '0' },
              { label: 'Bathrooms', key: 'bathrooms', type: 'number', placeholder: '0' },
              { label: 'Image URL', key: 'imageUrl', type: 'text', placeholder: 'https://...' },
            ].map(field => (
              <div key={field.key} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">{field.label}</label>
                <input
                  type={field.type}
                  value={form[field.key as keyof FormData]}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] dark:border-[var(--border-strong)] bg-[var(--bg-page)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--border-default)] dark:focus:border-[var(--border-default)]"
                />
              </div>
            ))}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)]">Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Property description..."
                rows={3}
                className="px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] dark:border-[var(--border-strong)] bg-[var(--bg-page)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none focus:border-[var(--border-default)] dark:focus:border-[var(--border-default)] resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Type</label>
                <select
                  value={form.propertyType}
                  onChange={e => setForm(f => ({ ...f, propertyType: e.target.value }))}
                  className="px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] dark:border-[var(--border-strong)] bg-[var(--bg-page)] text-[var(--text-primary)] outline-none"
                >
                  <option value="HOUSE">House</option>
                  <option value="APARTMENT">Apartment</option>
                  <option value="CONDO">Condo</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] dark:border-[var(--border-strong)] bg-[var(--bg-page)] text-[var(--text-primary)] outline-none"
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="UNDER_OFFER">Under Offer</option>
                  <option value="SOLD">Sold</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSave}
                disabled={!form.title.trim() || isPending}
                className="flex-1 bg-[var(--primary)] text-white"
              >
                {isPending ? 'Saving...' : editingId ? 'Update Property' : 'Add Property'}
              </Button>
              <Button onClick={() => setSheetOpen(false)} variant="outline" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-[var(--text-secondary)]">This action cannot be undone.</p>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={isPending}
              className="bg-[var(--danger)] hover:bg-[var(--danger)] text-white"
            >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
