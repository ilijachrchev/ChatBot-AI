import { cn } from '@/lib/utils'

interface CodeSkeletonProps {
  lines?: number
}

export function CodeSkeleton({ lines = 12 }: CodeSkeletonProps) {
  const lineWidths = [
    'w-[30%]', 'w-[85%]', 'w-[60%]', 'w-[75%]', 'w-[40%]',
    'w-[90%]', 'w-[55%]', 'w-[70%]', 'w-[45%]', 'w-[80%]',
    'w-[35%]', 'w-[65%]'
  ]

  return (
    <div className="space-y-3 p-6">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-6 h-4 bg-muted animate-pulse rounded" />
          <div 
            className={cn(
              'h-4 bg-muted animate-pulse rounded',
              lineWidths[i % lineWidths.length]
            )}
            style={{ animationDelay: `${i * 50}ms` }}
          />
        </div>
      ))}
    </div>
  )
}