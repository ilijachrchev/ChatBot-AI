'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { 
  validateAndNormalizeDomain, 
  generateVerificationToken 
} from '@/lib/domain-utils'
import { verifyDomainOwnership } from '@/lib/domain-verification'


export const onCreateDomain = async (domainInput: string, icon: string) => {
  const user = await currentUser()
  if (!user) {
    return { status: 401, message: 'Unauthorized' }
  }

  try {
    const validation = validateAndNormalizeDomain(domainInput)
    
    if (!validation.valid) {
      return {
        status: 400,
        message: validation.error,
      }
    }

    const normalizedDomain = validation.normalized!

    const existingDomain = await client.domain.findFirst({
      where: {
        name: normalizedDomain,
        User: {
          clerkId: user.id,
        },
      },
    })

    if (existingDomain) {
      return {
        status: 400,
        message: 'You already have this domain',
      }
    }

    const verifiedByOther = await client.domain.findFirst({
      where: {
        name: normalizedDomain,
        verificationStatus: 'VERIFIED',
        User: {
          clerkId: {
            not: user.id,
          },
        },
      },
    })

    if (verifiedByOther) {
      return {
        status: 400,
        message: 'This domain is already verified by another account',
      }
    }

    const subscription = await client.user.findUnique({
      where: { clerkId: user.id },
      select: {
        _count: {
          select: { domains: true },
        },
        subscription: {
          select: { plan: true },
        },
      },
    })

    const limits = {
      STANDARD: 1,
      PRO: 5,
      ULTIMATE: 10,
    }

    const plan = subscription?.subscription?.plan || 'STANDARD'
    const currentCount = subscription?._count.domains || 0
    const limit = limits[plan]

    if (currentCount >= limit) {
      return {
        status: 400,
        message: `You've reached the maximum of ${limit} domain(s) for your ${plan} plan. Upgrade to add more.`,
      }
    }

    const verificationToken = generateVerificationToken()

    const newDomain = await client.domain.create({
      data: {
        name: normalizedDomain,
        icon,
        verificationToken,
        verificationStatus: 'PENDING',
        User: {
          connect: { clerkId: user.id },
        },
        chatBot: {
          create: {
            welcomeMessage: 'Hey there, have a question? Text us here',
          },
        },
      },
      select: {
        id: true,
        name: true,
        verificationToken: true,
        verificationStatus: true,
      },
    })

    return {
      status: 200,
      message: 'Domain created. Please verify ownership.',
      domain: newDomain,
    }
  } catch (error) {
    console.error('Error creating domain:', error)
    return {
      status: 500,
      message: 'Internal server error',
    }
  }
}

export const onVerifyDomain = async (domainId: string) => {
  const user = await currentUser()
  if (!user) {
    return { status: 401, message: 'Unauthorized' }
  }

  try {
    const domain = await client.domain.findFirst({
      where: {
        id: domainId,
        User: {
          clerkId: user.id,
        },
      },
      select: {
        id: true,
        name: true,
        verificationToken: true,
        verificationStatus: true,
      },
    })

    if (!domain) {
      return {
        status: 404,
        message: 'Domain not found',
      }
    }

    if (domain.verificationStatus === 'VERIFIED') {
      return {
        status: 200,
        message: 'Domain is already verified',
        verified: true,
      }
    }

    console.log(`🔍 Verifying domain: ${domain.name}`)
    const result = await verifyDomainOwnership(domain.name, domain.verificationToken)

    if (result.success) {
      await client.domain.update({
        where: { id: domainId },
        data: {
          verificationStatus: 'VERIFIED',
          verificationMethod: result.method,
          verifiedAt: new Date(),
          lastVerifiedAt: new Date(),
        },
      })

      return {
        status: 200,
        message: `Domain verified successfully via ${result.method}`,
        verified: true,
        method: result.method,
      }
    }

    await client.domain.update({
      where: { id: domainId },
      data: {
        verificationStatus: 'FAILED',
        lastVerifiedAt: new Date(),
      },
    })

    return {
      status: 400,
      message: result.error || 'Verification failed',
      verified: false,
      details: result.details,
    }
  } catch (error) {
    console.error('Error verifying domain:', error)
    return {
      status: 500,
      message: 'Internal server error',
    }
  }
}


export const onGetDomainVerificationStatus = async (domainId: string) => {
  const user = await currentUser()
  if (!user) {
    return { status: 401, message: 'Unauthorized' }
  }

  try {
    const domain = await client.domain.findFirst({
      where: {
        id: domainId,
        User: {
          clerkId: user.id,
        },
      },
      select: {
        id: true,
        name: true,
        verificationToken: true,
        verificationStatus: true,
        verificationMethod: true,
        verifiedAt: true,
        lastVerifiedAt: true,
      },
    })

    if (!domain) {
      return {
        status: 404,
        message: 'Domain not found',
      }
    }

    return {
      status: 200,
      domain,
    }
  } catch (error) {
    console.error('Error getting domain status:', error)
    return {
      status: 500,
      message: 'Internal server error',
    }
  }
}