'use client'

import React, { useState } from 'react'
import { Globe } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { onUpdateUserPreferences, UserPreferences } from '@/actions/preferences'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

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

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
]

interface LanguageRegionCardProps {
  preferences: UserPreferences
}

export function LanguageRegionCard({ preferences }: LanguageRegionCardProps) {
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  
  const [formData, setFormData] = useState({
    language: preferences.language,
    timezone: preferences.timezone,
    dateFormat: preferences.dateFormat,
    timeFormat: preferences.timeFormat,
  })

  const [originalData] = useState({
    language: preferences.language,
    timezone: preferences.timezone,
    dateFormat: preferences.dateFormat,
    timeFormat: preferences.timeFormat,
  })

  const checkDirty = (newData: typeof formData) => {
    const dirty = 
      newData.language !== originalData.language ||
      newData.timezone !== originalData.timezone ||
      newData.dateFormat !== originalData.dateFormat ||
      newData.timeFormat !== originalData.timeFormat
    setIsDirty(dirty)
  }

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    checkDirty(newData)
  }

  const handleSave = async () => {
    setSaving(true)

    const result = await onUpdateUserPreferences({
      language: formData.language,
      timezone: formData.timezone,
      dateFormat: formData.dateFormat,
      timeFormat: formData.timeFormat,
    })

    if (result.success) {
      toast.success('Language & region settings saved successfully')
      setIsDirty(false)
      Object.assign(originalData, formData)
    } else {
      toast.error(result.error || 'Failed to save settings')
    }
    
    setSaving(false)
  }

  const handleCancel = () => {
    setFormData({ ...originalData })
    setIsDirty(false)
    toast.info('Changes discarded')
  }

  return (
    <Card className='border-slate-200 dark:border-slate-800'>
      <CardHeader>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
            <Globe className='w-5 h-5 text-blue-600 dark:text-blue-400' />
          </div>
          <div>
            <CardTitle className='text-base'>Language & Region</CardTitle>
            <CardDescription className='text-sm'>
              Set your language and timezone preferences
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='language' className='text-sm font-medium'>
              Language
            </Label>
            <Select
              value={formData.language}
              onValueChange={(value) => handleFieldChange('language', value)}
              disabled={saving}
            >
              <SelectTrigger id='language' className='h-10'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='timezone' className='text-sm font-medium'>
              Timezone
            </Label>
            <Select
              value={formData.timezone}
              onValueChange={(value) => handleFieldChange('timezone', value)}
              disabled={saving}
            >
              <SelectTrigger id='timezone' className='h-10'>
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

          <div className='space-y-2'>
            <Label htmlFor='dateFormat' className='text-sm font-medium'>
              Date Format
            </Label>
            <Select
              value={formData.dateFormat}
              onValueChange={(value) => handleFieldChange('dateFormat', value)}
              disabled={saving}
            >
              <SelectTrigger id='dateFormat' className='h-10'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='MM/DD/YYYY'>MM/DD/YYYY</SelectItem>
                <SelectItem value='DD/MM/YYYY'>DD/MM/YYYY</SelectItem>
                <SelectItem value='YYYY-MM-DD'>YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='timeFormat' className='text-sm font-medium'>
              Time Format
            </Label>
            <Select
              value={formData.timeFormat}
              onValueChange={(value) => handleFieldChange('timeFormat', value)}
              disabled={saving}
            >
              <SelectTrigger id='timeFormat' className='h-10'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='12h'>12-hour (AM/PM)</SelectItem>
                <SelectItem value='24h'>24-hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isDirty && (
          <div className='flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800'>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              You have unsaved changes
            </p>
            <div className='flex gap-2'>
              <Button
                onClick={handleCancel}
                variant='outline'
                size='sm'
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                size='sm'
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
          </div>
        )}
      </CardContent>
    </Card>
  )
}