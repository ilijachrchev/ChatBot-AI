import { useEffect, useState } from "react"
import axios from 'axios'
import { onCreateCustomerPaymentIntentSecret, onGetStripeClientSecret, onUpdateSubscription } from "@/actions/stripe"
import { useElements, useStripe as useStripeHook } from "@stripe/react-stripe-js"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { PlanType } from "@/lib/pricing-config"

export const useStripe = () => {
    const [onStripeAccountPending, setOnStripeAccountPending] = useState<boolean>(false)

    const onStripeConnect = async () => {
        try {
            setOnStripeAccountPending(true)
            const account = await axios.get(`/api/stripe/connect`)
            if (account) {
                setOnStripeAccountPending(false)
                if (account) {
                    window.location.href = account.data.url
                }
            }
        } catch (error) {
            console.log(error)
        }
    }
    return { onStripeConnect, onStripeAccountPending }
}

export const useStripeCustomer = (amount: number, stripeId: string) => {
  const [stripeSecret, setStripeSecret] = useState<string>('')
  const [loadForm, setLoadForm] = useState<boolean>(false)

  const onGetCustomerIntent = async (amount: number) => {
    try {
      setLoadForm(true)
      const intent = await onCreateCustomerPaymentIntentSecret(amount, stripeId)
      if (intent) {
        setLoadForm(false)
        setStripeSecret(intent.secret!)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    onGetCustomerIntent(amount)
  }, [])

  return { stripeSecret, loadForm }
}

export const useCompleteCustomerPayment = (onNext: () => void) => {
  const [processing, setProcessing] = useState<boolean>(false)
  const stripe = useStripeHook()
  const elements = useElements()

  const onMakePayment = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!stripe || !elements) {
      return null
    }

    try {
      setProcessing(true)

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/settings/billing`,
        },
        redirect: 'if_required',
      })

      if (error) {
        console.log(error)
        toast.error('Payment failed. Please try again.')
      }

      if (paymentIntent?.status === 'succeeded') {
        toast.success("Payment Complete!")
        onNext()
      }

      setProcessing(false)
    } catch (error) {
      console.log(error)
      toast.error('An error occurred during payment.')
      setProcessing(false)
    }
  }

  return { processing, onMakePayment }
}

export const useSubscriptions = (plan: PlanType) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [payment, setPayment] = useState<PlanType>(plan)
  const router = useRouter()
  
  const onUpdateToFreeTier = async () => {
    try {
      setLoading(true)
      const free = await onUpdateSubscription('STANDARD')
      if (free) {
        setLoading(false)
        toast.success(free.message)
        router.refresh()
      }
    } catch (error) {
      console.log(error)
      setLoading(false)
      toast.error('Failed to update subscription')
    }
  }

  const onSetPayment = (payment: PlanType) => setPayment(payment)

  return {
    loading,
    onSetPayment,
    payment,
    onUpdateToFreeTier,
  }
}

export const useStripeElements = (payment: PlanType) => {
  const [stripeSecret, setStripeSecret] = useState<string>('')
  const [loadForm, setLoadForm] = useState<boolean>(false)

  const onGetBillingIntent = async (plan: PlanType) => {
    try {
      setLoadForm(true)
      const intent = await onGetStripeClientSecret(plan)
      if (intent) {
        setLoadForm(false)
        setStripeSecret(intent.secret!)
      }
    } catch (error) {
      console.log(error)
      setLoadForm(false)
    }
  }

  useEffect(() => {
    onGetBillingIntent(payment)
  }, [payment])

  return { stripeSecret, loadForm }
}

export const useCompletePayment = (
  payment: PlanType
) => {
  const [processing, setProcessing] = useState<boolean>(false)
  const router = useRouter()
  const stripe = useStripeHook()
  const elements = useElements()

  const onMakePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) {
      return null
    }

    try {
      setProcessing(true)

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/settings/billing`,
        },
        redirect: 'if_required',
      })

      if (error) {
        console.log(error)
        toast.error('Payment failed. Please try again.')
        setProcessing(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        const plan = await onUpdateSubscription(payment)
        if (plan) {
          toast.success(plan.message)
        }
      }

      setProcessing(false)
      router.refresh()
    } catch (error) {
      console.log(error)
      toast.error('An error occurred during payment.')
      setProcessing(false)
    }
  }

  return { processing, onMakePayment }
}