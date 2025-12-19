'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Check,
  Sparkles,
  Crown,
  Zap,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { PRICING_CONFIG, type PlanType, getPlanDetails } from '@/lib/pricing-config'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { UpgradePaymentForm } from './upgrade-payment-form'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface UpgradePlanModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan: PlanType
  targetPlan: PlanType
  onSuccess?: () => void
}

const planIcons: Record<PlanType, any> = {
  STANDARD: Zap,
  PRO: Sparkles,
  ULTIMATE: Crown,
}

export function UpgradePlanModal({
  open,
  onOpenChange,
  currentPlan,
  targetPlan,
  onSuccess,
}: UpgradePlanModalProps) {
  const [step, setStep] = useState<'confirm' | 'payment'>('confirm')
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  
  const currentPlanDetails = getPlanDetails(currentPlan)
  const targetPlanDetails = getPlanDetails(targetPlan)
  const TargetIcon = planIcons[targetPlan]

  const handleContinue = () => {
    setStep('payment')
    setShowPaymentForm(true)
  }

  const handleBack = () => {
    setStep('confirm')
    setShowPaymentForm(false)
  }

  const handleSuccess = () => {
    onSuccess?.()
    onOpenChange(false)
    setStep('confirm')
    setShowPaymentForm(false)
  }

  const newFeatures = Object.entries(targetPlanDetails.features)
    .filter(([key, targetValue]) => {
      const currentValue = currentPlanDetails.features[key as keyof typeof currentPlanDetails.features]
      if (typeof targetValue === 'boolean') {
        return targetValue === true && currentValue === false
      }
      if (targetValue === 'unlimited' && currentValue !== 'unlimited') {
        return true
      }
      if (typeof targetValue === 'number' && typeof currentValue === 'number') {
        return targetValue > currentValue
      }
      return false
    })
    .slice(0, 5)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {step === 'confirm' ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <TargetIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl">
                    Upgrade to {targetPlanDetails.displayName}
                  </DialogTitle>
                  <DialogDescription>
                    {targetPlanDetails.description}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Current Plan</p>
                    <p className="text-xl font-semibold text-slate-900 dark:text-white">
                      {currentPlanDetails.displayName}
                    </p>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                      {currentPlanDetails.priceDisplay}/month
                    </p>
                  </div>
                  
                  <ArrowRight className="w-6 h-6 text-slate-400" />
                  
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">New Plan</p>
                    <p className="text-xl font-semibold text-slate-900 dark:text-white">
                      {targetPlanDetails.displayName}
                    </p>
                    <p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {targetPlanDetails.priceDisplay}/month
                    </p>
                  </div>
                </div>

                {targetPlanDetails.price > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Due today</span>
                      <span className="text-lg font-bold text-slate-900 dark:text-white">
                        {targetPlanDetails.priceDisplay}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Billed monthly • Cancel anytime
                    </p>
                  </div>
                )}
              </div>

              {newFeatures.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                    What you'll get:
                  </h4>
                  <ul className="space-y-2">
                    {newFeatures.map(([key, value]) => {
                      let displayText = key.replace(/([A-Z])/g, ' $1').trim()
                      if (value === 'unlimited') {
                        displayText = `Unlimited ${displayText}`
                      } else if (typeof value === 'number') {
                        displayText = `${value.toLocaleString()} ${displayText}`
                      }
                      
                      return (
                        <li key={key} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                            {displayText}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              <Separator />

              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <p>
                  • Your card will be charged {targetPlanDetails.priceDisplay} today
                </p>
                <p>
                  • Subscription renews automatically on the same day each month
                </p>
                <p>
                  • You can cancel or change your plan at any time
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                Continue to Payment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
              <DialogDescription>
                Enter your payment information to complete the upgrade
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              {showPaymentForm && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    mode: 'payment',
                    amount: targetPlanDetails.price,
                    currency: 'usd',
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#3b82f6',
                      },
                    },
                  }}
                >
                  <UpgradePaymentForm
                    targetPlan={targetPlan}
                    amount={targetPlanDetails.price}
                    onSuccess={handleSuccess}
                    onBack={handleBack}
                  />
                </Elements>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}