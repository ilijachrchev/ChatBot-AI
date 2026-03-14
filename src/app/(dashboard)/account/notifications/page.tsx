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
  INFO: 'bg-[var(--primary)]',
  SUCCESS: 'bg-[var(--success)]',
  WARNING: 'bg-[var(--warning)]',
  ERROR: 'bg-[var(--danger)]',
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

      <Card className='border-[var(--border-default)]'>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your last 30 days of notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center'>
              <div className='w-14 h-14 rounded-full bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] flex items-center justify-center mb-4'>
                <Bell className='w-7 h-7 text-[var(--text-muted)]' />
              </div>
              <p className='text-sm font-semibold text-[var(--text-primary)] mb-1'>
                No notifications yet
              </p>
              <p className='text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] max-w-xs'>
                Activity like new conversations, billing events, and system
                alerts will appear here
              </p>
            </div>
          ) : (
            <ul className='space-y-1'>
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className='flex items-start gap-4 px-3 py-3 rounded-lg hover:bg-[var(--bg-hover)] transition-colors'
                >
                  <div className='mt-2 flex-shrink-0'>
                    <span
                      className={cn(
                        'block w-2 h-2 rounded-full',
                        TYPE_DOT[n.type] ?? 'bg-[var(--bg-card)]'
                      )}
                    />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium text-[var(--text-primary)]'>
                      {n.title}
                    </p>
                    <p className='text-xs text-[var(--text-secondary)] dark:text-[var(--text-secondary)] mt-0.5'>
                      {n.message}
                    </p>
                  </div>
                  <span className='text-xs text-[var(--text-muted)] flex-shrink-0 mt-0.5'>
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
