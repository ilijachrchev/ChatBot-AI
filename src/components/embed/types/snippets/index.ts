import { javascriptSnippet } from './javascript'
import { reactSnippet } from './react'
import { nextjsSnippet } from './nextjs'
import { vueSnippet } from './vue'
import { angularSnippet } from './angular'
import { svelteSnippet } from './svelte'
import { phpSnippet } from './php'
import { laravelSnippet } from './laravel'
import { pythonSnippet } from './python'
import { rubySnippet } from './ruby'
import { goSnippet } from './go'
import { javaSnippet } from './java'
import { csharpSnippet } from './csharp'
import { swiftSnippet } from './swift'
import { SnippetGenerator } from '../index'
import { nodeSnippet } from './node'

export const CODE_SNIPPETS: Record<string, SnippetGenerator> = {
  javascript: javascriptSnippet,
  react: reactSnippet,
  nextjs: nextjsSnippet,
  vue: vueSnippet,
  angular: angularSnippet,
  svelte: svelteSnippet,
  php: phpSnippet,
  laravel: laravelSnippet,
  python: pythonSnippet,
  ruby: rubySnippet,
  nodejs: nodeSnippet,
  go: goSnippet,
  java: javaSnippet,
  csharp: csharpSnippet,
  swift: swiftSnippet,
}

export function generateCodeSnippet(
  domainId: string,
  language: string,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
): string {
  const snippetGenerator = CODE_SNIPPETS[language] || javascriptSnippet
  return snippetGenerator(domainId, baseUrl)
}