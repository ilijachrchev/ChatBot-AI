'use client'

import React from 'react'
import { Clock, Settings, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useAvailability } from '@/hooks/domain/use-availability'

const TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' },
]

const DAYS = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
]

const OFFLINE_MODES = [
  { value: 'SHOW_OFFLINE_MESSAGE', label: 'Show offline message' },
  { value: 'COLLECT_EMAIL', label: 'Collect email for follow-up' },
  { value: 'SHOW_HOURS_AND_EMAIL', label: 'Show hours + collect email' },
  { value: 'AI_ONLY', label: 'AI continues (no human handoff)' },
]

interface AvailabilityTabProps {
  domainId: string
  timezone?: string
  workingHours?: any
  offlineBehavior?: string
  offlineMessage?: string
}

export function AvailabilityTab({
  domainId,
  timezone = 'UTC',
  workingHours,
  offlineBehavior = 'SHOW_HOURS_AND_EMAIL',
  offlineMessage = '',
}: AvailabilityTabProps) {
  const {
    formData,
    updateField,
    toggleDay,
    handleSave,
    handleDiscard,
    saving,
    isDirty,
  } = useAvailability(domainId, {
    workingHoursEnabled: workingHours?.enabled || false,
    timezone,
    startTime: workingHours?.mondayRanges?.[0]?.split('-')[0] || '09:00',
    endTime: workingHours?.mondayRanges?.[0]?.split('-')[1] || '18:00',
    activeDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].filter(
      (day) => !workingHours?.[`${day}Closed`]
    ),
    offlineBehavior,
    offlineMessage:
      offlineMessage ||
      "Thanks for reaching out! We're currently offline but will respond to your message as soon as we're back. Our working hours are Monday to Friday, 9 AM - 6 PM GMT.",
    notificationEmail: '',
  })

  return (
    <div className='space-y-6 max-w-5xl'>
      <Card className='border-slate-200 dark:border-slate-800'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
              <Clock className='w-5 h-5 text-blue-600 dark:text-blue-400' />
            </div>
            <div>
              <CardTitle className='text-lg'>Working Hours</CardTitle>
              <CardDescription>
                Set when your AI assistant is active and available to chat.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='enable-hours' className='text-sm font-medium'>
                Enable Working Hours
              </Label>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Restrict chatbot availability to specific hours
              </p>
            </div>
            <Switch
              id='enable-hours'
              checked={formData.workingHoursEnabled}
              onCheckedChange={(checked) => updateField('workingHoursEnabled', checked)}
            />
          </div>

          {formData.workingHoursEnabled && (
            <>
              <div className='space-y-2'>
                <Label htmlFor='timezone' className='text-sm font-medium'>
                  Timezone
                </Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => updateField('timezone', value)}
                >
                  <SelectTrigger id='timezone' className='h-11'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='start-time' className='text-sm font-medium'>
                    Start Time
                  </Label>
                  <input
                    id='start-time'
                    type='time'
                    value={formData.startTime}
                    onChange={(e) => updateField('startTime', e.target.value)}
                    className='flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='end-time' className='text-sm font-medium'>
                    End Time
                  </Label>
                  <input
                    id='end-time'
                    type='time'
                    value={formData.endTime}
                    onChange={(e) => updateField('endTime', e.target.value)}
                    className='flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label className='text-sm font-medium'>Active Days</Label>
                <div className='flex flex-wrap gap-2'>
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      className={cn(
                        'px-4 py-2 rounded-lg text-sm font-medium transition-all border-2',
                        formData.activeDays.includes(day.value)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                      )}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className='border-slate-200 dark:border-slate-800'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center'>
              <Settings className='w-5 h-5 text-purple-600 dark:text-purple-400' />
            </div>
            <div>
              <CardTitle className='text-lg'>Offline Behavior</CardTitle>
              <CardDescription>
                Configure what happens when the chatbot is outside working hours.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='offline-mode' className='text-sm font-medium'>
              Offline Mode
            </Label>
            <Select
              value={formData.offlineBehavior}
              onValueChange={(value) => updateField('offlineBehavior', value)}
            >
              <SelectTrigger id='offline-mode' className='h-11'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OFFLINE_MODES.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    {mode.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='offline-message' className='text-sm font-medium'>
              Offline Message
            </Label>
            <Textarea
              id='offline-message'
              value={formData.offlineMessage}
              onChange={(e) => updateField('offlineMessage', e.target.value)}
              rows={4}
              className='resize-none'
              placeholder='Enter your offline message...'
            />
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              This message will be shown to visitors when you're offline
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className='border-slate-200 dark:border-slate-800'>
        <CardHeader>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
              <Users className='w-5 h-5 text-green-600 dark:text-green-400' />
            </div>
            <div>
              <CardTitle className='text-lg'>Human Handoff</CardTitle>
              <CardDescription>
                Configure when and how to transfer conversations to human agents.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label htmlFor='enable-handoff' className='text-sm font-medium'>
                Enable Human Handoff
              </Label>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Allow visitors to request a human agent
              </p>
            </div>
            <Switch
              id='enable-handoff'
              checked={formData.humanHandoffEnabled}
              onCheckedChange={(checked) => updateField('humanHandoffEnabled', checked)}
            />
          </div>

          {formData.humanHandoffEnabled && (
            <>
              <div className='space-y-2'>
                <Label htmlFor='handoff-trigger' className='text-sm font-medium'>
                  Handoff Trigger
                </Label>
                <Select
                  value={formData.handoffTrigger}
                  onValueChange={(value) => updateField('handoffTrigger', value)}
                >
                  <SelectTrigger id='handoff-trigger' className='h-11'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='on-request'>On visitor request</SelectItem>
                    <SelectItem value='automatic'>Automatic (AI decision)</SelectItem>
                    <SelectItem value='keywords'>Specific keywords</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='handoff-message' className='text-sm font-medium'>
                  Handoff Message
                </Label>
                <Textarea
                  id='handoff-message'
                  value={formData.handoffMessage}
                  onChange={(e) => updateField('handoffMessage', e.target.value)}
                  rows={3}
                  className='resize-none'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='notification-email' className='text-sm font-medium'>
                  Notification Email
                </Label>
                <input
                  id='notification-email'
                  type='email'
                  value={formData.notificationEmail}
                  onChange={(e) => updateField('notificationEmail', e.target.value)}
                  className='flex h-11 w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm'
                  placeholder='support@example.com'
                />
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  Receive notifications when a human handoff is requested.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isDirty && (
        <div className='flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800'>
          <Button variant='outline' size='lg' onClick={handleDiscard} disabled={saving}>
            Discard Changes
          </Button>
          <Button
            size='lg'
            onClick={handleSave}
            disabled={saving}
            className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
          >
            {saving ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}