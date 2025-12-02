import { onGetSubscriptionPlan } from '@/actions/settings'
import React from 'react'
import { Card, CardContent, CardDescription } from '../ui/card'
import { CheckCircle2, Plus, CreditCard, Crown } from 'lucide-react'
import { pricingCards } from '@/constants/landing-page'
import Image from 'next/image'
import Modal from '../modal'
import SubscriptionForm from '../forms/settings/subscription-form'
import { cn } from '@/lib/utils'

type Props = {}

const BillingSettings = async (props: Props) => {
  const plan = await onGetSubscriptionPlan()
  const planFeatures = pricingCards.find(
    (card) => card.title.toUpperCase() === plan?.toUpperCase()
  )?.features
  
  if (!planFeatures) return null

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Billing Settings
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Add payment information, upgrade and modify your plan.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex justify-center">
          <Modal
            title="Choose A Plan"
            description="Upgrade your plan to unlock more features and capabilities."
            trigger={
              plan && plan === 'STANDARD' ? (
                <Card className={cn(
                  "border-2 border-dashed border-slate-300 dark:border-slate-700",
                  "bg-slate-50 dark:bg-slate-900/50",
                  "w-full cursor-pointer h-[200px]",
                  "flex justify-center items-center",
                  "transition-all duration-200",
                  "hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20",
                  "group"
                )}>
                  <CardContent className="flex flex-col gap-3 items-center py-8">
                    <div className="rounded-full border-2 border-slate-300 dark:border-slate-700 p-3 group-hover:border-blue-400 transition-colors">
                      <Plus className="text-slate-400 group-hover:text-blue-500 transition-colors h-6 w-6" />
                    </div>
                    <CardDescription className="font-semibold text-base text-slate-700 dark:text-slate-300">
                      Upgrade Plan
                    </CardDescription>
                  </CardContent>
                </Card>
              ) : (
                <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group w-full max-w-[300px]">
                  <div className="aspect-[3/2] relative">
                    <Image 
                      src="/images/creditcard.png"
                      fill
                      alt='Payment method'
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              )
            }
          >
            <SubscriptionForm plan={plan!} />
          </Modal>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 md:p-6 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                Current Plan
              </h3>
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-200 dark:bg-blue-800 mb-4">
              <span className="text-sm font-bold text-blue-900 dark:text-blue-100 uppercase">
                {plan}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {planFeatures.map((feature) => (
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
      </div>
    </div>
  )
}

export default BillingSettings