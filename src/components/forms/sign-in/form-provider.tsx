"use client"
import { Loader } from '@/components/loader'
import { AuthContextProvider } from '@/context/use-auth-context'
import { useSignInForm } from '@/hooks/sign-in/use-sign-in'
import React from 'react'
import { FormProvider } from 'react-hook-form'

type Props = {
    children: React.ReactNode
}

const SignInFormProvider = ({ children }: Props) => {
    const { methods, onHandleSubmit, loading } = useSignInForm()
    
    return (
        <AuthContextProvider>
            <FormProvider {...methods}>
                <form
                    onSubmit={onHandleSubmit}
                    className="w-full">
                    <Loader loading={loading}>{children}</Loader>
                </form>
            </FormProvider>
        </AuthContextProvider>
    )
}

export default SignInFormProvider