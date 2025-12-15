'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  onUpdateDomainWorkingHours,
  onUpdateDomainTimezone,
  onUpdateChatbotOfflineBehavior,
} from '@/actions/working-hours'

export type AvailabilityFormData = {
  workingHoursEnabled: boolean
  timezone: string
  startTime: string
  endTime: string
  activeDays: string[]

  offlineBehavior: string
  offlineMessage: string

  humanHandoffEnabled: boolean
  handoffTrigger: string
  handoffMessage: string
  notificationEmail: string
}

export const useAvailability = (
  domainId: string,
  initialData: Partial<AvailabilityFormData>
) => {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const [formData, setFormData] = useState<AvailabilityFormData>({
    workingHoursEnabled: initialData.workingHoursEnabled || false,
    timezone: initialData.timezone || 'UTC',
    startTime: initialData.startTime || '09:00',
    endTime: initialData.endTime || '18:00',
    activeDays: initialData.activeDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    offlineBehavior: initialData.offlineBehavior || 'SHOW_HOURS_AND_EMAIL',
    offlineMessage: initialData.offlineMessage || '',
    humanHandoffEnabled: initialData.humanHandoffEnabled || true,
    handoffTrigger: initialData.handoffTrigger || 'on-request',
    handoffMessage: initialData.handoffMessage || "I'll connect you with a human agent right away. Please hold on for a moment.",
    notificationEmail: initialData.notificationEmail || '',
  })

  const [originalData] = useState(formData)

  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData)
    setIsDirty(hasChanges)
  }, [formData, originalData])

  const updateField = <K extends keyof AvailabilityFormData>(
    field: K,
    value: AvailabilityFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      activeDays: prev.activeDays.includes(day)
        ? prev.activeDays.filter((d) => d !== day)
        : [...prev.activeDays, day],
    }))
  }

  const handleSave = async () => {
    setSaving(true)

    try {
      const timezoneResult = await onUpdateDomainTimezone(domainId, formData.timezone)
      if (timezoneResult.status !== 200) {
        throw new Error('Failed to update timezone')
      }

      const dayRanges: Record<string, string[]> = {}
      const dayClosed: Record<string, boolean> = {}

      const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

      allDays.forEach((day) => {
        if (formData.activeDays.includes(day)) {
          dayRanges[`${day}Ranges`] = [`${formData.startTime}-${formData.endTime}`]
          dayClosed[`${day}Closed`] = false
        } else {
          dayRanges[`${day}Ranges`] = []
          dayClosed[`${day}Closed`] = true
        }
      })

      const workingHoursResult = await onUpdateDomainWorkingHours(domainId, {
        enabled: formData.workingHoursEnabled,
        ...dayRanges,
        ...dayClosed,
      })

      if (workingHoursResult.status !== 200) {
        throw new Error('Failed to update working hours')
      }

      const offlineResult = await onUpdateChatbotOfflineBehavior(domainId, {
        offlineBehavior: formData.offlineBehavior,
        offlineCustomMessage: formData.offlineMessage,
      })

      if (offlineResult.status !== 200) {
        throw new Error('Failed to update offline behavior')
      }

      toast.success('Settings saved successfully!')
      setIsDirty(false)
      router.refresh()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setFormData(originalData)
    setIsDirty(false)
    toast.info('Changes discarded')
  }

  return {
    formData,
    updateField,
    toggleDay,
    handleSave,
    handleDiscard,
    saving,
    isDirty,
  }
}