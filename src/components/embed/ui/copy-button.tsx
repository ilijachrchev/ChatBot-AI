'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  code: string
  className?: string
}

export function CopyButton({ code, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'relative flex items-center gap-2 px-3 py-2 rounded-lg',
        'text-sm font-medium transition-all duration-300',
        copied 
          ? 'bg-green-500/20 text-green-500' 
          : 'bg-secondary hover:bg-accent text-muted-foreground hover:text-foreground',
        className
      )}
      aria-label={copied ? 'Copied!' : 'Copy code'}
    >
      <div className="relative w-4 h-4">
        <Copy 
          className={cn(
            'absolute inset-0 h-4 w-4 transition-all duration-300',
            copied ? 'opacity-0 scale-50 rotate-12' : 'opacity-100 scale-100 rotate-0'
          )}
        />
        <Check 
          className={cn(
            'absolute inset-0 h-4 w-4 transition-all duration-300',
            copied ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-12'
          )}
        />
      </div>
      <span className={cn(
        'transition-all duration-300',
        copied ? 'translate-x-0' : ''
      )}>
        {copied ? 'Copied!' : 'Copy'}
      </span>
    </button>
  )
}