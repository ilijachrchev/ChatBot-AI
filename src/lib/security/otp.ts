import crypto from 'crypto'
import { client } from '@/lib/prisma'

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function hashOTP(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

export async function createOTPCode(userId: string): Promise<{ code: string; otpId: string }> {
  const code = generateOTP()
  const codeHash = hashOTP(code)
  
  await client.otpCode.deleteMany({
    where: {
      userId,
      verifiedAt: null,
      expiresAt: {
        gte: new Date(),
      },
    },
  })
  
  const otpCode = await client.otpCode.create({
    data: {
      userId,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), 
    },
  })
  
  return {
    code, 
    otpId: otpCode.id,
  }
}

export async function verifyOTPCode(
  userId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  const codeHash = hashOTP(code)
  
  const otpCode = await client.otpCode.findFirst({
    where: {
      userId,
      codeHash,
      verifiedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
  
  if (!otpCode) {
    return { success: false, error: 'Invalid verification code' }
  }
  
  if (otpCode.expiresAt < new Date()) {
    return { success: false, error: 'Verification code has expired' }
  }
  
  if (otpCode.attempts >= otpCode.maxAttempts) {
    return { success: false, error: 'Too many attempts. Please request a new code' }
  }
  
  await client.otpCode.update({
    where: { id: otpCode.id },
    data: {
      attempts: otpCode.attempts + 1,
    },
  })
  
  await client.otpCode.update({
    where: { id: otpCode.id },
    data: {
      verifiedAt: new Date(),
    },
  })
  
  return { success: true }
}