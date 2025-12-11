'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LANGUAGES } from '../types/languages'
import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageSelectorProps {
  selectedLanguage: string
  onLanguageChange: (language: string) => void
}

export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
}: LanguageSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Framework</h3>
        <p className="text-sm text-muted-foreground">
          Choose your preferred language or framework to get the embed code
        </p>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang) => {
            const IconComponent =
              LucideIcons[lang.icon as keyof typeof LucideIcons] ||
              LucideIcons.Code2

            return (
              <Button
                key={lang.id}
                variant={selectedLanguage === lang.id ? 'default' : 'outline'}
                className={cn(
                  'h-auto py-4 px-4 justify-start gap-3 transition-all',
                  selectedLanguage === lang.id
                    ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                    : 'hover:scale-105 hover:shadow-md'
                )}
                onClick={() => onLanguageChange(lang.id)}
              >
                {/* @ts-ignore */}
                <IconComponent className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{lang.name}</span>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}