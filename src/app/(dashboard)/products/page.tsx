'use client'

import {
  onCreateNewDomainProduct,
  onDeleteDomainProduct,
  onGetDomainName,
  onGetDomainProducts,
  onUpdateDomainProduct,
} from '@/actions/settings'
import InfoBar from '@/components/infobar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { Edit2, Package, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { toast } from 'sonner'

type Product = {
  id: string
  name: string
  price: number
  image: string
  description: string | null
  status: string
  createdAt: Date
  domainId: string | null
}

type FormState = {
  name: string
  description: string
  price: string
  image: string
  status: string
}

const DEFAULT_FORM: FormState = {
  name: '',
  description: '',
  price: '',
  image: '',
  status: 'ACTIVE',
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const domainId = searchParams.get('domain') ?? ''

  const [products, setProducts] = useState<Product[]>([])
  const [domainName, setDomainName] = useState('')
  const [loading, setLoading] = useState(true)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)

  useEffect(() => {
    if (!domainId) {
      setLoading(false)
      return
    }
    loadProducts()
  }, [domainId])

  async function loadProducts() {
    setLoading(true)
    const [data, name] = await Promise.all([
      onGetDomainProducts(domainId),
      onGetDomainName(domainId),
    ])
    setProducts((data as Product[]) ?? [])
    setDomainName(name)
    setLoading(false)
  }

  function openAdd() {
    setEditProduct(null)
    setForm(DEFAULT_FORM)
    setSheetOpen(true)
  }

  function openEdit(product: Product) {
    setEditProduct(product)
    setForm({
      name: product.name,
      description: product.description ?? '',
      price: (product.price / 100).toFixed(2),
      image: product.image ?? '',
      status: product.status,
    })
    setSheetOpen(true)
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Product name is required')
      return
    }
    const priceInCents = Math.round(parseFloat(form.price || '0') * 100)
    setSaving(true)
    try {
      if (editProduct) {
        const res = await onUpdateDomainProduct(editProduct.id, {
          name: form.name,
          description: form.description || undefined,
          price: priceInCents,
          image: form.image || undefined,
          status: form.status,
        })
        if (res?.status === 200) {
          toast.success('Product updated')
          setSheetOpen(false)
          await loadProducts()
        } else {
          toast.error(res?.message ?? 'Failed to update')
        }
      } else {
        const res = await onCreateNewDomainProduct(
          domainId,
          form.name,
          form.image || '',
          String(priceInCents)
        )
        if (res?.status === 200) {
          if (form.description || form.status !== 'ACTIVE') {
            const fresh = await onGetDomainProducts(domainId)
            const newest = (fresh as Product[])?.[0]
            if (newest) {
              await onUpdateDomainProduct(newest.id, {
                description: form.description || undefined,
                status: form.status,
              })
            }
          }
          toast.success('Product created')
          setSheetOpen(false)
          await loadProducts()
        } else {
          toast.error(res?.message ?? 'Failed to create')
        }
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const res = await onDeleteDomainProduct(deleteTarget.id, domainId)
    if (res?.status === 200) {
      toast.success('Product deleted')
      setDeleteTarget(null)
      await loadProducts()
    } else {
      toast.error(res?.message ?? 'Failed to delete')
    }
  }

  const total = products.length
  const active = products.filter((p) => p.status === 'ACTIVE').length
  const outOfStock = products.filter((p) => p.status === 'OUT_OF_STOCK').length
  const totalValue = products.reduce((sum, p) => sum + p.price, 0)

  const statusBadge = (status: string) => {
    if (status === 'ACTIVE')
      return (
        <Badge className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100">
          Active
        </Badge>
      )
    if (status === 'OUT_OF_STOCK')
      return (
        <Badge className="bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-100">
          Out of Stock
        </Badge>
      )
    return (
      <Badge className="bg-slate-100 dark:bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] dark:border-[var(--border-strong)] hover:bg-slate-100">
        Draft
      </Badge>
    )
  }

  return (
    <>
      <InfoBar />

      <div className="px-4 md:px-6 py-6 flex-1 overflow-y-auto">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-100 flex-shrink-0">
              <ShoppingBag className="h-6 w-6 text-[var(--text-primary)]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                Products
              </h1>
              {domainName && (
                <span className="inline-flex items-center px-2 py-0.5 mt-0.5 rounded-md bg-slate-100 dark:bg-[var(--bg-surface)] text-xs font-medium text-[var(--text-secondary)]">
                  {domainName}
                </span>
              )}
            </div>
          </div>
          <Button
            onClick={openAdd}
            className="bg-indigo-500 hover:bg-indigo-600 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Product
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Products', value: total },
            { label: 'Active', value: active },
            { label: 'Out of Stock', value: outOfStock },
            {
              label: 'Total Value',
              value: `$${(totalValue / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-4"
            >
              <p className="text-xs font-medium text-slate-500 dark:text-[var(--text-secondary)] mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-[var(--text-primary)]">{stat.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 dark:bg-[var(--bg-surface)] mb-5">
              <ShoppingBag className="h-10 w-10 text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No products yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-[var(--text-secondary)] max-w-xs mb-6">
              Add your first product to enable AI-powered recommendations
            </p>
            <Button
              onClick={openAdd}
              className="bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Product
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="relative h-44 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <ShoppingBag className="h-12 w-12 text-[var(--text-muted)]" />
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-[var(--text-primary)] leading-tight line-clamp-1">
                      {product.name}
                    </h3>
                    {statusBadge(product.status)}
                  </div>

                  {product.description && (
                    <p className="text-sm text-slate-500 dark:text-[var(--text-secondary)] line-clamp-2 mb-2">
                      {product.description}
                    </p>
                  )}

                  <p className="text-lg font-bold text-[var(--text-primary)] mb-3">
                    ${(product.price / 100).toFixed(2)}
                  </p>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-xs"
                      onClick={() => openEdit(product)}
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={() => setDeleteTarget(product)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              {editProduct ? 'Edit Product' : 'Add Product'}
            </SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Product name"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Product description"
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={form.image}
                onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                className={cn(
                  'flex-1 bg-[var(--bg-page)] hover:bg-[var(--bg-surface)]',
                  'dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:text-white text-white'
                )}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSheetOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold">{deleteTarget?.name}</span> will be permanently
              deleted and removed from AI recommendations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsContent />
    </Suspense>
  )
}
