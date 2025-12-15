'use client'

import React, { useState } from 'react'
import { Clock, Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input' 
import { cn } from '@/lib/utils'

interface OfflineMessageProps {
  message: string
  shouldCollectEmail: boolean
  onEmailSubmit?: (email: string) => void
  className?: string
}

export function OfflineMessage({
  message,
  shouldCollectEmail,
  onEmailSubmit,
  className,
}: OfflineMessageProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && onEmailSubmit) {
      onEmailSubmit(email)
      setSubmitted(true)
    }
  }

  return (
    <div
      className={cn(
        'p-4 rounded-xl border-2 border-dashed bg-gradient-to-br',
        'border-amber-200 dark:border-amber-800',
        'from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
        className
      )}
    >
      <div className='flex items-start gap-3 mb-3'>
        <div className='w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0'>
          <Clock className='w-4 h-4 text-amber-600 dark:text-amber-400' />
        </div>
        <div className='flex-1'>
          <h4 className='text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1'>
            We're Currently Offline
          </h4>
          <p className='text-xs text-amber-700 dark:text-amber-300 whitespace-pre-line'>
            {message}
          </p>
        </div>
      </div>

      {shouldCollectEmail && !submitted && (
        <form onSubmit={handleSubmit} className='mt-3'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500' />
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='your@email.com'
                required
                className='pl-9 h-9 text-sm border-amber-200 dark:border-amber-800 focus:border-amber-400 dark:focus:border-amber-600'
              />
            </div>
            <Button
              type='submit'
              size='sm'
              className='h-9 bg-amber-600 hover:bg-amber-700 text-white'
            >
              <Send className='w-3.5 h-3.5 mr-1.5' />
              Send
            </Button>
          </div>
        </form>
      )}

      {submitted && (
        <div className='mt-3 p-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800'>
          <p className='text-xs text-green-700 dark:text-green-300 font-medium'>
            ✓ Thanks! We'll contact you at {email} during business hours.
          </p>
        </div>
      )}
    </div>
  )
}