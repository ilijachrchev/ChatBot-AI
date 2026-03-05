'use client'
import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Loader } from '../loader'
import { cn } from '@/lib/utils'
import { Calendar, Sparkles } from 'lucide-react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const FREQUENCIES = ['DAILY', 'WEEKLY', 'MONTHLY'] as const

type RecurringCampaignModalProps = {
  open: boolean
  onClose: () => void
  selectedCount: number
  onSubmit: (
    name: string,
    template: string,
    recurringType: 'DAILY' | 'WEEKLY' | 'MONTHLY',
    recurringTime: string,
    recurringDay?: number
  ) => Promise<void>
  loading: boolean
}

export const RecurringCampaignModal = ({
  open,
  onClose,
  selectedCount,
  onSubmit,
  loading,
}: RecurringCampaignModalProps) => {
  const [name, setName] = useState('')
  const [template, setTemplate] = useState('')
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY')
  const [sendTime, setSendTime] = useState('09:00')
  const [selectedDay, setSelectedDay] = useState(1)
  const [monthlyDay, setMonthlyDay] = useState(1)
  const [aiLoading, setAiLoading] = useState(false)

  const handleClose = () => {
    setName('')
    setTemplate('')
    setFrequency('DAILY')
    setSendTime('09:00')
    setSelectedDay(1)
    setMonthlyDay(1)
    onClose()
  }

  const handleAiEnhance = async () => {
    if (!template.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai-enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: template }),
      })
      const data = await res.json()
      if (data.text) setTemplate(data.text)
    } catch {}
    setAiLoading(false)
  }

  const handleSubmit = async () => {
    if (!name.trim() || !template.trim() || !sendTime) return
    const recurringDay =
      frequency === 'WEEKLY' ? selectedDay : frequency === 'MONTHLY' ? monthlyDay : undefined
    await onSubmit(name, template, frequency, sendTime, recurringDay)
    handleClose()
  }

  const getOrdinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
  }

  const formatTime = (time: string) => {
    if (!time) return '[time]'
    const [h, m] = time.split(':').map(Number)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`
  }

  const getPreviewText = () => {
    const t = formatTime(sendTime)
    if (frequency === 'DAILY')
      return `Every day at ${t} UTC to ${selectedCount} customer${selectedCount !== 1 ? 's' : ''}`
    if (frequency === 'WEEKLY')
      return `Every ${DAYS[selectedDay]} at ${t} UTC to ${selectedCount} customer${selectedCount !== 1 ? 's' : ''}`
    if (frequency === 'MONTHLY')
      return `Every ${monthlyDay}${getOrdinal(monthlyDay)} of the month at ${t} UTC to ${selectedCount} customer${selectedCount !== 1 ? 's' : ''}`
    return ''
  }

  const isValid = name.trim().length > 0 && template.trim().length > 0 && sendTime.length > 0

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            Create Recurring Campaign
          </DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Automatically send this campaign on a schedule
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Campaign name
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Weekly Newsletter"
              className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 dark:focus-visible:border-white"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Email message
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAiEnhance}
                disabled={aiLoading || !template.trim()}
                className="h-7 text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                {aiLoading ? 'Writing...' : 'Write with AI'}
              </Button>
            </div>
            <Textarea
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="Write your email message..."
              className="min-h-[140px] resize-none border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 dark:focus-visible:border-white"
            />
            <div className="text-right text-xs text-slate-400">{template.length} characters</div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Frequency
            </Label>
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
              {FREQUENCIES.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  className={cn(
                    'flex-1 py-2 text-sm font-medium transition-all',
                    frequency === f
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
                  )}
                >
                  {f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Send time (UTC)
            </Label>
            <Input
              type="time"
              value={sendTime}
              onChange={(e) => setSendTime(e.target.value)}
              className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 dark:focus-visible:border-white"
            />
          </div>

          {frequency === 'WEEKLY' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Day of week
              </Label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((day, i) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(i)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                      selectedDay === i
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                        : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {frequency === 'MONTHLY' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Day of month (1–31)
              </Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={monthlyDay}
                onChange={(e) =>
                  setMonthlyDay(Math.min(31, Math.max(1, parseInt(e.target.value) || 1)))
                }
                className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-slate-900 dark:focus-visible:border-white"
              />
            </div>
          )}

          <div className="rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {selectedCount === 0
                ? 'Select customers first to preview the schedule'
                : getPreviewText()}
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isValid || loading || selectedCount === 0}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-semibold h-11"
          >
            <Loader loading={loading}>
              <Calendar className="h-4 w-4 mr-2" />
              Create Recurring Campaign
            </Loader>
          </Button>

          {selectedCount === 0 && (
            <p className="text-xs text-center text-slate-500">
              Select customers on the left to create a campaign
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
