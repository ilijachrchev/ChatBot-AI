'use client'
import React from 'react'
import { Bell } from 'lucide-react'
import { Switch } from '@/components/ui/switch' 

type Props = Record<string, never>

const NotificationPreferences = (props: Props) => {
  const [notifications, setNotifications] = React.useState({
    email: true,
    newConversation: true,
    appointmentReminders: true,
    weeklyReports: false,
  })

  return (
    <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-page)]/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--warning)] text-white">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">
            Notification Preferences
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-[var(--border-default)]">
          <div>
            <p className="font-medium text-[var(--text-primary)]">
              Email Notifications
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Receive updates via email
            </p>
          </div>
          <Switch
            checked={notifications.email}
            onCheckedChange={(checked) => 
              setNotifications({ ...notifications, email: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-[var(--border-default)]">
          <div>
            <p className="font-medium text-[var(--text-primary)]">
              New Conversation Alerts
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Get notified of new conversations
            </p>
          </div>
          <Switch
            checked={notifications.newConversation}
            onCheckedChange={(checked) => 
              setNotifications({ ...notifications, newConversation: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-[var(--border-default)]">
          <div>
            <p className="font-medium text-[var(--text-primary)]">
              Appointment Reminders
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Reminder before scheduled meetings
            </p>
          </div>
          <Switch
            checked={notifications.appointmentReminders}
            onCheckedChange={(checked) => 
              setNotifications({ ...notifications, appointmentReminders: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-[var(--text-primary)]">
              Weekly Reports
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Receive weekly summary reports
            </p>
          </div>
          <Switch
            checked={notifications.weeklyReports}
            onCheckedChange={(checked) => 
              setNotifications({ ...notifications, weeklyReports: checked })
            }
          />
        </div>
      </div>
    </div>
  )
}

export default NotificationPreferences