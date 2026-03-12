'use client'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Calendar, Clock, Send, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

type ScheduleEmailProps = {
  campaignId: string
  onSchedule: (
    campaignId: string,
    scheduledAt: { date: string; time: string } | null,
    timezone: string
  ) => Promise<void>
  onClose: () => void
  userTimezone?: string
}

export const ScheduleEmail = ({
  campaignId,
  onSchedule,
  onClose,
  userTimezone = 'UTC',
}: ScheduleEmailProps) => {
  const [sendType, setSendType] = useState<'immediate' | 'scheduled'>('immediate')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const dateOptions = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return date
  })

  const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const hours = Math.floor(i / 2)
    const minutes = i % 2 === 0 ? '00' : '30'
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return {
      value: `${hours.toString().padStart(2, '0')}:${minutes}`,
      label: `${displayHours}:${minutes} ${ampm}`,
    }
  })

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (sendType === 'scheduled' && selectedDate && selectedTime) {
        await onSchedule(campaignId, { date: selectedDate, time: selectedTime }, userTimezone)
      } else {
        await onSchedule(campaignId, null, userTimezone)
      }
      onClose()
    } catch (error) {
      console.error('Error in handleSubmit:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-slate-50 dark:bg-[var(--bg-page)]/50 border border-[var(--border-default)]">
        <Globe className="h-4 w-4 text-slate-500 dark:text-[var(--text-secondary)]" />
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--text-primary)]">
            Your timezone: {userTimezone}
          </p>
          <p className="text-xs text-slate-500 dark:text-[var(--text-secondary)]">
            All times shown in your local timezone
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div
          className={cn(
            'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
            sendType === 'immediate'
              ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-[var(--bg-page)]/50'
              : 'border-[var(--border-default)] hover:border-slate-400 dark:hover:border-slate-600'
          )}
          onClick={() => setSendType('immediate')}
        >
          <div
            className={cn(
              'mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 transition-all',
              sendType === 'immediate'
                ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white'
                : 'border-[var(--border-strong)]'
            )}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Send className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="font-semibold text-[var(--text-primary)]">
                Send Immediately
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-[var(--text-secondary)]">
              Campaign will be sent right away to all recipients
            </p>
          </div>
        </div>

        <div
          className={cn(
            'flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all',
            sendType === 'scheduled'
              ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-[var(--bg-page)]/50'
              : 'border-[var(--border-default)] hover:border-slate-400 dark:hover:border-slate-600'
          )}
          onClick={() => setSendType('scheduled')}
        >
          <div
            className={cn(
              'mt-0.5 h-4 w-4 rounded-full border-2 flex-shrink-0 transition-all',
              sendType === 'scheduled'
                ? 'border-slate-900 dark:border-white bg-slate-900 dark:bg-white'
                : 'border-[var(--border-strong)]'
            )}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="font-semibold text-[var(--text-primary)]">
                Schedule for Later
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-[var(--text-secondary)]">
              Choose a specific date and time to send
            </p>
          </div>
        </div>
      </div>

      {sendType === 'scheduled' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-[var(--bg-page)] border border-[var(--border-default)]">
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Select Date
                </div>
              </Label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-[var(--border-default)] dark:border-[var(--border-strong)] bg-[var(--bg-page)] text-[var(--text-primary)] outline-none focus:border-slate-900 dark:focus:border-white transition-all"
              >
                <option value="">Choose a date...</option>
                {dateOptions.map((date) => (
                  <option key={date.toISOString()} value={date.toISOString().split('T')[0]}>
                    {date.toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Select Time ({userTimezone})
                </div>
              </Label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedDate}
                className="w-full h-11 px-3 rounded-lg border border-[var(--border-default)] dark:border-[var(--border-strong)] bg-[var(--bg-page)] text-[var(--text-primary)] outline-none focus:border-slate-900 dark:focus:border-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Choose a time...</option>
                {timeOptions.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedDate && selectedTime && (
              <div className="mt-4 p-3 rounded-lg bg-slate-100 dark:bg-[var(--bg-surface)] border border-[var(--border-default)] dark:border-[var(--border-strong)]">
                <p className="text-sm font-medium text-[var(--text-primary)]">
                  Campaign will send at:
                </p>
                <p className="text-sm text-[var(--text-secondary)] mt-0.5 font-semibold">
                  {selectedDate} at {selectedTime} {userTimezone}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-[var(--border-default)]">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1 border-[var(--border-default)] hover:bg-[var(--bg-hover)]"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading || (sendType === 'scheduled' && (!selectedDate || !selectedTime))}
          className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold"
        >
          {loading ? (
            'Processing...'
          ) : sendType === 'immediate' ? (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Now
            </>
          ) : (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Campaign
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
