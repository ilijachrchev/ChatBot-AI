export type DomainValidationResult = {
  valid: boolean
  normalized?: string
  error?: string
}

export function normalizeDomain(input: string): string {
  if (!input) return ''

  let domain = input.trim().toLowerCase()

  domain = domain.replace(/^https?:\/\//, '')

  domain = domain.replace(/^www\./, '')

  domain = domain.split('/')[0].split('?')[0]

  domain = domain.split(':')[0]

  return domain
}

export function isValidDomain(domain: string): boolean {
  if (!domain.includes('.')) return false

  if (domain.length === 0) return false

  const domainRegex = /^(?!-)(?:[a-z0-9-]{1,63}\.)+[a-z]{2,}$/i

  return domainRegex.test(domain)
}

export function validateAndNormalizeDomain(input: string): DomainValidationResult {
  if (!input || input.trim().length === 0) {
    return {
      valid: false,
      error: 'Domain cannot be empty',
    }
  }

  const normalized = normalizeDomain(input)

  if (!normalized) {
    return {
      valid: false,
      error: 'Invalid domain format',
    }
  }

  if (!isValidDomain(normalized)) {
    return {
      valid: false,
      error: 'Invalid domain format. Please enter a valid domain (e.g., example.com)',
    }
  }

  if (normalized.includes(' ')) {
    return {
      valid: false,
      error: 'Domain cannot contain spaces',
    }
  }

  const prohibitedDomains = [
    'localhost',
    'test.com',
    'example.com',
    'google.com',
    'facebook.com',
    'twitter.com',
    'instagram.com',
    'youtube.com',
  ]

  if (prohibitedDomains.includes(normalized)) {
    return {
      valid: false,
      error: 'This domain cannot be used. Please use a domain you own.',
    }
  }

  return {
    valid: true,
    normalized,
  }
}

export function generateVerificationToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  
  for (let i = 0; i < 32; i++) {
    token += chars[Math.floor(Math.random() * chars.length)]
  }
  
  return token
}

export function maskToken(token: string): string {
  if (token.length <= 12) return token
  
  return `${token.slice(0, 8)}••••••••${token.slice(-4)}`
}

export function getDnsTxtInstructions(token: string) {
  return {
    type: 'TXT',
    name: '@',
    value: `sendwise-verify=${token}`,
  }
}

export function getMetaTag(token: string): string {
  return `<meta name="sendwise-verification" content="${token}" />`
}

export function getVerificationFileUrl(domain: string): string {
  return `https://${domain}/.well-known/sendwise-verify.txt`
}

export function getVerificationFileContent(token: string): string {
  return token
}