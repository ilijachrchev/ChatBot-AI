'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { onUpdateChatbotPersona } from '@/actions/settings'
import { useRouter } from 'next/navigation'

export const usePersona = (chatBotId: string) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const onUpdatePersona = async (data: { persona: string; customPrompt: string | null }) => {
    setLoading(true)
    try {
      const response = await onUpdateChatbotPersona(chatBotId, data.persona, data.customPrompt)
      
      if (response.status === 200) {
        toast.success('Success', {
          description: 'AI persona updated successfully',
        })
        router.refresh()
        return true
      } else {
        toast.error('Error', {
          description: response.message || 'Failed to update persona',
        })
        return false
      }
    } catch (error) {
      toast.error('Error', {
        description: 'An unexpected error occurred',
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    onUpdatePersona,
    loading,
  }
}