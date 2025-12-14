'use client'
import React, { useState } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
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
  userTimezone = 'UTC' 
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
        await onSchedule(
          campaignId, 
          { date: selectedDate, time: selectedTime },
          userTimezone
        )
      } else {
        await onSchedule(campaignId, null, userTimezone)
      }
      onClose()
    } catch (error) {
      console.error('❌ Error in handleSubmit:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
        <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
            Your timezone: {userTimezone}
          </p>
          <p className="text-xs text-blue-700 dark:text-blue-300">
            All times shown in your local timezone
          </p>
        </div>
      </div>

      <RadioGroup value={sendType} onValueChange={(value: any) => setSendType(value)}>
        <div className="space-y-3">
          <div
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
              sendType === 'immediate'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
            )}
            onClick={() => setSendType('immediate')}
          >
            <RadioGroupItem value="immediate" id="immediate" />
            <div className="flex-1">
              <Label htmlFor="immediate" className="cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Send className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-slate-950 dark:text-white">
                    Send Immediately
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Campaign will be sent right away to all recipients
                </p>
              </Label>
            </div>
          </div>

          <div
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
              sendType === 'scheduled'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'
            )}
            onClick={() => setSendType('scheduled')}
          >
            <RadioGroupItem value="scheduled" id="scheduled" />
            <div className="flex-1">
              <Label htmlFor="scheduled" className="cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold text-slate-950 dark:text-white">
                    Schedule for Later
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Choose a specific date and time to send
                </p>
              </Label>
            </div>
          </div>
        </div>
      </RadioGroup>

      {sendType === 'scheduled' && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="mb-4">
              <Label className="text-sm font-medium mb-2 block">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Select Date
                </div>
              </Label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              >
                <option value="">Choose a date...</option>
                {dateOptions.map((date) => (
                  <option
                    key={date.toISOString()}
                    value={date.toISOString().split('T')[0]}
                  >
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
              <Label className="text-sm font-medium mb-2 block">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Select Time ({userTimezone})
                </div>
              </Label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                disabled={!selectedDate}
                className="w-full h-11 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-950 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="mt-4 space-y-2">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    📅 Campaign will send at:
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1 font-semibold">
                    {selectedDate} at {selectedTime} {userTimezone}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={loading || (sendType === 'scheduled' && (!selectedDate || !selectedTime))}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
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