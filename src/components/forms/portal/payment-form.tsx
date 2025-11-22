import { Loader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import { useCompleteCustomerPayment } from '@/hooks/billing/use-billing'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import React, { useEffect, useState } from 'react'

type CustomerPaymentFormProps = {
    onNext(): void
}

export const CustomerPaymentForm = ({ onNext }: CustomerPaymentFormProps) => {
    const { processing, onMakePayment } = useCompleteCustomerPayment(onNext)
    const stripe = useStripe()
    const elements = useElements()
    const [isReady, setIsReady] = useState(false)
    
    useEffect(() => {
        console.log('Stripe instance:', stripe)
        console.log('Elements instance:', elements)
    }, [stripe, elements])
    
    return (
        <div className='flex flex-col gap-4'>
            <h3 className='text-xl font-semibold'>Payment Details</h3>
            <div className='border-2 p-4 min-h-[300px] bg-white'>
                <PaymentElement />
            </div>
            
            <Button
                type='button'
                className='w-full'
                disabled={processing || !stripe || !elements}
                onClick={onMakePayment}
            >
                <Loader loading={processing}>
                    {!stripe || !elements ? 'Loading...' : `Pay $67`}
                </Loader>
            </Button>
        </div>
    )
}