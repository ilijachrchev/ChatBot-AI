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
        await setActive({ session: authenticated.createdSessionId })
        toast.success('Welcome back!')
        router.push('/dashboard')
      } else {
        toast.error('Sign-in not completed. Please try again.')
      }
    } catch (error: any) {
      const code = error?.errors?.[0]?.code
      if (code === 'form_password_incorrect') {
        toast.error('Email or password is incorrect. Try again.')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  })

  return {
    methods,
    onHandleSubmit,
    loading,
  }
}
