'use server'
import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { subDays, format, startOfDay } from 'date-fns'

export const getConversationActivity = async () => {
  try {
    const user = await currentUser()
    if (!user) return null

    const sevenDaysAgo = subDays(new Date(), 7)

    const chatRooms = await client.chatRoom.findMany({
      where: {
        Domain: {
          User: {
            clerkId: user.id,
          },
        },
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        live: true, 
      },
    })

    const activityByDay: Record<string, { ai: number; human: number }> = {}

    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayName = format(date, 'EEE') 
      activityByDay[dayName] = { ai: 0, human: 0 }
    }

    chatRooms.forEach((room: { createdAt: Date; live: boolean }) => {
      const dayName = format(room.createdAt, 'EEE')
      if (activityByDay[dayName]) {
        if (room.live) {
          activityByDay[dayName].human++
        } else {
          activityByDay[dayName].ai++
        }
      }
    })

    const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const today = new Date().getDay() 
    
    const startDay = (today + 1) % 7
    const orderedDays = [
      ...daysOrder.slice(startDay),
      ...daysOrder.slice(0, startDay)
    ]

    const result = orderedDays.map(day => ({
      date: day,
      ai: activityByDay[day]?.ai || 0,
      human: activityByDay[day]?.human || 0,
    }))

    return result
  } catch (error) {
    console.error('Error fetching conversation activity:', error)
    return null
  }
}

export const getResolutionData = async () => {
  try {
    const user = await currentUser()
    if (!user) return null

    const fourWeeksAgo = subDays(new Date(), 28)

    const chatRooms = await client.chatRoom.findMany({
      where: {
        Domain: {
          User: {
            clerkId: user.id,
          },
        },
        createdAt: {
          gte: fourWeeksAgo,
        },
      },
      select: {
        createdAt: true,
        live: true,
      },
    })

    const weekData: Record<number, { ai: number; human: number }> = {
      1: { ai: 0, human: 0 },
      2: { ai: 0, human: 0 },
      3: { ai: 0, human: 0 },
      4: { ai: 0, human: 0 },
    }

    const now = new Date()

    chatRooms.forEach((room: { createdAt: Date; live: boolean }) => {
      const daysAgo = Math.floor(
        (now.getTime() - room.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      )
      
      let weekNumber = 1
      if (daysAgo >= 21) weekNumber = 4
      else if (daysAgo >= 14) weekNumber = 3
      else if (daysAgo >= 7) weekNumber = 2
      else weekNumber = 1

      if (room.live) {
        weekData[weekNumber].human++
      } else {
        weekData[weekNumber].ai++
      }
    })

    const result = [
      { period: 'Week 1', ai: weekData[4].ai, human: weekData[4].human },
      { period: 'Week 2', ai: weekData[3].ai, human: weekData[3].human },
      { period: 'Week 3', ai: weekData[2].ai, human: weekData[2].human },
      { period: 'Week 4', ai: weekData[1].ai, human: weekData[1].human },
    ]

    return result
  } catch (error) {
    console.error('Error fetching resolution data:', error)
    return null
  }
}

export const getConversationTrend = async () => {
  try {
    const user = await currentUser()
    if (!user) return null

    const fourteenDaysAgo = subDays(new Date(), 14)

    const chatRooms = await client.chatRoom.findMany({
      where: {
        Domain: {
          User: {
            clerkId: user.id,
          },
        },
        createdAt: {
          gte: fourteenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    })

    const trendData: Record<string, number> = {}
    
    for (let i = 13; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      trendData[date] = 0
    }

    chatRooms.forEach((room: { createdAt: Date }) => {
      const dateKey = format(room.createdAt, 'yyyy-MM-dd')
      if (trendData[dateKey] !== undefined) {
        trendData[dateKey]++
      }
    })

    return Object.values(trendData)
  } catch (error) {
    console.error('Error fetching conversation trend:', error)
    return null
  }
}

export const getSalesTrend = async () => {
  try {
    const user = await currentUser()
    if (!user) return null

    const fourteenDaysAgo = subDays(new Date(), 14)

    const products = await client.product.findMany({
      where: {
        Domain: {
          User: {
            clerkId: user.id,
          },
        },
        createdAt: {
          gte: fourteenDaysAgo,
        },
      },
      select: {
        price: true,
        createdAt: true,
      },
    })

    const trendData: Record<string, number> = {}
    
    for (let i = 13; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      trendData[date] = 0
    }

    products.forEach((product: { createdAt: Date; price: number }) => {
      const dateKey = format(product.createdAt, 'yyyy-MM-dd')
      if (trendData[dateKey] !== undefined) {
        trendData[dateKey] += product.price
      }
    })

    const values = Object.values(trendData)
    
    if (values.every(v => v === 0)) {
      return null
    }

    return values
  } catch (error) {
    console.error('Error fetching sales trend:', error)
    return null
  }
}

export const getBookingsTrend = async () => {
  try {
    const user = await currentUser()
    if (!user) return null

    const fourteenDaysAgo = subDays(new Date(), 14)

    const bookings = await client.bookings.findMany({
      where: {
        Customer: {
          Domain: {
            User: {
              clerkId: user.id,
            },
          },
        },
        createdAt: {
          gte: fourteenDaysAgo,
        },
      },
      select: {
        createdAt: true,
      },
    })

    const trendData: Record<string, number> = {}
    
    for (let i = 13; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd')
      trendData[date] = 0
    }

    bookings.forEach((booking: { createdAt: Date }) => {
      const dateKey = format(booking.createdAt, 'yyyy-MM-dd')
      if (trendData[dateKey] !== undefined) {
        trendData[dateKey]++
      }
    })

    return Object.values(trendData)
  } catch (error) {
    console.error('Error fetching bookings trend:', error)
    return null
  }
}

export const getTotalConversations = async () => {
  try {
    const user = await currentUser()
    if (!user) return 0

    const count = await client.chatRoom.count({
      where: {
        Domain: {
          User: {
            clerkId: user.id,
          },
        },
      },
    })

    return count
  } catch (error) {
    console.error('Error fetching total conversations:', error)
    return 0
  }
}

export const getConversationsToday = async () => {
  try {
    const user = await currentUser()
    if (!user) {
      console.log('[Analytics] No user found')
      return 0
    }

    const startOfToday = startOfDay(new Date())
    
    console.log('[Analytics] Fetching conversations since:', startOfToday)

    const count = await client.chatRoom.count({
      where: {
        Domain: {
          User: {
            clerkId: user.id,
          },
        },
        createdAt: {
          gte: startOfToday,
        },
      },
    })

    console.log('[Analytics] Conversations today:', count)

    return count
  } catch (error) {
    console.error('Error fetching conversations today:', error)
    return 0
  }
}

export const getTotalChatRooms = async () => {
  try {
    const user = await currentUser()
    if (!user) return 0

    const count = await client.chatRoom.count({
      where: {
        Domain: {
          User: {
            clerkId: user.id,
          },
        },
      },
    })

    console.log('[Analytics] Total chat rooms:', count)
    return count
  } catch (error) {
    console.error('Error fetching total chat rooms:', error)
    return 0
  }
}

export const getConversationsThisWeek = async () => {
  try {
    const user = await currentUser()
    if (!user) return 0

    const sevenDaysAgo = subDays(new Date(), 7)

    const count = await client.chatRoom.count({
      where: {
        Domain: {
          User: {
            clerkId: user.id,
          },
        },
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    })

    return count
  } catch (error) {
    console.error('Error fetching conversations this week:', error)
    return 0
  }
}