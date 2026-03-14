import { onGetSubscriptionPlan } from '@/actions/settings'
import React from 'react'
import { CheckCircle2, CreditCard, Crown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Modal from '@/components/modal'
import SubscriptionForm from '@/components/forms/settings/subscription-form'
import { PLAN_PRICES, PLAN_FEATURES, type PlanType } from '@/constants/pricing'

type Props = Record<string, never>

const BillingSettings = async (props: Props) => {
  const plan = await onGetSubscriptionPlan()
  const planKey = (plan ?? 'STANDARD') as PlanType
  const planFeatures = PLAN_FEATURES[planKey].included
  const priceDisplay = PLAN_PRICES[planKey].amountDisplay

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      <div className="lg:col-span-2">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--success)] text-white shadow-lg">
            <CreditCard className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">
              Billing & Plan
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              Manage your subscription and payment details
            </p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-3 space-y-6">
        <div className="rounded-xl bg-gradient-to-br from-[var(--primary)] via-[var(--primary)] to-[var(--primary-light)] p-6 border border-[var(--primary)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-5 w-5 text-[var(--text-accent)]" />
                <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                  {plan} Plan
                </h3>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">
                Your current plan
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-[var(--text-primary)]">
                {priceDisplay}
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                {PLAN_PRICES[planKey].amountCents > 0 ? '/month' : ''}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mb-6">
            <Modal
              title="Choose A Plan"
              description="Upgrade your plan to unlock more features and capabilities."
              trigger={
                <Button variant="outline" className="flex-1 bg-[var(--bg-page)] hover:bg-[var(--bg-hover)]">
                  Change Plan
                </Button>
              }
            >
              <SubscriptionForm plan={plan!} />
            </Modal>
            <Button variant="outline" className="flex-1 bg-[var(--bg-page)] hover:bg-[var(--bg-hover)]">
              Cancel Subscription
            </Button>
          </div>

          <div className="pt-4 border-t border-[var(--primary)]">
            <div className="flex flex-col gap-2">
              {planFeatures.slice(0, 3).map((feature) => (
                <div
                  key={feature}
                  className="flex gap-2 items-start"
                >
                  <CheckCircle2 className="h-4 w-4 text-[var(--success)] dark:text-[var(--success)] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[var(--text-secondary)]">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-[var(--text-secondary)] mb-3 block">
            Payment Method
          </label>
          <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-16 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--info)] flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">
                  Visa ending in 4242
                </p>
                <p className="text-sm text-[var(--text-secondary)]">
                  Expires 12/2025
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="hover:bg-[var(--bg-hover)]">
              Edit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BillingSettings