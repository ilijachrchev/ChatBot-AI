'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Check, 
  X, 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2,
  Sparkles,
  Calendar,
  Users,
  Mail,
  Palette,
  BarChart3,
  Zap,
  Shield,
  Crown
} from 'lucide-react'
import { PRICING_CONFIG, type PlanType, type PlanDetails, getNextPlan, PLAN_ORDER } from '@/lib/pricing-config'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UpgradePlanModal } from './upgrade-plan-modal'
import { UpdateBillingModal } from './update-billing-modal'
import { AddPaymentModal } from './add-payment-modal'
import { PaymentMethodCard } from './payment-method-card'
import { PaymentHistory } from './payment-history'

interface PaymentMethod {
  id: string
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

interface BillingPageClientProps {
  billingData: {
    userId: string
    fullname: string
    currentPlan: PlanType
    credits: number
    planDetails: PlanDetails
    stripeCustomerId: string | null
    billingAddress: {
      name: string
      street?: string | null
      city?: string | null
      state?: string | null
      country?: string | null
      zipCode?: string | null
      vatNumber?: string | null
    } | null
    stripeBillingInfo?: {
      name: string
      email: string
      address: {
        street?: string | null
        city?: string | null
        state?: string | null
        country?: string | null
        zipCode?: string | null
      } | null
    } | null
  }
  paymentMethods: PaymentMethod[]
}

const featureIcons: Record<string, any> = {
  conversations: Users,
  domains: Zap,
  emailCampaigns: Mail,
  chatbotCustomization: Palette,
  analytics: BarChart3,
  prioritySupport: Shield,
  apiAccess: Zap,
  customBranding: Sparkles,
  advancedAI: Crown,
  integrations: Zap,
}

export function BillingPageClient({ billingData, paymentMethods: initialPaymentMethods }: BillingPageClientProps) {
  const { currentPlan, credits, planDetails, billingAddress, stripeBillingInfo } = billingData
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(currentPlan)
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false)
  const [billingModalOpen, setBillingModalOpen] = useState(false)
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false)
  const [targetUpgradePlan, setTargetUpgradePlan] = useState<PlanType | null>(null)
  const router = useRouter()
  
  const nextPlan = getNextPlan(currentPlan)
  const isHighestPlan = currentPlan === 'ULTIMATE'

  const usagePercentage = Math.min((credits / planDetails.monthlyCredits) * 100, 100)

  const ultimatePlan = PRICING_CONFIG.ULTIMATE
  const missingFeatures = Object.entries(ultimatePlan.features).filter(
    ([key, value]) => {
      const currentValue = planDetails.features[key as keyof typeof planDetails.features]
      if (typeof value === 'boolean') {
        return value === true && currentValue === false
      }
      if (value === 'unlimited' && currentValue !== 'unlimited') {
        return true
      }
      return false
    }
  )

  const handleUpgradeClick = () => {
    if (nextPlan) {
      setTargetUpgradePlan(nextPlan)
      setUpgradeModalOpen(true)
    }
  }

  const handleUpgradeSuccess = () => {
    router.refresh()
  }

  const handleBillingUpdateSuccess = () => {
    router.refresh()
  }

  const handlePaymentMethodUpdate = () => {
    router.refresh()
  }

  const displayBillingInfo = stripeBillingInfo?.address || billingAddress

  return (
    <>
      <div className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Plan Details</span>
                {planDetails.recommended && (
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                    Recommended
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Your current subscription information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Current Plan</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {planDetails.displayName}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">AI Credits</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {planDetails.monthlyCredits}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    For AI conversations
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Cost</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {planDetails.priceDisplay}
                    {planDetails.price > 0 && <span className="text-sm font-normal">/month</span>}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Renewal Date</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-slate-500 dark:text-slate-400">AI Credits Used</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {credits} of {planDetails.monthlyCredits}
                  </p>
                </div>
                <Progress value={usagePercentage} className="h-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  These credits are used for AI-powered conversations
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                {!isHighestPlan ? (
                  <Button 
                    onClick={handleUpgradeClick}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Upgrade to {nextPlan && PRICING_CONFIG[nextPlan].displayName}
                  </Button>
                ) : (
                  <Button disabled className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Crown className="w-4 h-4 mr-2" />
                    You&apos;re on the best plan!
                  </Button>
                )}
                
                {currentPlan !== 'STANDARD' && (
                  <Button variant="outline">
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan Benefits</CardTitle>
              <CardDescription>What&apos;s included in your plan</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {Object.entries(planDetails.features).map(([key, value]) => {
                  const Icon = featureIcons[key as keyof typeof featureIcons] || Check
                  const isAvailable = 
                    typeof value === 'boolean' 
                      ? value 
                      : value === 'unlimited' || (typeof value === 'number' && value > 0)

                  let displayValue = ''
                  if (typeof value === 'number') {
                    displayValue = value.toLocaleString()
                  } else if (value === 'unlimited') {
                    displayValue = 'Unlimited'
                  } else if (value === true) {
                    displayValue = 'Included'
                  } else {
                    displayValue = 'Not included'
                  }

                  return (
                    <li key={key} className="flex items-start gap-3">
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        isAvailable 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {isAvailable ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <X className="w-3 h-3" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {displayValue}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ul>

              {missingFeatures.length > 0 && !isHighestPlan && (
                <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-2">
                    Unlock more with {nextPlan && PRICING_CONFIG[nextPlan].displayName}:
                  </p>
                  <ul className="space-y-1">
                    {missingFeatures.slice(0, 3).map(([key]) => (
                      <li key={key} className="text-xs text-purple-700 dark:text-purple-300 flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Billing Info</CardTitle>
                <CardDescription>
                  {displayBillingInfo 
                    ? 'Your billing address and details' 
                    : 'Add your billing information for invoices and receipts'}
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setBillingModalOpen(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                {displayBillingInfo ? 'Update' : 'Add'} Billing Address
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {displayBillingInfo ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Name</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {stripeBillingInfo?.name || billingAddress?.name || billingData.fullname}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Street</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {displayBillingInfo.street || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">City/State</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {displayBillingInfo.city && displayBillingInfo.state 
                      ? `${displayBillingInfo.city}, ${displayBillingInfo.state}`
                      : displayBillingInfo.city || displayBillingInfo.state || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Country</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {displayBillingInfo.country || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">Zip/Postal code</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {displayBillingInfo.zipCode || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 mb-1">VAT Number</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {billingAddress?.vatNumber || '-'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  No billing information added yet
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setBillingModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Billing Information
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your saved payment methods</CardDescription>
              </div>
              <Button 
                size="sm"
                onClick={() => setAddPaymentModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Card
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {initialPaymentMethods.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {initialPaymentMethods.map((method) => (
                  <PaymentMethodCard
                    key={method.id}
                    id={method.id}
                    brand={method.brand}
                    last4={method.last4}
                    expMonth={method.expMonth}
                    expYear={method.expYear}
                    isDefault={method.isDefault}
                    onUpdate={handlePaymentMethodUpdate}
                  />
                ))}
                
                <button 
                  onClick={() => setAddPaymentModalOpen(true)}
                  className="p-6 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex flex-col items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <Plus className="w-6 h-6" />
                  <p className="text-sm font-medium">Add Payment Method</p>
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  No payment methods added yet
                </p>
                <Button 
                  variant="outline"
                  onClick={() => setAddPaymentModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Card
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <PaymentHistory />
      </div>

      {targetUpgradePlan && (
        <UpgradePlanModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          currentPlan={currentPlan}
          targetPlan={targetUpgradePlan}
          onSuccess={handleUpgradeSuccess}
        />
      )}

      <UpdateBillingModal
        open={billingModalOpen}
        onOpenChange={setBillingModalOpen}
        currentData={billingAddress || (stripeBillingInfo?.address ? {
          name: stripeBillingInfo.name,
          street: stripeBillingInfo.address.street,
          city: stripeBillingInfo.address.city,
          state: stripeBillingInfo.address.state,
          country: stripeBillingInfo.address.country,
          zipCode: stripeBillingInfo.address.zipCode,
          vatNumber: null,
        } : null)}
        onSuccess={handleBillingUpdateSuccess}
      />

      <AddPaymentModal
        open={addPaymentModalOpen}
        onOpenChange={setAddPaymentModalOpen}
        onSuccess={handlePaymentMethodUpdate}
      />
    </>
  )
}