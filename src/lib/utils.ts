import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { io, Socket } from "socket.io-client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractUUIDFromString = (url: string) => {
  return url.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i
  )
}

let socketClient: Socket | null = null
let connectionAttempted = false

export const getSocketClient = () => {
  if (!socketClient && !connectionAttempted) {
    connectionAttempted = true
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000'

    socketClient = io(socketUrl, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 5000,
      transports: ['websocket', 'polling'],
    })

    socketClient.on('connect', () => {
      console.log('✅ Socket connected:', socketClient?.id)
    })

    socketClient.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    socketClient.on('connect_error', () => {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Socket connection failed — realtime features unavailable')
      }
    })
  }
  return socketClient
}

export const postToParent = (message: string) => {
  window.parent.postMessage(message, '*')
}

export const extractURLfromString = (url: string) => {
  return url.match(/https?:\/\/[^\s"<>]+/)
}

export const extractEmailsFromString = (text: string) => {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
}

export const getMonthName = (month: number) => {
  return month == 1
    ? 'Jan'
    : month == 2
    ? 'Feb'
    : month == 3
    ? 'Mar'
    : month == 4
    ? 'Apr'
    : month == 5
    ? 'May'
    : month == 6
    ? 'Jun'
    : month == 7
    ? 'Jul'
    : month == 8
    ? 'Aug'
    : month == 9
    ? 'Sep'
    : month == 10
    ? 'Oct'
    : month == 11
    ? 'Nov'
    : month == 12 && 'Dec'
}