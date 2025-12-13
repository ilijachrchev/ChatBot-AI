import { UserLoginProps, UserLoginSchema } from '@/schemas/auth.schema'
import { useSignIn, useAuth } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { onSaveKeepMeLoggedInOnLogin } from '@/actions/settings'
import { onCheckLoginRisk, onVerifyLoginOTP } from '@/actions/auth'
import Cookies from 'js-cookie'

export const useSignInForm = () => {
  const { isLoaded, setActive, signIn } = useSignIn()
  const [loading, setLoading] = useState<boolean>(false)
  const [showOtpForm, setShowOtpForm] = useState<boolean>(false)
  const [otp, setOtp] = useState<string>('')
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null)
  const [pendingEmail, setPendingEmail] = useState<string>('')
  const router = useRouter()

  const methods = useForm<UserLoginProps>({
    resolver: zodResolver(UserLoginSchema as any),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      keepMeLoggedIn: false,
    },
  })

  const onHandleSubmit = methods.handleSubmit(async (values) => {
    if (!isLoaded || !signIn) return

    try {
      setLoading(true)
      
      const authenticated = await signIn.create({
        identifier: values.email,
        password: values.password,
      })

      if (authenticated.status === 'complete') {
        if (authenticated.createdSessionId && setActive) {
          await setActive({ session: authenticated.createdSessionId })
        }

        const response = await fetch('/api/auth/get-clerk-id', {
          method: 'GET',
        })
        
        if (!response.ok) {
          toast.error('Authentication error')
          setLoading(false)
          return
        }

        const { clerkId } = await response.json()

        let deviceId = Cookies.get('device_id')
        if (!deviceId) {
          deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
          Cookies.set('device_id', deviceId, { expires: 365 })
        }

        const riskCheck = await onCheckLoginRisk(
          clerkId,
          values.email,
          deviceId
        )

        if (riskCheck.requireOtp && riskCheck.userId) {
          setPendingUserId(riskCheck.userId)
          setPendingSessionId(authenticated.createdSessionId || null)
          setPendingEmail(values.email)
          setShowOtpForm(true)
          setLoading(false)
          
          toast.info('Security verification required', {
            description: riskCheck.reason || 'Please check your email for a verification code',
          })
          return
        }

        await onSaveKeepMeLoggedInOnLogin(values.keepMeLoggedIn)
        
        toast.success('Welcome back! 🎉', {
          description: 'Redirecting to dashboard...',
        })
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      } else {
        toast.error('Sign-in not completed. Please try again.')
        setLoading(false)
      }
    } catch (error: unknown) {
      const err = error as { 
        errors?: Array<{ 
          code?: string
          message?: string 
        }> 
      }
      setLoading(false)
      console.error('Sign-in error:', error)
      
      const code = err?.errors?.[0]?.code
      const message = err?.errors?.[0]?.message
      
      if (code === 'form_password_incorrect') {
        toast.error('Incorrect credentials', {
          description: 'Email or password is incorrect. Try again.',
        })
      } else if (code === 'form_identifier_not_found') {
        toast.error('Account not found', {
          description: 'No account exists with this email.',
        })
      } else {
        toast.error('Something went wrong', {
          description: message || 'Please try again later.',
        })
      }
    }
  })

  const onVerifyOtp = async () => {
    if (!pendingUserId || !pendingSessionId || otp.length !== 6) {
      toast.error('Please enter the 6-digit code')
      return
    }

    try {
      setLoading(true)

      const deviceId = Cookies.get('device_id')
      const verification = await onVerifyLoginOTP(pendingUserId, otp, deviceId || null)

      if (!verification.success) {
        toast.error('Verification failed', {
          description: verification.error || 'Invalid code',
        })
        setLoading(false)
        return
      }

      if (setActive) {
        await setActive({ session: pendingSessionId })
      }
      await onSaveKeepMeLoggedInOnLogin(methods.getValues('keepMeLoggedIn'))

      toast.success('Verified successfully! 🎉', {
        description: 'Redirecting to dashboard...',
      })

      setTimeout(() => {
        router.push('/dashboard')
      }, 500)
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error('Verification failed', {
        description: 'Please try again',
      })
      setLoading(false)
    }
  }

  return {
    methods,
    onHandleSubmit,
    loading,
    showOtpForm,
    otp,
    setOtp,
    onVerifyOtp,
    pendingEmail,
  }
}