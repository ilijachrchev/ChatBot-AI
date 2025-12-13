import { UserLoginProps, UserLoginSchema } from '@/schemas/auth.schema'
import { useSignIn } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { onSaveKeepMeLoggedInOnLogin } from '@/actions/settings'

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
    if (!isLoaded) return

    try {
      setLoading(true)
      
      const authenticated = await signIn.create({
        identifier: values.email,
        password: values.password,
      })

      if (authenticated.status === 'complete') {
        await setActive({ session: authenticated.createdSessionId })
        
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