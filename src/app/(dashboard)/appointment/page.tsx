import { onGetAllBookingsForCurrentUser } from '@/actions/appointment'
import AllApointments from '@/components/appointment/all-appointments'
import InfoBar from '@/components/infobar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { currentUser } from '@clerk/nextjs/server'
import { Calendar, Clock, Mail, Globe } from 'lucide-react'
import React from 'react'
import { cn } from '@/lib/utils'

type Props = Record<string, never>

const Page = async (props: Props) => {
  const user = await currentUser()

  if (!user) return null
  
  const domainBookings = await onGetAllBookingsForCurrentUser(user.id)
  const today = new Date()

  if (!domainBookings) {
    return (
      <>
        <InfoBar />
        <div className='flex items-center justify-center h-[400px]'>
          <div className='text-center'>
            <div className='inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4'>
              <Calendar className='h-8 w-8 text-slate-400' />
            </div>
            <p className='text-lg font-semibold text-slate-900 dark:text-white mb-1'>
              No Appointments
            </p>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              Your appointments will appear here
            </p>
          </div>
        </div>
      </>
    )
  }

  const bookingExistToday = domainBookings.bookings.filter((booking: any ) => {
    return booking.date.getDate() === today.getDate() &&
           booking.date.getMonth() === today.getMonth() &&
           booking.date.getFullYear() === today.getFullYear()
  })

  return (
    <>
      <InfoBar />
      <div className='grid grid-cols-1 lg:grid-cols-3 flex-1 h-0 gap-4 md:gap-6 px-4 md:px-6 pb-8 overflow-hidden'>
        <div className='lg:col-span-2 overflow-y-auto'>
          <AllApointments bookings={domainBookings?.bookings} />
        </div>

        <div className='col-span-1 overflow-y-auto'>
          <div className='sticky top-0 mb-4'>
            <h3 className='text-lg font-bold text-slate-900 dark:text-white mb-1'>
              Today's Appointments
            </h3>
            <p className='text-sm text-slate-600 dark:text-slate-400'>
              {today.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className='space-y-3 md:space-y-4'>
            {bookingExistToday.length ? (
              bookingExistToday.map((booking: any) => (
                <div
                  key={booking.id}
                  className={cn(
                    'group relative overflow-hidden',
                    'rounded-xl border border-slate-200 dark:border-slate-800',
                    'bg-white dark:bg-slate-900/50',
                    'transition-all duration-300',
                    'hover:shadow-card-hover hover:border-blue-200 dark:hover:border-blue-800'
                  )}
                >
                  <div className='absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

                  <div className='relative z-10 flex'>
                    <div className='w-24 md:w-28 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 flex flex-col items-center justify-center py-6 border-r border-blue-200 dark:border-blue-800'>
                      <Clock className='w-5 h-5 text-blue-600 dark:text-blue-400 mb-2' />
                      <p className='text-lg md:text-xl font-bold text-blue-900 dark:text-blue-100 text-center'>
                        {booking.slot}
                      </p>
                    </div>

                    <div className='flex-1 p-4'>
                      <div className='flex justify-between items-start mb-3 gap-2'>
                        <div className='flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400'>
                          <Calendar className='w-3.5 h-3.5' />
                          <span>
                            Created {booking.createdAt.getHours()}:
                            {booking.createdAt.getMinutes().toString().padStart(2, '0')}{' '}
                            {booking.createdAt.getHours() >= 12 ? 'PM' : 'AM'}
                          </span>
                        </div>

                        {booking.Customer?.Domain?.name && (
                          <div className='flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300'>
                            <Globe className='w-3 h-3' />
                            <span className='truncate max-w-[100px]'>
                              {booking.Customer.Domain.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <Separator className='mb-3' />

                      <div className='flex items-center gap-3'>
                        <Avatar className='h-9 w-9 border-2 border-slate-200 dark:border-slate-700'>
                          <AvatarFallback className='bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-semibold'>
                            {booking.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white'>
                            <Mail className='w-3.5 h-3.5 text-slate-400 flex-shrink-0' />
                            <span className='truncate'>{booking.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800'>
                <div className='inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-3'>
                  <Calendar className='h-7 w-7 text-slate-400' />
                </div>
                <p className='text-sm font-medium text-slate-900 dark:text-white mb-1'>
                  No Appointments Today
                </p>
                <p className='text-xs text-slate-600 dark:text-slate-400'>
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