"use client"
import React from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useStripeCustomer } from '@/hooks/billing/use-billing'

type Props = {
    onBack(): void
    products?:
        | {
            name: string
            image: string
            price: number
        }[]
        | undefined
    amount?: number
    onNext(): void
    stripeId?: string
}

const PaymentCheckout = ({
    onBack,
    onNext,
    amount,
    products,
    stripeId
}: Props) => {
    const StripePromise = loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISH_KEY!,
        {
            stripeAccount: stripeId!,
        }
    )
    const {
        stripeSecret,
        loadForm
     } = useStripeCustomer(amount!, stripeId!)
  return (
    <div>PaymentCheckout</div>
  )
}

export default PaymentCheckout