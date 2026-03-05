import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { client } from '@/lib/prisma'
import { onGetUserPreferences } from '@/actions/preferences'
import { NotificationsCard } from '@/components/settings/preferences/notification-card'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TYPE_DOT: Record<string, string> = {
  INFO: 'bg-blue-500',
  SUCCESS: 'bg-green-500',
  WARNING: 'bg-amber-500',
  ERROR: 'bg-red-500',
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

export default async function NotificationsPage() {
  const user = await currentUser()
  if (!user) redirect('/auth/sign-in')

  const preferences = await onGetUserPreferences()
  if (!preferences) redirect('/dashboard')

  const dbUser = await client.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  })

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const notifications = dbUser
    ? await client.notification.findMany({
        where: {
          userId: dbUser.id,
          createdAt: { gte: thirtyDaysAgo },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
    : []

  return (
    <div className='space-y-6'>
      <NotificationsCard preferences={preferences} />

      <Card className='border-slate-200 dark:border-slate-800'>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your last 30 days of notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <div className='w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4'>
                <Bell className='w-7 h-7 text-slate-400' />
              </div>
              <p className='text-sm font-semibold text-slate-900 dark:text-white mb-1'>
                No notifications yet
              </p>
              <p className='text-xs text-slate-500 dark:text-slate-400 max-w-xs'>
                Activity like new conversations, billing events, and system
                alerts will appear here
              </p>
            </div>
          ) : (
            <ul className='space-y-1'>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className='flex items-start gap-4 px-3 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors'
                >
                  <div className='mt-2 flex-shrink-0'>
                    <span
                      className={cn(
                        'block w-2 h-2 rounded-full',
                        TYPE_DOT[n.type] ?? 'bg-slate-400'
                      )}
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-slate-900 dark:text-white'>
                      {n.title}
                    </p>
                    <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
                      {n.message}
                    </p>
                  </div>
                  <span className='text-xs text-slate-400 flex-shrink-0 mt-0.5'>
                    {timeAgo(n.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
