import React from 'react'
import { DataTable } from '../table'
import { APPOINTMENT_TABLE_HEADER } from '@/constants/menu'
import { TableCell, TableRow } from '../ui/table'
import { getMonthName, cn } from '@/lib/utils'
import { Mail, Calendar, Clock, Globe } from 'lucide-react'

type Props = {
  bookings:
    | {
        Customer: {
          Domain: {
            name: string
          } | null
        } | null
        id: string
        email: string
        domainId: string | null
        date: Date
        slot: string
        createdAt: Date
      }[]
    | undefined
}

const AllApointments = ({ bookings }: Props) => {
  return (
    <DataTable headers={APPOINTMENT_TABLE_HEADER}>
      {bookings && bookings.length > 0 ? (
        bookings.map((booking, index) => (
          <TableRow
            key={booking.id}
            className={cn(
              'transition-all duration-200',
              'hover:bg-slate-50 dark:hover:bg-slate-800/50',
              'border-b border-slate-200 dark:border-slate-800'
            )}
          >
            <TableCell className='font-medium'>
              <div className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-semibold flex-shrink-0'>
                  {booking.email[0].toUpperCase()}
                </div>
                <div className='min-w-0'>
                  <div className='flex items-center gap-1.5'>
                    <Mail className='w-3.5 h-3.5 text-slate-400 flex-shrink-0' />
                    <span className='text-sm text-slate-900 dark:text-white truncate'>
                      {booking.email}
                    </span>
                  </div>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-1.5 text-sm font-medium text-slate-900 dark:text-white'>
                  <Calendar className='w-3.5 h-3.5 text-slate-400' />
                  {getMonthName(booking.date.getMonth())} {booking.date.getDate()},{' '}
                  {booking.date.getFullYear()}
                </div>
                <div className='flex items-center gap-1.5'>
                  <Clock className='w-3.5 h-3.5 text-slate-400' />
                  <span className='text-xs text-slate-600 dark:text-slate-400 uppercase font-semibold'>
                    {booking.slot}
                  </span>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <div className='flex flex-col gap-0.5'>
                <div className='text-sm text-slate-900 dark:text-white'>
                  {getMonthName(booking.createdAt.getMonth())}{' '}
                  {booking.createdAt.getDate()}, {booking.createdAt.getFullYear()}
                </div>
                <div className='text-xs text-slate-600 dark:text-slate-400'>
                  {booking.createdAt.getHours()}:
                  {booking.createdAt.getMinutes().toString().padStart(2, '0')}{' '}
                  {booking.createdAt.getHours() >= 12 ? 'PM' : 'AM'}
                </div>
              </div>
            </TableCell>

            <TableCell className='text-right'>
              {booking.Customer?.Domain?.name ? (
                <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300'>
                  <Globe className='w-3.5 h-3.5' />
                  {booking.Customer.Domain.name}
                </div>
              ) : (
                <span className='text-sm text-slate-400 dark:text-slate-600'>
                  No domain
                </span>
              )}
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={4} className='h-64 text-center'>
            <div className='flex flex-col items-center justify-center'>
              <div className='inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4'>
                <Calendar className='h-8 w-8 text-slate-400' />
              </div>
              <p className='text-lg font-semibold text-slate-900 dark:text-white mb-1'>
                No Appointments
              </p>
              <p className='text-sm text-slate-600 dark:text-slate-400'>
                Your appointment list is empty
              </p>
            </div>
          </TableCell>
        </TableRow>
      )}
    </DataTable>
  )
}

export default AllApointments