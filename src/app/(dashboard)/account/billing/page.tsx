import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { BillingPageClient } from '@/components/settings/billing/billing-page-client'
import { onGetBillingInfo } from '@/actions/billing'

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function BillingPage() {
  const user = await currentUser()
  if (!user) redirect('/auth/sign-in')

  const billingInfo = await onGetBillingInfo()
  
  if (!billingInfo) {
    redirect('/dashboard')
  }

  return <BillingPageClient billingData={billingInfo} />
}