// src/components/embed/types/snippets/index.ts

export type Language = {
  id: string
  name: string
  icon: string
}

export type SnippetGenerator = (domainId: string, baseUrl: string) => string

export * from '../languages'

export * from './javascript'
// export * from './typescript' 
export * from './react'
export * from './nextjs'
// // export * from './vue'
// export * from './svelte'
// export * from './angular'
// export * from './node'
// export * from './php'
// export * from './python'
// export * from './ruby'
// export * from './java'
// export * from './csharp'
// export * from './go'
// export * from './swift'
// export * from './laravel'
