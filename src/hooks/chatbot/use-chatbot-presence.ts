'use client'

import { useState, useEffect } from 'react'

type PresenceStatus = 'ONLINE' | 'AWAY' | 'OFFLINE'

type ChatbotPresence = {
  status: PresenceStatus
  canHandoff: boolean
  message?: string
  badge: {
    text: string
    color: string
  }
}

export function useChatbotPresence(domainId: string) {
  const [presence, setPresence] = useState<ChatbotPresence | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPresence = async () => {
      try {
        const response = await fetch(`/api/chatbot/presence?domainId=${domainId}`)
        if (response.ok) {
          const data = await response.json()
          setPresence(data.presence)
        }
      } catch (error) {
        console.error('Error fetching presence:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPresence()

    const interval = setInterval(fetchPresence, 30000)

    return () => clearInterval(interval)
  }, [domainId])

  const shouldShowOfflineMessage = presence?.status === 'OFFLINE' || presence?.status === 'AWAY'
  const canRequestHuman = presence?.canHandoff ?? true

  return {
    presence,
    loading,
    shouldShowOfflineMessage,
    canRequestHuman,
  }
}