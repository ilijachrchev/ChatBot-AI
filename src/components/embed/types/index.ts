export type Language = {
  id: string
  name: string
  icon: string
}

export type SnippetGenerator = (domainId: string, baseUrl: string) => string

export * from './languages'
export * from './snippets'