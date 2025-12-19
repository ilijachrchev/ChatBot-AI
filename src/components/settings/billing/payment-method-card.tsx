'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit, Trash2, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { onSetDefaultPaymentMethod, onDeletePaymentMethod } from '@/actions/billing'
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

interface PaymentMethodCardProps {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
  onUpdate: () => void
}

const cardBrandColors: Record<string, string> = {
  visa: 'from-blue-600 to-blue-800',
  mastercard: 'from-orange-600 to-red-600',
  amex: 'from-teal-600 to-cyan-600',
  discover: 'from-orange-500 to-orange-700',
  default: 'from-slate-900 to-slate-800',
}

const cardBrandLogos: Record<string, string> = {
  visa: 'VISA',
  mastercard: 'Mastercard',
  amex: 'AMEX',
  discover: 'Discover',
}

export function PaymentMethodCard({
  id,
  brand,
  last4,
  expMonth,
  expYear,
  isDefault,
  onUpdate,
}: PaymentMethodCardProps) {
  const [loadingDefault, setLoadingDefault] = useState(false)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const cardColor = cardBrandColors[brand.toLowerCase()] || cardBrandColors.default
  const cardLogo = cardBrandLogos[brand.toLowerCase()] || brand.charAt(0).toUpperCase() + brand.slice(1)

  const handleSetDefault = async () => {
    setLoadingDefault(true)
    const result = await onSetDefaultPaymentMethod(id)
    
    if (result.success) {
      toast.success(result.message)
      onUpdate()
    } else {
      toast.error(result.message)
    }
    
    setLoadingDefault(false)
  }

  const handleDelete = async () => {
    setLoadingDelete(true)
    const result = await onDeletePaymentMethod(id)
    
    if (result.success) {
      toast.success(result.message)
      onUpdate()
      setDeleteDialogOpen(false)
    } else {
      toast.error(result.message)
    }
    
    setLoadingDelete(false)
  }

  return (
    <>
      <div className={`relative p-4 rounded-xl border-2 ${isDefault ? 'border-blue-500 dark:border-blue-600' : 'border-slate-200 dark:border-slate-800'} bg-gradient-to-br ${cardColor} text-white shadow-lg`}>
        {isDefault && (
          <Badge className="absolute top-3 right-3 bg-green-500 text-white text-xs">
            Default
          </Badge>
        )}
        
        <div className="flex items-start justify-between mb-8">
          <p className="text-sm font-medium">{cardLogo}</p>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-white/60" />
            <div className="w-2 h-2 rounded-full bg-white/60" />
            <div className="w-2 h-2 rounded-full bg-white/60" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-xs text-white/60">CARD NUMBER</p>
          <p className="font-mono text-lg">•••• •••• •••• {last4}</p>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-xs text-white/60">EXPIRES</p>
            <p className="text-sm">{String(expMonth).padStart(2, '0')}/{String(expYear).slice(-2)}</p>
          </div>
          <div className="flex gap-2">
            {!isDefault && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 text-white hover:bg-white/10"
                onClick={handleSetDefault}
                disabled={loadingDefault}
              >
                {loadingDefault ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </Button>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 text-white hover:bg-white/10"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={loadingDelete}
            >
              {loadingDelete ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Method</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this payment method ending in {last4}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {loadingDelete ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}