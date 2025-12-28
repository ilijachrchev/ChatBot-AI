'use client'

import { useState } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Lock } from 'lucide-react'
import { toast } from 'sonner'

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
      // Detect intent type from the client secret in the Elements
      // Setup intents start with 'seti_', payment intents start with 'pi_'
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
      onSuccess()
    } catch (err) {
      console.error(err)
      toast.error('An error occurred during payment')
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Amount due today</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            ${amount.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Then ${amount.toFixed(2)}/month until you cancel
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-slate-900 dark:text-white">
          Payment Information
        </h4>
        <PaymentElement />
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Lock className="w-3 h-3" />
        <span>Secure payment powered by Stripe</span>
      </div>

      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
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
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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