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
              'hover:bg-[var(--bg-hover)]',
              'border-b border-[var(--border-default)]'
            )}
          >
            <TableCell className='font-medium'>
              <div className='flex items-center gap-2'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white text-xs font-semibold flex-shrink-0'>
                  {booking.email[0].toUpperCase()}
                </div>
                <div className='min-w-0'>
                  <div className='flex items-center gap-1.5'>
                    <Mail className='w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0' />
                    <span className='text-sm text-[var(--text-primary)] truncate'>
                      {booking.email}
                    </span>
                  </div>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <div className='flex flex-col gap-1'>
                <div className='flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]'>
                  <Calendar className='w-3.5 h-3.5 text-[var(--text-muted)]' />
                  {getMonthName(booking.date.getMonth())} {booking.date.getDate()},{' '}
                  {booking.date.getFullYear()}
                </div>
                <div className='flex items-center gap-1.5'>
                  <Clock className='w-3.5 h-3.5 text-[var(--text-muted)]' />
                  <span className='text-xs text-[var(--text-secondary)] uppercase font-semibold'>
                    {booking.slot}
                  </span>
                </div>
              </div>
            </TableCell>

            <TableCell>
              <div className='flex flex-col gap-0.5'>
                <div className='text-sm text-[var(--text-primary)]'>
                  {getMonthName(booking.createdAt.getMonth())}{' '}
                  {booking.createdAt.getDate()}, {booking.createdAt.getFullYear()}
                </div>
                <div className='text-xs text-[var(--text-secondary)]'>
                  {booking.createdAt.getHours()}:
                  {booking.createdAt.getMinutes().toString().padStart(2, '0')}{' '}
                  {booking.createdAt.getHours() >= 12 ? 'PM' : 'AM'}
                </div>
              </div>
            </TableCell>

            <TableCell className='text-right'>
              {booking.Customer?.Domain?.name ? (
                <div className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] text-sm font-medium text-[var(--text-secondary)]'>
                  <Globe className='w-3.5 h-3.5' />
                  {booking.Customer.Domain.name}
                </div>
              ) : (
                <span className='text-sm text-[var(--text-muted)]'>
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
              <div className='inline-flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-card)] mb-4'>
                <Calendar className='h-8 w-8 text-[var(--text-muted)]' />
              </div>
              <p className='text-lg font-semibold text-[var(--text-primary)] mb-1'>
                No Appointments
              </p>
              <p className='text-sm text-[var(--text-secondary)]'>
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