import { onGetSubscriptionPlan } from '@/actions/settings'
import React from 'react'
import { CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Modal from '@/components/modal'
import SubscriptionForm from '@/components/forms/settings/subscription-form'
import { PLAN_PRICES, type PlanType } from '@/constants/pricing'

type Props = Record<string, never>

const BillingPlan = async (props: Props) => {
  const plan = await onGetSubscriptionPlan()
  const planKey = (plan ?? 'STANDARD') as PlanType
  const priceDisplay = PLAN_PRICES[planKey].amountDisplay

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CreditCard className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Billing & Plan
          </h3>
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 dark:bg-[var(--bg-hover)] p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {plan} Plan
            </p>
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

        <div className="flex gap-2">
          <Modal
            title="Choose A Plan"
            description="Upgrade your plan to unlock more features and capabilities."
            trigger={
              <Button variant="outline" className="flex-1">
                Change Plan
              </Button>
            }
          >
            <SubscriptionForm plan={plan!} />
          </Modal>
          <Button variant="outline" className="flex-1">
            Cancel Subscription
          </Button>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">
          Payment Method
        </p>
        <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border-default)] bg-slate-50 dark:bg-[var(--bg-hover)]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-14 rounded bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">
                Visa ending in 4242
              </p>
              <p className="text-sm text-[var(--text-secondary)]">
                Expires 12/2025
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        </div>
      </div>
    </div>
  )
}

export default BillingPlan