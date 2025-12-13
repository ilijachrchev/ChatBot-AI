import { client } from '@/lib/prisma'
import { GeoLocation } from './ip-geolocation' 
import { DeviceInfo } from './device-fingerprint'

export interface RiskFactors {
  isNewDevice: boolean
  isNewLocation: boolean
  isNewCountry: boolean
  isDifferentCity: boolean
  recentFailedAttempts: number
  deviceIdMismatch: boolean
  userAgentChanged: boolean
}

export interface RiskAssessment {
  riskScore: number 
  requireOtp: boolean
  factors: RiskFactors
  reason?: string
}

export async function assessLoginRisk(
  userId: string,
  deviceId: string | null,
  deviceInfo: DeviceInfo,
  geoLocation: GeoLocation
): Promise<RiskAssessment> {
  let riskScore = 0
  const factors: RiskFactors = {
    isNewDevice: false,
    isNewLocation: false,
    isNewCountry: false,
    isDifferentCity: false,
    recentFailedAttempts: 0,
    deviceIdMismatch: false,
    userAgentChanged: false,
  }

  const trustedDevice = deviceId
    ? await client.trustedDevice.findFirst({
        where: {
          userId,
          deviceId,
          expiresAt: { gte: new Date() },
        },
      })
    : null

  if (!trustedDevice) {
    factors.isNewDevice = true
    riskScore += 40 
  } else {
    if (trustedDevice.userAgent !== deviceInfo.userAgent) {
      factors.userAgentChanged = true
      riskScore += 20
    }

    if (trustedDevice.country !== geoLocation.country) {
      factors.isNewCountry = true
      riskScore += 30
    } else if (trustedDevice.city !== geoLocation.city) {
      factors.isDifferentCity = true
      riskScore += 15
    }

    await client.trustedDevice.update({
      where: { id: trustedDevice.id },
      data: { 
        lastUsedAt: new Date(),
        ipAddress: geoLocation.ipAddress,
        city: geoLocation.city,
        country: geoLocation.country,
      },
    })
  }

  const failedAttempts = await client.loginAttempt.count({
    where: {
      userId,
      success: false,
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  })

  factors.recentFailedAttempts = failedAttempts
  if (failedAttempts >= 3) {
    riskScore += 25
  } else if (failedAttempts >= 1) {
    riskScore += 10
  }

  const lastSuccessfulLogin = await client.loginAttempt.findFirst({
    where: {
      userId,
      success: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 1,
  })

  if (lastSuccessfulLogin && lastSuccessfulLogin.country !== geoLocation.country) {
    factors.isNewCountry = true
    
    const timeSinceLastLogin = Date.now() - lastSuccessfulLogin.createdAt.getTime()
    const oneHour = 60 * 60 * 1000
    
    if (timeSinceLastLogin < oneHour) {
      riskScore += 50
    }
  }

  const requireOtp = riskScore >= 40

  let reason: string | undefined
  if (requireOtp) {
    if (factors.isNewDevice) {
      reason = 'New device detected'
    } else if (factors.isNewCountry) {
      reason = 'Login from new country'
    } else if (factors.recentFailedAttempts >= 3) {
      reason = 'Multiple failed login attempts detected'
    } else if (factors.userAgentChanged) {
      reason = 'Device configuration changed'
    }
  }

  return {
    riskScore: Math.min(riskScore, 100),
    requireOtp,
    factors,
    reason,
  }
}