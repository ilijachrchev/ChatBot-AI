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
        <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--info)] flex items-center justify-center shadow-lg shadow-[var(--primary)]'>
          <Mail className='w-8 h-8 text-white' />
        </div>
      </div>

      <div className='space-y-2 text-center'>
        <h2 className='text-2xl font-bold text-white'>Enter Verification Code</h2>
        <p className='text-[var(--text-muted)]'>
          We've sent a 6-digit code to
        </p>
        {email && (
          <p className='text-[var(--primary)] font-medium'>{email}</p>
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
        className='w-full h-12 bg-gradient-to-r from-[var(--primary)] to-[var(--info)] hover:from-[var(--primary)] hover:to-[var(--info)] text-white font-semibold rounded-xl shadow-lg shadow-[var(--primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? (
          <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
        ) : (
          'Verify & Continue'
        )}
      </Button>

      <div className='space-y-3'>
        <div className='text-center'>
          <p className='text-sm text-[var(--text-muted)]'>
            Didn't receive the code?{' '}
            <button
              type='button'
              onClick={handleResend}
              disabled={loading || resending}
              className='text-[var(--primary)] hover:text-[var(--primary)] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {resending ? 'Sending...' : 'Resend'}
            </button>
          </p>
        </div>

        <div className='text-center'>
          <button
            type='button'
            onClick={() => router.push('/auth/sign-in')}
            className='text-sm text-[var(--text-muted)] hover:text-white transition-colors inline-flex items-center gap-2'
          >
            <ArrowLeft className='w-4 h-4' />
            Back to sign in
          </button>
        </div>
      </div>

      <div className='mt-6 p-4 bg-[var(--warning)] border border-[var(--warning)] rounded-xl'>
        <p className='text-sm text-[var(--warning)] text-center'>
          <strong>⚠️ Security Alert:</strong> We detected a login from a new device or location.
        </p>
      </div>
    </motion.div>
  )
}