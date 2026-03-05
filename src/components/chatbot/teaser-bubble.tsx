'use client'

import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Props = {
  message: string
  position: 'left' | 'right'
  onDismiss: () => void
  theme?: string | null
}

const TeaserBubble = ({ message, position, onDismiss }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'absolute bottom-0 z-50',
        position === 'left' ? 'right-[88px]' : 'left-[88px]'
      )}
    >
      <div className="relative bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-lg shadow-slate-200/50 max-w-[200px] min-w-[140px]">
        <p className="text-sm font-medium text-slate-800 leading-snug pr-5">
          {message}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onDismiss()
          }}
          className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>

        <div
          className={cn(
            'absolute bottom-4 w-3 h-3 bg-white',
            position === 'left'
              ? '-right-[6px] border-r border-b border-slate-200 rotate-[-45deg]'
              : '-left-[6px] border-l border-b border-slate-200 rotate-[45deg]'
          )}
        />
      </div>
    </motion.div>
  )
}

export default TeaserBubble
