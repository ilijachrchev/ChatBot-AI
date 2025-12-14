'use client'

import React from 'react'
import { UserPreferences } from '@/actions/preferences'
import { LanguageRegionCard } from './language-region-card'
import { NotificationsCard } from './notification-card' 
import { DashboardBehaviorCard } from './dashboard-behaviour-card'
import { WorkingHoursCard } from './working-hours-card'

interface PreferencesSectionProps {
  preferences: UserPreferences
}

export function PreferencesSection({ preferences }: PreferencesSectionProps) {
  return (
    <div className='space-y-6'>
      <LanguageRegionCard preferences={preferences} />
      <NotificationsCard preferences={preferences} />
      <DashboardBehaviorCard preferences={preferences} />
      <WorkingHoursCard preferences={preferences} />
    </div>
  )
}