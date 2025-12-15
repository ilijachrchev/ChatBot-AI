'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { UserCircle, Clock } from 'lucide-react'
import { useChatbotPresence } from '@/hooks/chatbot/use-chatbot-presence'

interface HumanHandoffButtonProps {
  domainId?: string
  onRequestHuman: () => void
  className?: string
}

export function HumanHandoffButton({ 
  domainId, 
  onRequestHuman,
  className 
}: HumanHandoffButtonProps) {
  const { presence, canRequestHuman } = useChatbotPresence(domainId || '')

  if (!domainId) return null

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onRequestHuman}
      disabled={!canRequestHuman}
      className={className}
    >
      {canRequestHuman ? (
        <>
          <UserCircle className="w-4 h-4 mr-2" />
          Talk to Human
        </>
      ) : (
        <>
          <Clock className="w-4 h-4 mr-2" />
          Offline
        </>
      )}
    </Button>
  )
}