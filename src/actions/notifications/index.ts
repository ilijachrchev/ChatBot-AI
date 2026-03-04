'use server'

import { client as db } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'

export const onGetCurrentUserId = async () => {
  const clerkUser = await currentUser()
  if (!clerkUser) return null
  const user = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { id: true },
  })
  return user ? { id: user.id } : null
}

export const onCreateNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
) => {
  const notification = await db.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      ...(data !== undefined && { data: data as Prisma.InputJsonValue }),
    },
    select: {
      id: true,
      userId: true,
      type: true,
      title: true,
      message: true,
      read: true,
      data: true,
      createdAt: true,
    },
  })

  try {
    const socketUrl = process.env.SOCKET_SERVER_URL || 'http://localhost:4000'
    await fetch(`${socketUrl}/api/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chatroomId: `notifications-${userId}`,
        event: 'new-notification',
        data: notification,
      }),
    })
  } catch (err) {
    console.error('Failed to emit notification via socket:', err)
  }

  return notification
}

export const onGetNotifications = async () => {
  const clerkUser = await currentUser()
  if (!clerkUser) return { notifications: [], unreadCount: 0 }

  const user = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { id: true },
  })
  if (!user) return { notifications: [], unreadCount: 0 }

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: {
      id: true,
      userId: true,
      type: true,
      title: true,
      message: true,
      read: true,
      data: true,
      createdAt: true,
    },
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  return { notifications, unreadCount }
}

export const onMarkNotificationRead = async (notificationId: string) => {
  await db.notification.update({
    where: { id: notificationId },
    data: { read: true },
  })
  return { status: 200 }
}

export const onMarkAllNotificationsRead = async () => {
  const clerkUser = await currentUser()
  if (!clerkUser) return { status: 401 }

  const user = await db.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { id: true },
  })
  if (!user) return { status: 404 }

  await db.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  })
  return { status: 200 }
}

export const onDeleteNotification = async (notificationId: string) => {
  await db.notification.delete({
    where: { id: notificationId },
  })
  return { status: 200 }
}
