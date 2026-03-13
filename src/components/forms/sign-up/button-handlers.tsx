'use client'
import { useAuthContextHook } from '@/context/use-auth-context'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSignUpForm } from '@/hooks/sign-up/use-sign-up'
import { toast } from 'sonner'

const ButtonHandler = () => {
  const { currentStep, setCurrentStep } = useAuthContextHook()
  const {
    formState: { errors },
    getValues,
    trigger,
    watch,
  } = useFormContext()

  const { loading, onGenerateOTP } = useSignUpForm()

  const fullname = watch('fullname')
  const email = watch('email')
  const confirmEmail = watch('confirmEmail')
  const password = watch('password')
  const confirmPassword = watch('confirmPassword')

  if (currentStep === 2) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='w-full flex flex-col gap-4 mt-6'
      >
        <Button
          type='submit'
          disabled={loading}
          className='w-full h-14 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-lg rounded-xl shadow-2xl shadow-[var(--primary)]/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40'
        >
          <Loader loading={loading}>
            <span className='flex items-center gap-2'>
              Create Account
              <ArrowRight className='w-5 h-5' />
            </span>
          </Loader>
        </Button>
      </motion.div>
    )
  }

  if (currentStep === 1) {
    const handleContinue = async () => {
      const isValidForm = await trigger(['fullname', 'email', 'confirmEmail', 'password', 'confirmPassword'])

      if (!isValidForm) {
        if (errors.fullname) {
          toast.error('Invalid Name', { description: errors.fullname.message as string })
        } else if (errors.email) {
          toast.error('Invalid Email', { description: errors.email.message as string })
        } else if (errors.confirmEmail) {
          toast.error('Email Mismatch', { description: errors.confirmEmail.message as string })
        } else if (errors.password) {
          toast.error('Invalid Password', { description: errors.password.message as string })
        } else if (errors.confirmPassword) {
          toast.error('Password Mismatch', { description: errors.confirmPassword.message as string })
        }
        return
      }

      const values = getValues()
      await onGenerateOTP(values.email, values.password, setCurrentStep)
    }

    const allFieldsFilled = fullname && email && confirmEmail && password && confirmPassword

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='w-full flex flex-col gap-4 mt-6'
      >
        <Button
          type='button'
          onClick={handleContinue}
          disabled={loading || !allFieldsFilled}
          className='w-full h-14 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold text-lg rounded-xl shadow-2xl shadow-[var(--primary)]/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
        >
          <Loader loading={loading}>
            <span className='flex items-center gap-2'>
              Continue
              <ArrowRight className='w-5 h-5' />
            </span>
          </Loader>
        </Button>

        <p className='text-center text-[var(--text-muted)] text-sm'>
          Already have an account?{' '}
          <Link
            href='/auth/sign-in'
            className='text-[var(--primary)] hover:text-[var(--primary-hover)] font-semibold transition-colors underline decoration-[var(--primary)]/30 hover:decoration-[var(--primary-hover)] underline-offset-4'
          >
            Sign In
          </Link>
        </p>
      </motion.div>
    )
  }

  return null
}

export default ButtonHandler
