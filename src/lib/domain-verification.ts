import { promises as dns } from 'dns'

export type VerificationMethod = 'DNS' | 'META' | 'FILE'

export type VerificationResult = {
  success: boolean
  method?: VerificationMethod
  error?: string
  details?: string
}


async function verifyDnsTxt(
  domain: string,
  token: string
): Promise<VerificationResult> {
  try {
    const records = await dns.resolveTxt(domain)
    
    const txtRecords = records.map(record => record.join(''))
    
    const expectedValue = `sendwise-verify=${token}`
    const found = txtRecords.some(record => 
      record.trim() === expectedValue
    )
    
    if (found) {
      return {
        success: true,
        method: 'DNS',
        details: 'DNS TXT record verified successfully',
      }
    }
    
    return {
      success: false,
      error: 'DNS TXT record not found or incorrect',
      details: `Expected: ${expectedValue}`,
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'DNS verification failed',
      details: error.code === 'ENODATA' 
        ? 'No TXT records found for this domain'
        : error.code === 'ENOTFOUND'
        ? 'Domain not found in DNS'
        : `DNS error: ${error.message}`,
    }
  }
}


async function verifyMetaTag(
  domain: string,
  token: string
): Promise<VerificationResult> {
  try {
    const url = `https://${domain}`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'SendWise-AI-Bot/1.0',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(15000), 
    })
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: 'Could not fetch domain homepage',
      }
    }
    
    const html = await response.text()
    
    const metaRegex = new RegExp(
      `<meta[^>]*name=["']sendwise-verification["'][^>]*content=["']${token}["'][^>]*>`,
      'i'
    )
    
    const metaRegexReverse = new RegExp(
      `<meta[^>]*content=["']${token}["'][^>]*name=["']sendwise-verification["'][^>]*>`,
      'i'
    )
    
    const found = metaRegex.test(html) || metaRegexReverse.test(html)
    
    if (found) {
      return {
        success: true,
        method: 'META',
        details: 'HTML meta tag verified successfully',
      }
    }
    
    return {
      success: false,
      error: 'Meta tag not found in page HTML',
      details: 'Please ensure the meta tag is in the <head> section',
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout',
        details: 'Domain took too long to respond (>10s)',
      }
    }
    
    return {
      success: false,
      error: 'Failed to fetch domain',
      details: error.message || 'Network error',
    }
  }
}


async function verifyFile(
  domain: string,
  token: string
): Promise<VerificationResult> {
  try {
    const url = `https://${domain}/.well-known/sendwise-verify.txt`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'SendWise-AI-Bot/1.0',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000), // 10s timeout
    })
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
        details: 'Verification file not found',
      }
    }
    
    const content = await response.text()
    const trimmedContent = content.trim()
    
    if (trimmedContent === token) {
      return {
        success: true,
        method: 'FILE',
        details: 'Verification file confirmed',
      }
    }
    
    return {
      success: false,
      error: 'File content does not match token',
      details: `Expected: ${token}\nFound: ${trimmedContent.substring(0, 50)}...`,
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout',
        details: 'File took too long to load (>10s)',
      }
    }
    
    return {
      success: false,
      error: 'Failed to fetch verification file',
      details: error.message || 'Network error',
    }
  }
}

export async function verifyDomainOwnership(
  domain: string,
  token: string
): Promise<VerificationResult> {
  console.log(`🔍 Starting verification for domain: ${domain}`)
  
  console.log('📡 Checking DNS TXT record...')
  console.log("Resolving TXT for:", `"${domain}"`);
  const dnsResult = await verifyDnsTxt(domain, token)
  if (dnsResult.success) {
    console.log('✅ DNS verification successful')
    return dnsResult
  }
  console.log(`❌ DNS failed: ${dnsResult.error}`)
  
  console.log('🏷️  Checking HTML meta tag...')
  const metaResult = await verifyMetaTag(domain, token)
  if (metaResult.success) {
    console.log('✅ Meta tag verification successful')
    return metaResult
  }
  console.log(`❌ Meta tag failed: ${metaResult.error}`)
  
  console.log('📄 Checking verification file...')
  const fileResult = await verifyFile(domain, token)
  if (fileResult.success) {
    console.log('✅ File verification successful')
    return fileResult
  }
  console.log(`❌ File failed: ${fileResult.error}`)
  
  return {
    success: false,
    error: 'All verification methods failed',
    details: [
      `DNS: ${dnsResult.error}`,
      `Meta: ${metaResult.error}`,
      `File: ${fileResult.error}`,
    ].join('\n'),
  }
}