'use client'

import { UserRegistrationProps, UserRegistrationSchema } from "@/schemas/auth.schema"
import { useSignUp } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Toaster, toast } from "sonner"
import { zodResolver } from '@hookform/resolvers/zod'
import { onCompleteUserRegistration } from "@/actions"

export const useSignUpForm = () => {
    const [loading, setLoading] = useState<boolean>(false)
    const { signUp, isLoaded, setActive } = useSignUp()
    const router = useRouter()
    const methods = useForm<UserRegistrationProps>({
        resolver: zodResolver(UserRegistrationSchema),
        defaultValues: {
            type: 'owner',
            fullname: "",
            email: "",
            confirmEmail: "",
            password: "",
            confirmPassword: "",
            otp: "",
        },
        mode: 'onSubmit',
    })
    const onGenerateOTP = async (
    email: string,
    password: string,
    onNext: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (!isLoaded) return

    try {
      await signUp.create({
        emailAddress: email,
        password: password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      onNext((prev) => prev + 1)
    } catch (error: any) {
      toast.error(error.errors?.[0]?.longMessage || 'Something went wrong')
    }
  }

   const onHandleSubmit = methods.handleSubmit(
    async (values: UserRegistrationProps) => {
      if (!isLoaded) return

      try {
        setLoading(true)
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: values.otp,
        })

        if (completeSignUp.status !== 'complete') {
          return { message: 'Something went wrong!' }
        }

        if (completeSignUp.status == 'complete') {
          if (!signUp.createdUserId) return

          const registered = await onCompleteUserRegistration(
            values.fullname,
            signUp.createdUserId,
            values.type
          )

          if (registered?.status == 200 && registered.user) {
            await setActive({
              session: completeSignUp.createdSessionId,
            })

            setLoading(false)
            router.push('/dashboard')
          }

          if (registered?.status == 400) {
            toast.error('Something went wrong!')
          }
        }
      } catch (error: any) {
        toast.error(error.errors?.[0]?.longMessage || 'Something went wrong')
      }
    }
  )
  return {
    methods,
    onHandleSubmit,
    onGenerateOTP,
    loading,
  }
}