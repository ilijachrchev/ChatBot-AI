import { onGetSubscriptionPlan } from '@/actions/settings'
import React from 'react'
import { Section } from '../section-label'
import { Card, CardContent, CardDescription } from '../ui/card'
import { CheckCircle2, Plus, CreditCard, Crown } from 'lucide-react'
import { pricingCards } from '@/constants/landing-page'
import { Button } from '../ui/button'
import Modal from '../modal'
import SubscriptionForm from '../forms/settings/subscription-form'
import { cn } from '@/lib/utils'

type Props = Record<string, never>

const BillingSettings = async (props: Props) => {
  const plan = await onGetSubscriptionPlan()
  const planFeatures = pricingCards.find(
    (card) => card.title.toUpperCase() === plan?.toUpperCase()
  )?.features
  
  if (!planFeatures) return null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      <div className="lg:col-span-2">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
              Billing & Plan
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage your subscription and payment details
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 p-6 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {plan} Plan
                </h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your current plan
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                $99
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                /month
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Modal
              title="Choose A Plan"
              description="Upgrade your plan to unlock more features and capabilities."
              trigger={
                <Button variant="outline" className="flex-1 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">
                  Change Plan
                </Button>
              }
            >
              <SubscriptionForm plan={plan!} />
            </Modal>
            <Button variant="outline" className="flex-1 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800">
              Cancel Subscription
            </Button>
          </div>

          <div className="pt-4 border-t border-blue-200 dark:border-blue-800">
            <div className="flex flex-col gap-2">
              {planFeatures.slice(0, 3).map((feature) => (
                <div
                  key={feature}
                  className="flex gap-2 items-start"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
            Payment Method
          </label>
          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="h-12 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">
                  Visa ending in 4242
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Expires 12/2025
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="hover:bg-slate-100 dark:hover:bg-slate-800">
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingSettings