import { UserLoginProps, UserLoginSchema } from '@/schemas/auth.schema'
import { useSignIn } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { onSaveKeepMeLoggedInOnLogin } from '@/actions/settings'
import { onCheckLoginRisk, onCreateOtpToken } from '@/actions/auth'
import Cookies from 'js-cookie'

export const useSignInForm = () => {
  const { isLoaded, setActive, signIn } = useSignIn()
  const [loading, setLoading] = useState<boolean>(false)
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

        const response = await fetch('/api/auth/get-clerk-id')
        if (!response.ok) {
          toast.error('Authentication error')
          setLoading(false)
          return
        }

        const { clerkId } = await response.json()

        let deviceId = Cookies.get('device_id')
        if (!deviceId) {
          deviceId = `device_${crypto.randomUUID()}`
          Cookies.set('device_id', deviceId, { expires: 365, secure: true, sameSite: 'strict' })
        }

        const riskCheck = await onCheckLoginRisk(clerkId, values.email, deviceId)

        if (riskCheck.requireOtp && riskCheck.userId) {
          const token = await onCreateOtpToken({
            userId: riskCheck.userId,
            email: values.email,
            sessionId: authenticated.createdSessionId ?? null,
            keepMeLoggedIn: values.keepMeLoggedIn,
          })
          router.push(
            `/auth/verify-login?token=${encodeURIComponent(token)}&email=${encodeURIComponent(values.email)}`
          )
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

  return {
    methods,
    onHandleSubmit,
    loading,
  }
}