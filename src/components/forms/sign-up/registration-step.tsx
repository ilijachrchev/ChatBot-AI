"use client"
import { useAuthContextHook } from '@/context/use-auth-context'
import React, { useEffect, useState } from 'react'
import { FieldErrors, FieldValues, useFormContext, UseFormRegister } from 'react-hook-form'
import { Spinner } from '@/components/spinner'
import dynamic from 'next/dynamic'

type DetailFormProps = {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
}

const DetailForm = dynamic<DetailFormProps>(() => import('./account-details-form'), {
  ssr: false,
  loading: () => <Spinner />,
})

const OTPForm = dynamic(() => import('./otp-form'), {
  ssr: false,
  loading: () => <Spinner />,
})

type Props = Record<string, never>

const RegistrationFormStep = (props: Props) => {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext()
  const { currentStep } = useAuthContextHook()
  const [onOTP, setOnOTP] = useState<string>('')

  useEffect(() => {
    setValue('otp', onOTP)
  }, [onOTP, setValue])

  switch (currentStep) {
    case 1:
      return (
        <DetailForm
          errors={errors}
          register={register}
        />
      )
    case 2:
      return (
        <OTPForm
          onOTP={onOTP}
          setOTP={setOnOTP}
        />
      )
  }

  return null
}

export default RegistrationFormStep
