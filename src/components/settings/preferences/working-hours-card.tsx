'use client'

import React, { useState } from 'react'
import { Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { onUpdateUserPreferences, UserPreferences } from '@/actions/preferences'
import { toast } from 'sonner'

const DAYS = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
]

interface WorkingHoursCardProps {
  preferences: UserPreferences
}

export function WorkingHoursCard({ preferences }: WorkingHoursCardProps) {
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const [formData, setFormData] = useState({
    workingHoursEnabled: preferences.workingHoursEnabled,
    workingHoursStart: preferences.workingHoursStart || '09:00',
    workingHoursEnd: preferences.workingHoursEnd || '17:00',
    workingDays: preferences.workingDays || [],
  })

  const [originalData] = useState({
    workingHoursEnabled: preferences.workingHoursEnabled,
    workingHoursStart: preferences.workingHoursStart || '09:00',
    workingHoursEnd: preferences.workingHoursEnd || '17:00',
    workingDays: preferences.workingDays || [],
  })

  const checkDirty = (newData: typeof formData) => {
    const dirty =
      newData.workingHoursEnabled !== originalData.workingHoursEnabled ||
      newData.workingHoursStart !== originalData.workingHoursStart ||
      newData.workingHoursEnd !== originalData.workingHoursEnd ||
      JSON.stringify(newData.workingDays.sort()) !== JSON.stringify(originalData.workingDays.sort())
    setIsDirty(dirty)
  }

  const handleFieldChange = (field: keyof typeof formData, value: any) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    checkDirty(newData)
  }

  const toggleWorkingDay = (day: string) => {
    const currentDays = formData.workingDays || []
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day]

    handleFieldChange('workingDays', newDays)
  }

  const handleSave = async () => {
    setSaving(true)

    const result = await onUpdateUserPreferences({
      workingHoursEnabled: formData.workingHoursEnabled,
      workingHoursStart: formData.workingHoursStart,
      workingHoursEnd: formData.workingHoursEnd,
      workingDays: formData.workingDays,
    })

    if (result.success) {
      toast.success('Working hours saved successfully')
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
          <div className='w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center'>
            <Clock className='w-5 h-5 text-amber-600 dark:text-amber-400' />
          </div>
          <div className='flex-1'>
            <CardTitle className='text-base'>Working Hours</CardTitle>
            <CardDescription className='text-sm'>
              Set your availability for customer interactions
            </CardDescription>
          </div>
          <Switch
            checked={formData.workingHoursEnabled}
            onCheckedChange={(checked) =>
              handleFieldChange('workingHoursEnabled', checked)
            }
            disabled={saving}
          />
        </div>
      </CardHeader>
      {formData.workingHoursEnabled && (
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='workingHoursStart' className='text-sm font-medium'>
                Start Time
              </Label>
              <Input
                id='workingHoursStart'
                type='time'
                value={formData.workingHoursStart}
                onChange={(e) => handleFieldChange('workingHoursStart', e.target.value)}
                disabled={saving}
                className='h-10'
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='workingHoursEnd' className='text-sm font-medium'>
                End Time
              </Label>
              <Input
                id='workingHoursEnd'
                type='time'
                value={formData.workingHoursEnd}
                onChange={(e) => handleFieldChange('workingHoursEnd', e.target.value)}
                disabled={saving}
                className='h-10'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Working Days</Label>
            <div className='flex flex-wrap gap-2'>
              {DAYS.map((day) => {
                const isSelected = formData.workingDays?.includes(day.value)
                return (
                  <button
                    key={day.value}
                    onClick={() => toggleWorkingDay(day.value)}
                    disabled={saving}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {day.label}
                  </button>
                )
              })}
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
      )}
    </Card>
  )
}