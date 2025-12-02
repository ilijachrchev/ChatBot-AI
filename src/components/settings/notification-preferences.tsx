'use client'
import React from 'react'
import { Bell } from 'lucide-react'
import { Switch } from '../ui/switch'

type Props = {}

const NotificationPreferences = (props: Props) => {
  const [notifications, setNotifications] = React.useState({
    email: true,
    newConversation: true,
    appointmentReminders: true,
    weeklyReports: false,
  })

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <Bell className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Notification Preferences
          </h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              Email Notifications
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
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

        <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              New Conversation Alerts
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
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

        <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="font-medium text-slate-900 dark:text-white">
              Appointment Reminders
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
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
            <p className="font-medium text-slate-900 dark:text-white">
              Weekly Reports
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
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