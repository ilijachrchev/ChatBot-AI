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
        'border-[var(--warning)] dark:border-[var(--warning)]',
        'from-[rgba(224,155,26,0.08)] to-[rgba(224,155,26,0.15)]',
        className
      )}
    >
      <div className='flex items-start gap-3 mb-3'>
        <div className='w-8 h-8 rounded-lg bg-[var(--warning)] dark:bg-[var(--warning)] flex items-center justify-center flex-shrink-0'>
          <Clock className='w-4 h-4 text-[var(--warning)] dark:text-[var(--warning)]' />
        </div>
        <div className='flex-1'>
          <h4 className='text-sm font-semibold text-[var(--warning)] dark:text-[var(--warning)] mb-1'>
            We're Currently Offline
          </h4>
          <p className='text-xs text-[var(--warning)] dark:text-[var(--warning)] whitespace-pre-line'>
            {message}
          </p>
        </div>
      </div>

      {shouldCollectEmail && !submitted && (
        <form onSubmit={handleSubmit} className='mt-3'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Mail className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--warning)]' />
              <Input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='your@email.com'
                required
                className='pl-9 h-9 text-sm border-[var(--warning)] dark:border-[var(--warning)] focus:border-[var(--warning)] dark:focus:border-[var(--warning)]'
              />
            </div>
            <Button
              type='submit'
              size='sm'
              className='h-9 bg-[var(--warning)] hover:bg-[var(--warning)] text-white'
            >
              <Send className='w-3.5 h-3.5 mr-1.5' />
              Send
            </Button>
          </div>
        </form>
      )}

      {submitted && (
        <div className='mt-3 p-3 rounded-lg bg-[var(--success)] dark:bg-[var(--success)] border border-[var(--success)] dark:border-[var(--success)]'>
          <p className='text-xs text-[var(--success)] dark:text-[var(--success)] font-medium'>
            ✓ Thanks! We'll contact you at {email} during business hours.
          </p>
        </div>
      )}
    </div>
  )
}