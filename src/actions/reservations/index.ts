'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export const onGetDomainReservations = async (domainId: string, filter?: 'today' | 'week' | 'all') => {
  try {
    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(startOfDay)
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay())

    const dateFilter =
      filter === 'today'
        ? { gte: startOfDay, lt: new Date(startOfDay.getTime() + 86400000) }
        : filter === 'week'
        ? { gte: startOfWeek }
        : undefined

    const reservations = await (client as any).reservation.findMany({
      where: {
        domainId,
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      orderBy: [{ date: 'asc' }, { timeSlot: 'asc' }],
    })

    const today = await (client as any).reservation.count({
      where: {
        domainId,
        date: { gte: startOfDay, lt: new Date(startOfDay.getTime() + 86400000) },
      },
    })

    const thisWeek = await (client as any).reservation.count({
      where: { domainId, date: { gte: startOfWeek } },
    })

    const pending = await (client as any).reservation.count({
      where: { domainId, status: 'PENDING' },
    })

    const total = await (client as any).reservation.count({ where: { domainId } })

    return {
      status: 200,
      reservations,
      stats: { today, thisWeek, pending, total },
    }
  } catch (error) {
    console.error(error)
    return { status: 500, reservations: [], stats: { today: 0, thisWeek: 0, pending: 0, total: 0 } }
  }
}

export const onUpdateReservationStatus = async (reservationId: string, status: string) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    await (client as any).reservation.update({
      where: { id: reservationId },
      data: { status },
    })
    return { status: 200, message: 'Reservation updated' }
  } catch (error) {
    console.error(error)
    return { status: 500, message: 'Failed to update reservation' }
  }
}
