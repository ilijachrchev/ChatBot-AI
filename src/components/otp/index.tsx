'use client'
import React, { useRef, useState, useEffect } from 'react'
import { Input } from '../ui/input' 
import { motion } from 'framer-motion'

type Props = {
  otp: string
  setOtp: React.Dispatch<React.SetStateAction<string>>
}

const OTPInput = ({ otp, setOtp }: Props) => {
  const [activeInput, setActiveInput] = useState<number>(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const OTP_LENGTH = 6

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value
    
    if (isNaN(Number(value))) return

    const newOTP = otp.split('')
    newOTP[index] = value
    setOtp(newOTP.join(''))

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
      setActiveInput(index + 1)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      
      const newOTP = otp.split('')
      
      if (otp[index]) {
        newOTP[index] = ''
        setOtp(newOTP.join(''))
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
        setActiveInput(index - 1)
        newOTP[index - 1] = ''
        setOtp(newOTP.join(''))
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setActiveInput(index - 1)
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
      setActiveInput(index + 1)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text/plain').slice(0, OTP_LENGTH)
    
    if (/^\d+$/.test(pastedData)) {
      setOtp(pastedData.padEnd(OTP_LENGTH, ''))
      const lastFilledIndex = Math.min(pastedData.length, OTP_LENGTH - 1)
      inputRefs.current[lastFilledIndex]?.focus()
      setActiveInput(lastFilledIndex)
    }
  }

  return (
    <div className='flex gap-3 justify-center'>
      {Array.from({ length: OTP_LENGTH }, (_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Input
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type='text'
            inputMode='numeric'
            maxLength={1}
            value={otp[index] || ''}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            onFocus={() => setActiveInput(index)}
            className={`
              w-12 h-14 text-center text-2xl font-bold
              bg-white/5 border-2 rounded-xl
              transition-all duration-200
              focus:scale-110
              ${
                activeInput === index
                  ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/25'
                  : otp[index]
                  ? 'border-white/20 bg-white/10'
                  : 'border-white/10'
              }
              text-white
              focus-visible:ring-0 focus-visible:ring-offset-0
            `}
          />
        </motion.div>
      ))}
    </div>
  )
}

export default OTPInput