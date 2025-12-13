'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import OTPInput from '@/components/otp'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { onVerifyLoginOTPWithToken, onResendLoginOTP } from '@/actions/auth'
import Cookies from 'js-cookie'

type Props = {
  token: string
}

export function VerifyLoginClient({ token }: Props) {
  const [otp, setOtp] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [resending, setResending] = useState<boolean>(false)
  const router = useRouter()

  const getEmailFromToken = () => {
    try {
      const decoded = JSON.parse(atob(token))
      return decoded.email || ''
    } catch {
      return ''
    }
  }

  const email = getEmailFromToken()

  const onVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit code')
      return
    }

    try {
      setLoading(true)

      const deviceId = Cookies.get('device_id')
      const verification = await onVerifyLoginOTPWithToken(token, otp, deviceId || null)

      if (!verification.success) {
        toast.error('Verification failed', {
          description: verification.error || 'Invalid code',
        })
        setLoading(false)
        return
      }

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

  const handleResend = async () => {
    try {
      setResending(true)
      
      const result = await onResendLoginOTP(token)

      if (!result.success) {
        toast.error('Failed to resend code', {
          description: result.error || 'Please try again later',
        })
        setResending(false)
        return
      }

      toast.success('Code sent!', {
        description: 'A new verification code has been sent to your email',
      })
      
      setOtp('')
      setResending(false)
    } catch (error) {
      console.error('Resend error:', error)
      toast.error('Failed to resend code')
      setResending(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='space-y-6'
    >
      <div className='flex justify-center'>
        <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/25'>
          <Mail className='w-8 h-8 text-white' />
        </div>
      </div>

      <div className='space-y-2 text-center'>
        <h2 className='text-2xl font-bold text-white'>Enter Verification Code</h2>
        <p className='text-slate-400'>
          We've sent a 6-digit code to
        </p>
        {email && (
          <p className='text-blue-400 font-medium'>{email}</p>
        )}
      </div>

      <div className='w-full flex justify-center py-4'>
        <OTPInput
          otp={otp}
          setOtp={setOtp}
        />
      </div>

      <Button
        type='button'
        onClick={onVerify}
        disabled={loading || otp.length !== 6}
        className='w-full h-12 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? (
          <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
        ) : (
          'Verify & Continue'
        )}
      </Button>

      <div className='space-y-3'>
        <div className='text-center'>
          <p className='text-sm text-slate-400'>
            Didn't receive the code?{' '}
            <button
              type='button'
              onClick={handleResend}
              disabled={loading || resending}
              className='text-blue-500 hover:text-blue-400 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {resending ? 'Sending...' : 'Resend'}
            </button>
          </p>
        </div>

        <div className='text-center'>
          <button
            type='button'
            onClick={() => router.push('/auth/sign-in')}
            className='text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center gap-2'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to sign in
          </button>
        </div>
      </div>

      <div className='mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl'>
        <p className='text-sm text-amber-400 text-center'>
          <strong>⚠️ Security Alert:</strong> We detected a login from a new device or location.
        </p>
      </div>
    </motion.div>
  )
}