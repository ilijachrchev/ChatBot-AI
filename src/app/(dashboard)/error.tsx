'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        Something went wrong
      </h2>
      <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
        {error.digest
          ? `Error ID: ${error.digest}`
          : 'Failed to load this page. Your data is safe — try refreshing.'}
      </p>
      <Button onClick={reset} variant="outline" size="sm">
        Try again
      </Button>
    </div>
  )
}
