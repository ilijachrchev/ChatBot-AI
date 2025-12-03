import { UserLoginProps, UserLoginSchema } from '@/schemas/auth.schema'
import { useSignIn } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { toast } from 'sonner'

export const useSignInForm = () => {
  const { isLoaded, setActive, signIn } = useSignIn()
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  const methods = useForm<UserLoginProps>({
    resolver: zodResolver(UserLoginSchema as any) as Resolver<UserLoginProps>,
    mode: 'onChange',
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
        toast.success('Welcome back! 🎉', {
          description: 'Redirecting to dashboard...',
        })
        
        await setActive({ session: authenticated.createdSessionId })
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 500)
      } else {
        toast.error('Sign-in not completed. Please try again.')
        setLoading(false)
      }
    } catch (error: any) {
      setLoading(false)
      console.error('Sign-in error:', error)
      
      const code = error?.errors?.[0]?.code
      const message = error?.errors?.[0]?.message
      
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