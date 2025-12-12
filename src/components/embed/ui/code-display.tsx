'use client'

import { Card } from '@/components/ui/card'
import { SyntaxHighlighterComponent } from './syntax-highlighter'
import { CopyButton } from './copy-button'
import { CodeSkeleton } from './code-skeleton'
import { Suspense } from 'react'

interface CodeDisplayProps {
  code: string
  language: string
  isLoading?: boolean
}

export function CodeDisplay({ code, language, isLoading }: CodeDisplayProps) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <CodeSkeleton />
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-sm font-medium text-muted-foreground ml-2">
            {language}.{getFileExtension(language)}
          </span>
        </div>
        <CopyButton code={code} />
      </div>
      <div className="max-h-[600px] overflow-auto">
        <Suspense fallback={<CodeSkeleton />}>
          <SyntaxHighlighterComponent code={code} language={language} />
        </Suspense>
      </div>
    </Card>
  )
}

function getFileExtension(language: string): string {
  const extensions: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    react: 'jsx',
    nextjs: 'tsx',
    vue: 'vue',
    svelte: 'svelte',
    angular: 'ts',
    nodejs: 'js',
    php: 'php',
    python: 'py',
    ruby: 'rb',
    java: 'java',
    csharp: 'cs',
    go: 'go',
    swift: 'swift',
    laravel: 'blade.php',
  }
  return extensions[language] || 'txt'
}