import { headers } from 'next/headers'
import { UAParser } from 'ua-parser-js'

export interface DeviceInfo {
  userAgent: string
  browserName: string | undefined
  browserVersion: string | undefined
  osName: string | undefined
  osVersion: string | undefined
  deviceType: string | undefined
  deviceFingerprint: string
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent') || 'Unknown'
  
  const parser = new UAParser(userAgent)
  const result = parser.getResult()
  
  const fingerprint = `${result.browser.name}-${result.os.name}-${result.os.version}`
  
  return {
    userAgent,
    browserName: result.browser.name,
    browserVersion: result.browser.version,
    osName: result.os.name,
    osVersion: result.os.version,
    deviceType: result.device.type || 'desktop',
    deviceFingerprint: fingerprint,
  }
}

export function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}