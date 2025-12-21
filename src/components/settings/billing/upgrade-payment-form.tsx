'use client'

import { useState, useEffect } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft, Lock, CreditCard, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { onUpdateSubscription } from '@/actions/stripe'
import { onGetPaymentMethods, onChargeWithSavedCard } from '@/actions/billing'
import type { PlanType } from '@/lib/pricing-config'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'

interface UpgradePaymentFormProps {
  targetPlan: PlanType
  amount: number
  onSuccess: () => void
  onBack: () => void
}

export function UpgradePaymentForm({
  targetPlan,
  amount,
  onSuccess,
  onBack,
}: UpgradePaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [savedCards, setSavedCards] = useState<any[]>([])
  const [loadingCards, setLoadingCards] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'saved' | 'new'>('saved')
  const [selectedCard, setSelectedCard] = useState<string>('')

  useEffect(() => {
    loadSavedCards()
  }, [])

  const loadSavedCards = async () => {
    setLoadingCards(true)
    const result = await onGetPaymentMethods()
    if (result.success && result.methods.length > 0) {
      setSavedCards(result.methods)
      const defaultCard = result.methods.find(m => m.isDefault) || result.methods[0]
      setSelectedCard(defaultCard.id)
      setPaymentMethod('saved')
    } else {
      setPaymentMethod('new')
    }
    setLoadingCards(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe) {
      return
    }

    setProcessing(true)

    try {
      if (paymentMethod === 'saved' && selectedCard) {
        const result = await onChargeWithSavedCard(selectedCard, amount, targetPlan)

        if (result.success) {
          toast.success('Plan upgraded successfully!')
          onSuccess()
        } else {
          toast.error(result.message || 'Payment failed')
        }
      } else {
        if (!elements) {
          setProcessing(false)
          return
        }

        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/account/billing`,
          },
          redirect: 'if_required',
        })

        if (error) {
          toast.error(error.message || 'Payment failed')
          setProcessing(false)
          return
        }

        if (paymentIntent?.status === 'succeeded') {
          const result = await onUpdateSubscription(targetPlan)
          if (result) {
            toast.success('Plan upgraded successfully!')
            onSuccess()
          }
        }
      }

      setProcessing(false)
    } catch (err) {
      console.error(err)
      toast.error('An error occurred during payment')
      setProcessing(false)
    }
  }

  if (loadingCards) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600 dark:text-slate-400">Amount due</span>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            ${(amount / 100).toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Billed monthly to your payment method
        </p>
      </div>

      {savedCards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-900 dark:text-white">
              Payment Method
            </h4>
          </div>

          <RadioGroup value={paymentMethod} onValueChange={(v: any) => setPaymentMethod(v)}>
            <div className="space-y-3">
              {savedCards.map((card) => (
                <div
                  key={card.id}
                  className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentMethod === 'saved' && selectedCard === card.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                  onClick={() => {
                    setPaymentMethod('saved')
                    setSelectedCard(card.id)
                  }}
                >
                  <RadioGroupItem value="saved" id={card.id} checked={paymentMethod === 'saved' && selectedCard === card.id} />
                  <Label htmlFor={card.id} className="flex-1 flex items-center gap-3 cursor-pointer">
                    <CreditCard className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                        {card.brand} •••• {card.last4}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Expires {String(card.expMonth).padStart(2, '0')}/{String(card.expYear).slice(-2)}
                      </p>
                    </div>
                    {card.isDefault && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </Label>
                </div>
              ))}

              <div
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  paymentMethod === 'new'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
                onClick={() => setPaymentMethod('new')}
              >
                <RadioGroupItem value="new" id="new-card" checked={paymentMethod === 'new'} />
                <Label htmlFor="new-card" className="flex-1 flex items-center gap-3 cursor-pointer">
                  <Plus className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Use a new card
                  </p>
                </Label>
              </div>
            </div>
          </RadioGroup>
        </div>
      )}

      {paymentMethod === 'new' && <PaymentElement />}

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
          disabled={!stripe || processing || (paymentMethod === 'saved' && !selectedCard)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Pay ${(amount / 100).toFixed(2)}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}