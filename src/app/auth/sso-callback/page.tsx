import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { Spinner } from '@/components/spinner'

export default function SSOCallback() {
  return (
    <div className='w-full h-screen flex items-center justify-center'>
      <div className='text-center space-y-4'>
        <Spinner />
        <p className='text-slate-400'>Completing sign in...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  )
}