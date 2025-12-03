'use client'
import React from 'react'
import { motion } from 'framer-motion'
import OTPInput from '@/components/otp'
import { Mail } from 'lucide-react'

type Props = {
    setOTP: React.Dispatch<React.SetStateAction<string>>
    onOTP: string
}

const OTPForm = ({ onOTP, setOTP }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className='space-y-6'
    >
      <div className='flex justify-center'>
        <div className='w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center'>
          <Mail className='w-8 h-8 text-white' />
        </div>
      </div>

      <div className='space-y-2 text-center'>
        <h2 className='text-3xl font-bold text-white'>Enter OTP</h2>
        <p className='text-slate-400'>
          Enter the one-time password sent to your email address
        </p>
      </div>

      <div className='w-full flex justify-center py-4'>
        <OTPInput
          otp={onOTP}
          setOtp={setOTP}
        />
      </div>

      <div className='text-center'>
        <p className='text-sm text-slate-400'>
          Didn't receive the code?{' '}
          <button className='text-blue-500 hover:text-blue-400 font-semibold transition-colors'>
            Resend
          </button>
        </p>
      </div>
    </motion.div>
  )
}

export default OTPForm