'use client'

import { useUser } from '@clerk/nextjs'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const EmailStatus = () => {
  const { user } = useUser()
  const email = user?.primaryEmailAddress
  if (!email) return null

  const verified = email.verification?.status === 'verified'

  return (
    <div className="space-y-1">

      <div className="flex items-center gap-2 text-sm">
        <span
          className={cn(
            'inline-block h-2 w-2 rounded-full',
            verified ? 'bg-green-500' : 'bg-amber-500'
          )}
        />

        <span className="text-muted-foreground">
          {verified ? 'verified' : 'not verified'}
        </span>
      </div>
    </div>
  )
}

export default EmailStatus
