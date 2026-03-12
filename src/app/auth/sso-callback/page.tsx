import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'
import { Spinner } from '@/components/spinner'

export default function SSOCallback() {
  return (
    <div className='w-full h-screen flex items-center justify-center'>
      <div className='text-center space-y-4'>
        <Spinner />
        <p className='text-[var(--text-muted)]'>Completing sign in...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  )
}