'use client'

import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LANGUAGES } from '../types/languages'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface LanguageSelectorHorizontalProps {
  selectedLanguage: string
  onLanguageChange: (language: string) => void
}

export function LanguageSelectorHorizontal({ 
  selectedLanguage, 
  onLanguageChange,
}: LanguageSelectorHorizontalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const ref = scrollRef.current
    ref?.addEventListener('scroll', checkScroll)
    window.addEventListener('resize', checkScroll)
    return () => {
      ref?.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative group">
      <button
        onClick={() => scroll('left')}
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full flex items-center justify-center',
          'bg-gradient-to-r from-background via-background to-transparent',
          'transition-opacity duration-300',
          canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
      </button>

      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto py-2 px-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {LANGUAGES.map((lang) => {
          const isActive = selectedLanguage === lang.id
          const IconComponent = (LucideIcons[lang.icon as keyof typeof LucideIcons] || LucideIcons.Code2) as LucideIcon

          return (
            <button
              key={lang.id}
              onClick={() => onLanguageChange(lang.id)}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap select-none',
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              )}
            >
              <IconComponent 
                className={cn(
                  'h-4 w-4 transition-colors duration-300',
                  isActive ? 'text-current' : 'text-muted-foreground'
                )}
              />
              <span>{lang.name}</span>
            </button>
          )
        })}
      </div>

      <button
        onClick={() => scroll('right')}
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full flex items-center justify-center',
          'bg-gradient-to-l from-background via-background to-transparent',
          'transition-opacity duration-300',
          canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </button>

      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}