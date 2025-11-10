import { useEffect, useState } from "react"
import axios from 'axios'
import { onCreateCustomerPaymentIntentSecret } from "@/actions/stripe";

export const useStripe = () => {
    const [onStripeAccountPending, setOnStripeAccountPending] = useState<boolean>(false);

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