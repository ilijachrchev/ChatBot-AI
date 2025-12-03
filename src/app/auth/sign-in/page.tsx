import SignInFormProvider from '@/components/forms/sign-in/form-provider'
import LoginForm from '@/components/forms/sign-in/login-form'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

const SignInPage = async () => {
  const { userId } = await auth()
  if (userId) redirect("/dashboard")

  return (
    <div className="w-full">
      <SignInFormProvider>
        <div className="space-y-6">
          <div className='space-y-2'>
            <h1 className='text-4xl font-bold text-white'>
              Welcome back
            </h1>
            <p className='text-slate-400'>
              Sign in to your account to continue
            </p>
          </div>

          <div className='rounded-2xl bg-[#1A1F2E]/50 backdrop-blur-xl border border-white/10 p-8 shadow-2xl'>
            <LoginForm />
          </div>
        </div>
      </SignInFormProvider>
    </div>
  )
}

export default SignInPage