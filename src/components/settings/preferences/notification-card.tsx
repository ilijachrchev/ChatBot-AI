'use client'

import React, { useState } from 'react'
import { Bell } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { onUpdateUserPreferences, UserPreferences } from '@/actions/preferences'
import { toast } from 'sonner'

interface NotificationsCardProps {
  preferences: UserPreferences
}

export function NotificationsCard({ preferences }: NotificationsCardProps) {
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const [formData, setFormData] = useState({
    emailNotifications: preferences.emailNotifications,
    desktopNotifications: preferences.desktopNotifications,
    soundEnabled: preferences.soundEnabled,
  })

  const [originalData] = useState({
    emailNotifications: preferences.emailNotifications,
    desktopNotifications: preferences.desktopNotifications,
    soundEnabled: preferences.soundEnabled,
  })

  const checkDirty = (newData: typeof formData) => {
    const dirty =
      newData.emailNotifications !== originalData.emailNotifications ||
      newData.desktopNotifications !== originalData.desktopNotifications ||
      newData.soundEnabled !== originalData.soundEnabled
    setIsDirty(dirty)
  }

  const handleFieldChange = (field: keyof typeof formData, value: boolean) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    checkDirty(newData)
  }

  const handleSave = async () => {
    setSaving(true)

    const result = await onUpdateUserPreferences({
      emailNotifications: formData.emailNotifications,
      desktopNotifications: formData.desktopNotifications,
      soundEnabled: formData.soundEnabled,
    })

    if (result.success) {
      toast.success('Notification preferences saved successfully')
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
          <div className='w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center'>
            <Bell className='w-5 h-5 text-purple-600 dark:text-purple-400' />
          </div>
          <div>
            <CardTitle className='text-base'>Notifications</CardTitle>
            <CardDescription className='text-sm'>
              Manage how you receive notifications
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='space-y-0.5'>
            <Label htmlFor='emailNotifications' className='text-sm font-medium'>
              Email Notifications
            </Label>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Receive notifications via email
            </p>
          </div>
          <Switch
            id='emailNotifications'
            checked={formData.emailNotifications}
            onCheckedChange={(checked) =>
              handleFieldChange('emailNotifications', checked)
            }
            disabled={saving}
          />
        </div>

        <div className='flex items-center justify-between'>
          <div className='space-y-0.5'>
            <Label htmlFor='desktopNotifications' className='text-sm font-medium'>
              Desktop Notifications
            </Label>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Show browser notifications
            </p>
          </div>
          <Switch
            id='desktopNotifications'
            checked={formData.desktopNotifications}
            onCheckedChange={(checked) =>
              handleFieldChange('desktopNotifications', checked)
            }
            disabled={saving}
          />
        </div>

        <div className='flex items-center justify-between'>
          <div className='space-y-0.5'>
            <Label htmlFor='soundEnabled' className='text-sm font-medium'>
              Sound Alerts
            </Label>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Play sound for new messages
            </p>
          </div>
          <Switch
            id='soundEnabled'
            checked={formData.soundEnabled}
            onCheckedChange={(checked) => handleFieldChange('soundEnabled', checked)}
            disabled={saving}
          />
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