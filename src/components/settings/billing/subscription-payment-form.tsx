'use client'

import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { onUpdateOnboardingStep } from '@/actions/onboarding'

interface SubscriptionPaymentFormProps {
  amount: number // Amount in DOLLARS (not cents)
  onSuccess: () => void
  onBack: () => void
}

export function SubscriptionPaymentForm({
  amount,
  onSuccess,
  onBack,
}: SubscriptionPaymentFormProps) {
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
      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/account/billing`,
        },
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message || 'Payment setup failed')
        setProcessing(false)
        return
      }

      toast.success('Subscription activated!')
      await onUpdateOnboardingStep('exploredPricing')
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('An error occurred during payment')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-[var(--bg-card)] rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[var(--text-secondary)]">Amount due today</span>
          <span className="text-2xl font-bold text-[var(--text-primary)]">
            ${amount.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Then ${amount.toFixed(2)}/month until you cancel
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-[var(--text-primary)]">
          Payment Information
        </h4>
        <PaymentElement />
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
        <Lock className="w-3 h-3" />
        <span>Secure payment powered by Stripe</span>
      </div>

      <div className="flex gap-3 pt-4 border-t border-[var(--border-default)]">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={processing}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || processing}
          className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Subscribe ${amount.toFixed(2)}/mo
            </>
          )}
        </Button>
      </div>
    </form>
  )
}