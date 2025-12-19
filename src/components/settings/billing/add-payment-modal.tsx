'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, Lock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { onCreateSetupIntent } from '@/actions/billing'
import { Alert, AlertDescription } from '@/components/ui/alert'

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY

if (!publishableKey) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set in environment variables')
}

const stripePromise = publishableKey ? loadStripe(publishableKey) : null

interface AddPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

function PaymentForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    try {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/account/billing`,
        },
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message || 'Failed to add payment method')
        setProcessing(false)
        return
      }

      if (setupIntent?.status === 'succeeded') {
        toast.success('Payment method added successfully!')
        onSuccess()
      }

      setProcessing(false)
    } catch (err) {
      console.error(err)
      toast.error('An error occurred')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <p className="text-sm font-medium text-slate-900 dark:text-white">
            Add a new payment method
          </p>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your card will be securely saved for future payments
        </p>
      </div>

      <PaymentElement />

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Lock className="w-3 h-3" />
        <span>Secure payment powered by Stripe</span>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={processing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="flex-1"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            'Add Payment Method'
          )}
        </Button>
      </div>
    </form>
  )
}

export function AddPaymentModal({ open, onOpenChange, onSuccess }: AddPaymentModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open && !clientSecret) {
      loadSetupIntent()
    }
  }, [open])

  const loadSetupIntent = async () => {
    setLoading(true)
    setError(null)

    if (!publishableKey) {
      setError('Stripe is not configured. Please contact support.')
      setLoading(false)
      return
    }

    if (!stripePromise) {
      setError('Failed to load Stripe. Please refresh and try again.')
      setLoading(false)
      return
    }

    const result = await onCreateSetupIntent()
    
    if (result.success && result.clientSecret) {
      setClientSecret(result.clientSecret)
    } else {
      setError('Failed to initialize payment form. Please try again.')
      toast.error('Failed to initialize payment form')
    }
    
    setLoading(false)
  }

  const handleSuccess = () => {
    setClientSecret(null)
    setError(null)
    onSuccess?.()
    onOpenChange(false)
  }

  const handleCancel = () => {
    setClientSecret(null)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a credit or debit card to your account
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : clientSecret && stripePromise ? (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'stripe',
                  variables: {
                    colorPrimary: '#3b82f6',
                  },
                },
              }}
            >
              <PaymentForm onSuccess={handleSuccess} onCancel={handleCancel} />
            </Elements>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}