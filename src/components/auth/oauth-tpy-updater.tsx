'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { onUpdateUserTypeAfterOAuth } from '@/actions/auth'

export function OAuthTypeUpdater() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    const updateUserType = async () => {
      if (!isLoaded || !user) return

      const pendingType = localStorage.getItem('pending_user_type')
      
      if (pendingType) {
        await onUpdateUserTypeAfterOAuth(user.id, pendingType)
        localStorage.removeItem('pending_user_type')
      }
    }

    updateUserType()
  }, [user, isLoaded])

  return null 
}