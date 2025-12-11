'use client'

import { useEffect, useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface SyntaxHighlighterComponentProps {
  code: string
  language: string
}

export function SyntaxHighlighterComponent({
  code,
  language,
}: SyntaxHighlighterComponentProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <pre className="bg-[#282c34] p-4 rounded-lg overflow-x-auto">
        <code className="text-sm text-gray-300">{code}</code>
      </pre>
    )
  }

  const languageMap: Record<string, string> = {
    javascript: 'javascript',
    typescript: 'typescript',
    react: 'jsx',
    nextjs: 'jsx',
    vue: 'markup',
    svelte: 'markup',
    angular: 'typescript',
    nodejs: 'javascript',
    php: 'php',
    python: 'python',
    ruby: 'ruby',
    java: 'java',
    csharp: 'csharp',
    go: 'go',
    swift: 'swift',
    laravel: 'php',
  }

  const highlightLanguage = languageMap[language] || 'javascript'

  return (
    <SyntaxHighlighter
      language={highlightLanguage}
      style={oneDark}
      customStyle={{
        margin: 0,
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        lineHeight: '1.5',
      }}
      showLineNumbers
      wrapLines
    >
      {code}
    </SyntaxHighlighter>
  )
}