'use client'

import { useState, useEffect } from 'react'
import { Code2 } from 'lucide-react'
import { LanguageSelectorHorizontal } from './ui/language-selector-horizontal'
import { CodeDisplay } from './ui/code-display'
import { generateCodeSnippet } from './types/snippets'

interface EmbedCodePanelProps {
  domainId: string
  domainName?: string
}

export function EmbedCodePanel({ domainId, domainName }: EmbedCodePanelProps) {
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [codeSnippet, setCodeSnippet] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const snippet = generateCodeSnippet(domainId, selectedLanguage)
      setCodeSnippet(snippet)
      setIsLoading(false)
    }, 250)

    return () => clearTimeout(timer)
  }, [domainId, selectedLanguage])

  const handleLanguageChange = (languageId: string) => {
    if (languageId !== selectedLanguage) {
      setIsLoading(true)
      setSelectedLanguage(languageId)
    }
  }

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="text-center mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Code2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Developer Integration</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
          Embed Code for Your Integration
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Integrate SendWise-AI in {domainName || 'your chatbot'} in just a few minutes. Choose your language and start 
          embedding with just a few lines of code.
        </p>
      </div>

      <div className="mb-6">
        <div className="rounded-xl border border-border p-2 bg-card">
          <LanguageSelectorHorizontal
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </div>

      <CodeDisplay
        code={codeSnippet}
        language={selectedLanguage}
        isLoading={isLoading}
      />

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Implementation Steps</h3>
        <ol className="space-y-3 text-sm">
          <li className="text-muted-foreground">
            <span className="font-semibold text-foreground">1. Copy the code</span> from the snippet above
          </li>
          <li className="text-muted-foreground">
            <span className="font-semibold text-foreground">2. Paste it</span> into your website or application
          </li>
          <li className="text-muted-foreground">
            <span className="font-semibold text-foreground">3. Configure</span> the widget settings in your dashboard
          </li>
          <li className="text-muted-foreground">
            <span className="font-semibold text-foreground">4. Test</span> the chatbot to ensure it's working correctly
          </li>
        </ol>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span>All 15 languages fully supported</span>
        </div>
        
        <div className="flex items-center gap-4">
          <a 
            href="#" 
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            View full documentation
          </a>
          <span className="text-border">•</span>
          <a 
            href="#" 
            className="hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            API Reference
          </a>
        </div>
      </div>
    </section>
  )
}