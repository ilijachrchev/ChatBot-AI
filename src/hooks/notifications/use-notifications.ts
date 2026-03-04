'use client'

import { useEffect, useState } from 'react'
import { getSocketClient } from '@/lib/utils'
import {
  onGetNotifications,
  onGetCurrentUserId,
  onMarkAllNotificationsRead,
  onDeleteNotification,
} from '@/actions/notifications'
import type { Notification } from '@/types/notification'

const playNotificationSound = () => {
  try {
    const ctx = new AudioContext()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.frequency.value = 440
    gain.gain.value = 0.1
    oscillator.start()
    oscillator.stop(ctx.currentTime + 0.1)
  } catch {}
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    onGetNotifications().then(({ notifications: raw, unreadCount: count }) => {
      setNotifications(raw as Notification[])
      setUnreadCount(count)
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    let joined = false

    onGetCurrentUserId().then((result) => {
      if (!result) return

      const socket = getSocketClient()
      const channel = `notifications-${result.id}`

      socket.emit('join-chatroom', channel)
      joined = true

      const handleNewNotification = (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev])
        setUnreadCount((prev) => prev + 1)
        playNotificationSound()
      }

      socket.on('new-notification', handleNewNotification)

      return () => {
        socket.off('new-notification', handleNewNotification)
        if (joined) {
          socket.emit('leave-chatroom', channel)
        }
      }
    })
  }, [])

  const onOpen = async () => {
    setOpen(true)
    if (unreadCount > 0) {
      setUnreadCount(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      await onMarkAllNotificationsRead()
    }
  }

  const onClose = () => setOpen(false)

  const onDelete = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    await onDeleteNotification(id)
  }

  return {
    notifications,
    unreadCount,
    loading,
    open,
    onOpen,
    onClose,
    onDelete,
  }
}
