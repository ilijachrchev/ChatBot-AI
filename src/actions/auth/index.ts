'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { onGetAllAccountDomains, onSaveKeepMeLoggedInOnLogin } from '../settings'
import { redirect } from 'next/navigation'
import { getDeviceInfo } from '@/lib/security/device-fingerprint'
import { getGeoLocation } from '@/lib/security/ip-geolocation'
import { assessLoginRisk } from '@/lib/security/risk-scoring' 
import { createOTPCode, verifyOTPCode } from '@/lib/security/otp'
import { sendOTPEmail } from '@/lib/security/email'

export const onCompleteUserRegistration = async (
  fullname: string,
  clerkId: string,
  type: string
) => {
  try {
    const registered = await client.user.create({
      data: {
        fullname,
        clerkId,
        type,
        subscription: {
          create: {},
        },
      },
      select: {
        fullname: true,
        id: true,
        type: true,
      },
    })

    if (registered) {
      return { status: 200, user: registered }
    }
  } catch (error) {
    return { status: 400 }
  }
}

export const onLoginUser = async () => {
  const user = await currentUser()
  if (!user) redirect('/auth/sign-in');

    try {
      let authenticated = await client.user.findUnique({
        where: {
          clerkId: user.id,
        },
        select: {
          fullname: true,
          id: true,
          type: true,
        },
      })
      if (!authenticated) {
        const fullname =
          `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.emailAddresses?.[0]?.emailAddress || 'Unknown User';

          authenticated = await client.user.create({
            data: {
              fullname,
              clerkId: user.id,
              type: 'STANDARD',
              subscription: { create: {} }
            },
            select: {
              fullname: true,
              id: true,
              type: true,
            },
          })
        }
        const acc = await onGetAllAccountDomains();
        const domains = acc?.domains ?? []
        return { status: 200, user: authenticated, domains }
      } catch (error) {
        console.log('onLoginUser error:', error);
        return { status: 400 }
      }
    }

export const onCheckLoginRisk = async (
  clerkId: string,
  email: string,
  deviceId: string | null
) => {
  try {
    const user = await client.user.findUnique({
      where: {
        clerkId,
      },
    })

    if (!user) {
      return { 
        requireOtp: false, 
        error: 'User not found' 
      }
    }

    const deviceInfo = await getDeviceInfo()
    const geoLocation = await getGeoLocation()

    const riskAssessment = await assessLoginRisk(
      user.id,
      deviceId,
      deviceInfo,
      geoLocation
    )

    await client.loginAttempt.create({
      data: {
        userId: user.id,
        email,
        success: false,
        riskScore: riskAssessment.riskScore,
        ipAddress: geoLocation.ipAddress,
        city: geoLocation.city,
        country: geoLocation.country,
        userAgent: deviceInfo.userAgent,
        browserName: deviceInfo.browserName,
        deviceType: deviceInfo.deviceType,
        deviceId,
        isTrustedDevice: !riskAssessment.requireOtp,
        otpRequired: riskAssessment.requireOtp,
      },
    })

    if (riskAssessment.requireOtp) {
      const { code } = await createOTPCode(user.id)
      const emailResult = await sendOTPEmail(email, code, user.fullname)

      if (!emailResult.success) {
        return {
          requireOtp: true,
          error: 'Failed to send verification code',
        }
      }

      await client.pendingLogin.create({
        data: {
          userId: user.id,
          email,
          deviceId,
          ipAddress: geoLocation.ipAddress,
          userAgent: deviceInfo.userAgent,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), 
        },
      })

      return {
        requireOtp: true,
        reason: riskAssessment.reason,
        riskScore: riskAssessment.riskScore,
        userId: user.id,
      }
    }

    return {
      requireOtp: false,
      riskScore: riskAssessment.riskScore,
    }
  } catch (error) {
    console.error('Error checking login risk:', error)
    return {
      requireOtp: false,
      error: 'Failed to assess login risk',
    }
  }
}

export const onVerifyLoginOTP = async (
  userId: string,
  code: string,
  deviceId: string | null
) => {
  try {
    const verification = await verifyOTPCode(userId, code)

    if (!verification.success) {
      return {
        success: false,
        error: verification.error,
      }
    }

    const deviceInfo = await getDeviceInfo()
    const geoLocation = await getGeoLocation()

    if (deviceId) {
      await client.trustedDevice.upsert({
        where: { deviceId },
        create: {
          userId,
          deviceId,
          deviceFingerprint: deviceInfo.deviceFingerprint,
          userAgent: deviceInfo.userAgent,
          browserName: deviceInfo.browserName,
          browserVersion: deviceInfo.browserVersion,
          osName: deviceInfo.osName,
          osVersion: deviceInfo.osVersion,
          deviceType: deviceInfo.deviceType,
          ipAddress: geoLocation.ipAddress,
          city: geoLocation.city,
          region: geoLocation.region,
          country: geoLocation.country,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
        },
        update: {
          lastUsedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    }

    await client.loginAttempt.updateMany({
      where: {
        userId,
        success: false,
        otpRequired: true,
      },
      data: {
        success: true,
        otpVerified: true,
      },
    })

    await client.pendingLogin.deleteMany({
      where: { userId },
    })

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return {
      success: false,
      error: 'Failed to verify code',
    }
  }
}

export const onVerifyLoginOTPWithToken = async (
  token: string,
  code: string,
  deviceId: string | null
) => {
  try {
    const decoded = JSON.parse(atob(token))
    const { userId, sessionId, keepMeLoggedIn } = decoded

    const verification = await verifyOTPCode(userId, code)

    if (!verification.success) {
      return {
        success: false,
        error: verification.error,
      }
    }

    if (deviceId) {
      const deviceInfo = await getDeviceInfo()
      const geoLocation = await getGeoLocation()

      await client.trustedDevice.upsert({
        where: { deviceId },
        create: {
          userId,
          deviceId,
          deviceFingerprint: deviceInfo.deviceFingerprint,
          userAgent: deviceInfo.userAgent,
          browserName: deviceInfo.browserName,
          browserVersion: deviceInfo.browserVersion,
          osName: deviceInfo.osName,
          osVersion: deviceInfo.osVersion,
          deviceType: deviceInfo.deviceType,
          ipAddress: geoLocation.ipAddress,
          city: geoLocation.city,
          region: geoLocation.region,
          country: geoLocation.country,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        update: {
          lastUsedAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      })
    }

    await client.loginAttempt.updateMany({
      where: {
        userId,
        success: false,
        otpRequired: true,
      },
      data: {
        success: true,
        otpVerified: true,
      },
    })

    await client.pendingLogin.deleteMany({
      where: { userId },
    })

    await onSaveKeepMeLoggedInOnLogin(keepMeLoggedIn)

    return { success: true }
  } catch (error) {
    console.error('Error verifying OTP with token:', error)
    return {
      success: false,
      error: 'Failed to verify code',
    }
  }
}

export const onResendLoginOTP = async (token: string) => {
  try {
    const decoded = JSON.parse(atob(token))
    const { userId, email } = decoded

    const user = await client.user.findUnique({
      where: { id: userId },
      select: { fullname: true },
    })

    if (!user) {
      return {
        success: false,
        error: 'User not found',
      }
    }

    const { resendOTPCode } = await import('@/lib/security/otp')
    const result = await resendOTPCode(userId)

    if (!result.success || !result.code) {
      return {
        success: false,
        error: result.error || 'Failed to resend code',
      }
    }

    const emailResult = await sendOTPEmail(email, result.code, user.fullname)

    if (!emailResult.success) {
      return {
        success: false,
        error: 'Failed to send email',
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error('Error resending OTP:', error)
    return {
      success: false,
      error: 'Failed to resend code',
    }
  }
}

export const onOAuthLogin = async (clerkId: string, email: string) => {
  try {
    let user = await client.user.findUnique({
      where: { clerkId },
    })

    if (!user) {
      const clerkUser = await currentUser()
      if (!clerkUser) {
        return { status: 401, error: 'Unauthorized' }
      }

      const fullname = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'User'

      user = await client.user.create({
        data: {
          clerkId,
          fullname,
          type: 'OWNER', 
          avatar: clerkUser.imageUrl,
          subscription: {
            create: {},
          },
        },
      })
    }

    let deviceId: string | null = null

    const deviceInfo = await getDeviceInfo()
    const geoLocation = await getGeoLocation()

    const riskAssessment = await assessLoginRisk(
      user.id,
      deviceId,
      deviceInfo,
      geoLocation
    )

    await client.loginAttempt.create({
      data: {
        userId: user.id,
        email,
        success: !riskAssessment.requireOtp,
        riskScore: riskAssessment.riskScore,
        ipAddress: geoLocation.ipAddress,
        city: geoLocation.city,
        country: geoLocation.country,
        userAgent: deviceInfo.userAgent,
        browserName: deviceInfo.browserName,
        deviceType: deviceInfo.deviceType,
        deviceId,
        isTrustedDevice: !riskAssessment.requireOtp,
        otpRequired: riskAssessment.requireOtp,
      },
    })

    if (riskAssessment.requireOtp) {
      const { code } = await createOTPCode(user.id)
      await sendOTPEmail(email, code, user.fullname)

      await client.pendingLogin.create({
        data: {
          userId: user.id,
          email,
          deviceId,
          ipAddress: geoLocation.ipAddress,
          userAgent: deviceInfo.userAgent,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        },
      })

      return {
        status: 200,
        requireOtp: true,
        userId: user.id,
        email,
        reason: riskAssessment.reason,
      }
    }

    return {
      status: 200,
      requireOtp: false,
      user,
    }
  } catch (error) {
    console.error('OAuth login error:', error)
    return {
      status: 500,
      error: 'Failed to process OAuth login',
    }
  }
}

export const onUpdateUserTypeAfterOAuth = async (clerkId: string, type: string) => {
  try {
    await client.user.update({
      where: { clerkId },
      data: { type },
    })
    return { status: 200 }
  } catch (error) {
    console.error('Error updating user type:', error)
    return { status: 500 }
  }
}