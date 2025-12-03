import ButtonHandler from '@/components/forms/sign-up/button-handlers'
import SignUpFormProvider from '@/components/forms/sign-up/form-provider'
import HighLightBar from '@/components/forms/sign-up/highlight-bar'
import RegistrationFormStep from '@/components/forms/sign-up/registration-step'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import React from 'react'

const SignUp = async () => {
  const { userId } = await auth()
  if (userId) redirect("/")

  return (
    <div className='w-full'>
      <SignUpFormProvider>
        <div className='space-y-6'>
          <div id="clerk-captcha" />
          <div className='rounded-2xl bg-[#1A1F2E]/50 backdrop-blur-xl border border-white/10 p-8 shadow-2xl'>
            <RegistrationFormStep />
            <ButtonHandler />
          </div>
          
          <HighLightBar />
        </div>
      </SignUpFormProvider>
    </div>
  )
}

export default SignUp