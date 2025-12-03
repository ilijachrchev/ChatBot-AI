'use client'
import { useAuthContextHook } from '@/context/use-auth-context'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowLeft } from 'lucide-react'
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

  if (currentStep === 3) {
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
          className='w-full h-14 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-2xl shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40'
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

  if (currentStep === 2) {
    const handleContinue = async () => {
      const isValidForm = await trigger(['fullname', 'email', 'confirmEmail', 'password', 'confirmPassword'])
      
      if (!isValidForm) {
        if (errors.fullname) {
          toast.error('Invalid Name', {
            description: errors.fullname.message as string,
          })
        } else if (errors.email) {
          toast.error('Invalid Email', {
            description: errors.email.message as string,
          })
        } else if (errors.confirmEmail) {
          toast.error('Email Mismatch', {
            description: errors.confirmEmail.message as string,
          })
        } else if (errors.password) {
          toast.error('Invalid Password', {
            description: errors.password.message as string,
          })
        } else if (errors.confirmPassword) {
          toast.error('Password Mismatch', {
            description: errors.confirmPassword.message as string,
          })
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
        className='w-full flex gap-3 mt-6'
      >
        <Button
          type='button'
          onClick={() => setCurrentStep(1)}
          className='flex-1 h-14 bg-white/5 hover:bg-white/10 text-white font-semibold text-lg rounded-xl border-2 border-white/10 hover:border-white/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg'
        >
          <ArrowLeft className='w-5 h-5 mr-2' />
          Back
        </Button>
        
        <Button
          type='button'
          onClick={handleContinue}
          disabled={loading || !allFieldsFilled}
          className='flex-[2] h-14 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-2xl shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100'
        >
          <Loader loading={loading}>
            <span className='flex items-center gap-2'>
              Continue
              <ArrowRight className='w-5 h-5' />
            </span>
          </Loader>
        </Button>
      </motion.div>
    )
  }

  const handleStep1Continue = async () => {
    const isValidType = await trigger('type')
    
    if (!isValidType) {
      toast.error('Please select an account type', {
        description: 'Choose whether you own a business or are a student',
      })
      return
    }
    
    setCurrentStep(2)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='w-full flex flex-col gap-4 mt-6'
    >
      <Button
        type='button'
        onClick={handleStep1Continue}
        className='w-full h-14 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-purple-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl shadow-2xl shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group'
      >
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700' />
        
        <span className='relative flex items-center gap-2'>
          Continue
          <ArrowRight className='w-5 h-5 transition-transform group-hover:translate-x-1' />
        </span>
      </Button>
      
      <p className='text-center text-slate-400 text-sm'>
        Already have an account?{' '}
        <Link
          href='/auth/sign-in'
          className='text-blue-400 hover:text-blue-300 font-semibold transition-colors underline decoration-blue-400/30 hover:decoration-blue-300 underline-offset-4'
        >
          Sign In
        </Link>
      </p>
    </motion.div>
  )
}

export default ButtonHandler