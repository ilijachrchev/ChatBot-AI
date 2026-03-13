'use client'

import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { cn } from '@/lib/utils'
import { onSubmitConversationRating } from '@/actions/ratings'

type Props = {
  chatRoomId: string
  domainId: string
  theme?: string | null
  botIcon?: string
  onRated: () => void
}

type Step = 'prompt' | 'feedback' | 'done'

const RatingPrompt = ({ chatRoomId, domainId, botIcon, onRated }: Props) => {
  const [step, setStep] = useState<Step>('prompt')
  const [selected, setSelected] = useState<'POSITIVE' | 'NEGATIVE' | null>(null)
  const [feedback, setFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (step === 'done') {
      const t = setTimeout(() => onRated(), 500)
      return () => clearTimeout(t)
    }
  }, [step, onRated])

  const submitRating = async (rating: 'POSITIVE' | 'NEGATIVE', text?: string) => {
    setSubmitting(true)
    await onSubmitConversationRating(chatRoomId, domainId, rating, text)
    setSubmitting(false)
    setStep('done')
  }

  const handlePositive = async () => {
    setSelected('POSITIVE')
    await submitRating('POSITIVE')
  }

  const handleNegative = () => {
    setSelected('NEGATIVE')
    setStep('feedback')
  }

  const handleSkip = async () => {
    await submitRating('NEGATIVE')
  }

  const handleSubmitFeedback = async () => {
    await submitRating('NEGATIVE', feedback.trim() || undefined)
  }

  return (
    <div className="flex gap-2 items-end self-start animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
      <Avatar className="w-6 h-6 flex-shrink-0 border border-[var(--border)]">
        {botIcon ? (
          <AvatarImage src={botIcon} alt="bot" className="object-cover" />
        ) : (
          <>
            <AvatarImage src="https://github.com/shadcn.png" alt="bot" />
            <AvatarFallback className="bg-indigo-100 text-indigo-600 text-[10px]">AI</AvatarFallback>
          </>
        )}
      </Avatar>

      {step === 'prompt' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl rounded-bl-sm px-4 py-3 max-w-[85%]">
          <p className="text-sm font-medium text-[var(--text-primary)]">Was this conversation helpful?</p>
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={handlePositive}
              className={cn(
                'bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150',
                selected === 'POSITIVE'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'hover:border-green-400 hover:bg-green-50'
              )}
            >
              👍 Yes
            </button>
            <button
              type="button"
              onClick={handleNegative}
              className={cn(
                'bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150',
                selected === 'NEGATIVE'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'hover:border-red-400 hover:bg-red-50'
              )}
            >
              👎 No
            </button>
          </div>
        </div>
      )}

      {step === 'feedback' && (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl rounded-bl-sm px-4 py-3 max-w-[85%] animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
          <p className="text-sm font-medium text-[var(--text-primary)]">👎 Sorry to hear that!</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">What could we improve?</p>
          <textarea
            className="mt-3 w-full text-sm bg-[var(--bg-surface)] border border-[var(--border)] rounded-lg px-3 py-2 resize-none focus:ring-2 focus:ring-red-200 focus:border-red-300 outline-none"
            rows={3}
            placeholder="Tell us what went wrong or what information was missing..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value.slice(0, 500))}
          />
          <p className="text-xs text-[var(--text-muted)] text-right mt-1">{feedback.length}/500</p>
          <div className="flex items-center justify-between mt-3">
            <button
              type="button"
              onClick={handleSkip}
              disabled={submitting}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSubmitFeedback}
              disabled={submitting}
              className="bg-red-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-600 disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit feedback'}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div
          className={cn(
            'border rounded-xl rounded-bl-sm px-4 py-3 max-w-[85%] animate-in fade-in-0 slide-in-from-bottom-2 duration-500',
            selected === 'POSITIVE'
              ? 'bg-green-50 border-green-200'
              : 'bg-[var(--bg-card)] border-[var(--border)]'
          )}
        >
          {selected === 'POSITIVE' ? (
            <p className="text-sm font-medium text-green-700">🎉 Thank you for the feedback!</p>
          ) : (
            <>
              <p className="text-sm font-medium text-[var(--text-primary)]">Thank you for letting us know.</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Your feedback helps us improve.</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default RatingPrompt
