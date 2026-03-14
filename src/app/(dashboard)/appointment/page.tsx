import { onGetAllBookingsForCurrentUser } from '@/actions/appointment'
import AllApointments from '@/components/appointment/all-appointments'
import InfoBar from '@/components/infobar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { currentUser } from '@clerk/nextjs/server'
import { Calendar, Clock, Mail, Globe, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { client } from '@/lib/prisma'
import Link from 'next/link'
export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = {
  searchParams: Promise<{ domain?: string }>
}

async function getUserDomainPersonas(clerkId: string) {
  const result = await client.user.findUnique({
    where: { clerkId },
    select: {
      domains: {
        select: {
          id: true,
          name: true,
          chatBot: { select: { persona: true } },
        },
      },
    },
  })
  return result?.domains ?? []
}

const Page = async ({ searchParams }: Props) => {
  const user = await currentUser()
  if (!user) return null

  const { domain: domainId } = await searchParams

  const [domainBookings, userDomains] = await Promise.all([
    onGetAllBookingsForCurrentUser(user.id),
    getUserDomainPersonas(user.id),
  ])

  const filteredBookings = domainId && domainBookings?.bookings
    ? { bookings: domainBookings.bookings.filter((b) => b.domainId === domainId) }
    : domainBookings

  const activeDomain = domainId ? userDomains.find((d) => d.id === domainId) : null

  const today = new Date()

  const hasAppointmentSetterDomain = userDomains.some(
    (d) => d.chatBot?.persona === 'APPOINTMENT_SETTER'
  )

  if (!filteredBookings) {
    return (
      <>
        <InfoBar />

        {activeDomain && (
          <div className="mx-4 md:mx-6 mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] dark:bg-[var(--bg-page)]/50 border border-[var(--border-default)]">
            <Globe className="h-4 w-4 text-[var(--text-muted)]" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              {activeDomain.name}
            </span>
          </div>
        )}

        {userDomains.length > 0 && !hasAppointmentSetterDomain && (
          <div className="mx-4 md:mx-6 mt-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--warning)] dark:bg-[var(--warning)] border border-[var(--warning)] dark:border-[var(--warning)]">
            <AlertTriangle className="h-4 w-4 text-[var(--warning)] dark:text-[var(--warning)] flex-shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="text-sm text-[var(--warning)] dark:text-[var(--warning)]">
                Your chatbot is not set to Appointment Setter persona. Appointments will not be automatically collected.
              </p>
              <Link
                href={`/settings/${userDomains[0]?.name}/persona`}
                className="text-sm font-semibold text-[var(--warning)] dark:text-[var(--warning)] hover:underline whitespace-nowrap"
              >
                Switch to Appointment Setter →
              </Link>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] mb-4">
              <Calendar className="h-8 w-8 text-[var(--text-muted)]" />
            </div>
            <p className="text-lg font-semibold text-[var(--text-primary)] mb-1">
              No Appointments
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Your appointments will appear here
            </p>
          </div>
        </div>
      </>
    )
  }

  const bookingExistToday = filteredBookings.bookings.filter((booking) => {
    return (
      booking.date.getDate() === today.getDate() &&
      booking.date.getMonth() === today.getMonth() &&
      booking.date.getFullYear() === today.getFullYear()
    )
  })

  return (
    <>
      <InfoBar />

      {activeDomain && (
        <div className="mx-4 md:mx-6 mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] dark:bg-[var(--bg-page)]/50 border border-[var(--border-default)]">
          <Globe className="h-4 w-4 text-[var(--text-muted)]" />
          <span className="text-sm font-medium text-[var(--text-secondary)]">
            {activeDomain.name}
          </span>
        </div>
      )}

      {hasAppointmentSetterDomain ? (
        <div className="mx-4 md:mx-6 mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--success)] dark:bg-[var(--success)] border border-[var(--success)] dark:border-[var(--success)]">
          <CheckCircle2 className="h-4 w-4 text-[var(--success)] dark:text-[var(--success)] flex-shrink-0" />
          <p className="text-sm text-[var(--success)] dark:text-[var(--success)]">
            Appointments are automatically collected by your{' '}
            <span className="font-semibold">Appointment Setter</span> chatbot persona.
          </p>
        </div>
      ) : (
        <div className="mx-4 md:mx-6 mt-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-[var(--warning)] dark:bg-[var(--warning)] border border-[var(--warning)] dark:border-[var(--warning)]">
          <AlertTriangle className="h-4 w-4 text-[var(--warning)] dark:text-[var(--warning)] flex-shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-[var(--warning)] dark:text-[var(--warning)]">
              Your chatbot is not set to Appointment Setter persona. Appointments will not be automatically collected.
            </p>
            <Link
              href={`/settings/${userDomains[0]?.name}/persona`}
              className="text-sm font-semibold text-[var(--warning)] dark:text-[var(--warning)] hover:underline whitespace-nowrap"
            >
              Switch to Appointment Setter →
            </Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 h-0 gap-4 md:gap-6 px-4 md:px-6 pb-8 overflow-hidden mt-4">
        <div className="lg:col-span-2 overflow-y-auto">
          <AllApointments bookings={filteredBookings?.bookings} />
        </div>

        <div className="col-span-1 overflow-y-auto">
          <div className="sticky top-0 mb-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
              Today's Appointments
            </h3>
            <p className="text-sm text-[var(--text-secondary)]">
              {today.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          <div className="space-y-3 md:space-y-4">
            {bookingExistToday.length ? (
              bookingExistToday.map((booking) => (
                <div
                  key={booking.id}
                  className={cn(
                    'group relative overflow-hidden',
                    'rounded-xl border border-[var(--border-default)]',
                    'bg-[var(--bg-page)]/50',
                    'transition-all duration-300',
                    'hover:shadow-card-hover hover:border-[var(--primary)] dark:hover:border-[var(--primary)]'
                  )}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--primary)] to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex">
                    <div className="w-24 md:w-28 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] dark:from-[var(--primary)] dark:to-[var(--primary-light)] flex flex-col items-center justify-center py-6 border-r border-[var(--primary)] dark:border-[var(--border-accent)]">
                      <Clock className="w-5 h-5 text-[var(--text-accent)] mb-2" />
                      <p className="text-lg md:text-xl font-bold text-[var(--primary)] dark:text-[var(--primary)] text-center">
                        {booking.slot}
                      </p>
                    </div>

                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            Created {booking.createdAt.getHours()}:
                            {booking.createdAt.getMinutes().toString().padStart(2, '0')}{' '}
                            {booking.createdAt.getHours() >= 12 ? 'PM' : 'AM'}
                          </span>
                        </div>

                        {booking.Customer?.Domain?.name && (
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] text-xs font-medium text-[var(--text-secondary)]">
                            <Globe className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">
                              {booking.Customer.Domain.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <Separator className="mb-3" />

                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-[var(--border-default)] dark:border-[var(--border-strong)]">
                          <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white text-sm font-semibold">
                            {booking.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
                            <Mail className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
                            <span className="truncate">{booking.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[var(--border-default)]">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-surface)] dark:bg-[var(--bg-surface)] mb-3">
                  <Calendar className="h-7 w-7 text-[var(--text-muted)]" />
                </div>
                <p className="text-sm font-medium text-[var(--text-primary)] mb-1">
                  No Appointments Today
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  Your schedule is clear for today
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default Page
