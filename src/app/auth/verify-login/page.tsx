import { redirect } from 'next/navigation'
import { VerifyLoginClient } from './verify-login-client'

type Props = {
  searchParams: {
    token?: string
  }
}

const VerifyLoginPage = async ({ searchParams }: Props) => {
  const token = searchParams.token

  if (!token) {
    redirect('/auth/sign-in')
  }

  return (
    <div className='w-full'>
      <div className='space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-4xl font-bold text-white'>
            Security Verification
          </h1>
          <p className='text-slate-400'>
            We detected unusual activity on your account
          </p>
        </div>

        <div className='rounded-2xl bg-[#1A1F2E]/50 backdrop-blur-xl border border-white/10 p-8 shadow-2xl'>
          <VerifyLoginClient token={token} />
        </div>
      </div>
    </div>
  )
}

export default VerifyLoginPage