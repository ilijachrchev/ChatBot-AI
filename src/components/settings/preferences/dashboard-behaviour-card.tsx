'use client'

import React, { useState } from 'react'
import { Layout } from 'lucide-react'
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

interface DashboardBehaviorCardProps {
  preferences: UserPreferences
}

export function DashboardBehaviorCard({ preferences }: DashboardBehaviorCardProps) {
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const [formData, setFormData] = useState({
    defaultView: preferences.defaultView,
    conversationSort: preferences.conversationSort,
    itemsPerPage: preferences.itemsPerPage,
  })

  const [originalData] = useState({
    defaultView: preferences.defaultView,
    conversationSort: preferences.conversationSort,
    itemsPerPage: preferences.itemsPerPage,
  })

  const checkDirty = (newData: typeof formData) => {
    const dirty =
      newData.defaultView !== originalData.defaultView ||
      newData.conversationSort !== originalData.conversationSort ||
      newData.itemsPerPage !== originalData.itemsPerPage
    setIsDirty(dirty)
  }

  const handleFieldChange = (field: keyof typeof formData, value: string | number) => {
    const newData = { ...formData, [field]: value }
    setFormData(newData)
    checkDirty(newData)
  }

  const handleSave = async () => {
    setSaving(true)

    const result = await onUpdateUserPreferences({
      defaultView: formData.defaultView,
      conversationSort: formData.conversationSort,
      itemsPerPage: formData.itemsPerPage,
    })

    if (result.success) {
      toast.success('Dashboard preferences saved successfully')
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
          <div className='w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
            <Layout className='w-5 h-5 text-green-600 dark:text-green-400' />
          </div>
          <div>
            <CardTitle className='text-base'>Dashboard Behavior</CardTitle>
            <CardDescription className='text-sm'>
              Customize your dashboard experience
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='space-y-2'>
            <Label htmlFor='defaultView' className='text-sm font-medium'>
              Default View
            </Label>
            <Select
              value={formData.defaultView}
              onValueChange={(value) => handleFieldChange('defaultView', value)}
              disabled={saving}
            >
              <SelectTrigger id='defaultView' className='h-10'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='conversations'>Conversations</SelectItem>
                <SelectItem value='analytics'>Analytics</SelectItem>
                <SelectItem value='domains'>Domains</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='conversationSort' className='text-sm font-medium'>
              Conversation Sorting
            </Label>
            <Select
              value={formData.conversationSort}
              onValueChange={(value) => handleFieldChange('conversationSort', value)}
              disabled={saving}
            >
              <SelectTrigger id='conversationSort' className='h-10'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>Newest First</SelectItem>
                <SelectItem value='oldest'>Oldest First</SelectItem>
                <SelectItem value='unread'>Unread First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='itemsPerPage' className='text-sm font-medium'>
              Items Per Page
            </Label>
            <Select
              value={formData.itemsPerPage.toString()}
              onValueChange={(value) => handleFieldChange('itemsPerPage', parseInt(value))}
              disabled={saving}
            >
              <SelectTrigger id='itemsPerPage' className='h-10'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='10'>10</SelectItem>
                <SelectItem value='25'>25</SelectItem>
                <SelectItem value='50'>50</SelectItem>
                <SelectItem value='100'>100</SelectItem>
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