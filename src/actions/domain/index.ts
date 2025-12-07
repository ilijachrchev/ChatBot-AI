'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { 
  validateAndNormalizeDomain, 
  generateVerificationToken 
} from '@/lib/domain-utils'
import { verifyDomainOwnership } from '@/lib/domain-verification'
import { Domain } from '@/generated/prisma/wasm'


export const onCreateDomain = async (
  domainInput: string,
  icon?: string
): Promise<{
  status: number
  message: string
  domain?: Domain
}> => {
  try {
    const user = await currentUser()

    if (!user) {
      return {
        status: 401,
        message: 'Unauthorized',
      }
    }

    const dbUser = await client.user.findUnique({
      where: {
        clerkId: user.id,
      },
      select: {
        id: true,
      },
    })

    if (!dbUser) {
      return {
        status: 401,
        message: 'User not found in database',
      }
    }

    const validation = validateAndNormalizeDomain(domainInput)
    if (!validation.valid) {
      return {
        status: 400,
        message: validation.error || 'Invalid domain',
      }
    }

    const normalizedDomain = validation.normalized!

    const userExistingDomain = await client.domain.findFirst({
      where: {
        name: normalizedDomain,
        userId: dbUser.id,
      },
    })

    if (userExistingDomain) {
      return {
        status: 400,
        message: 'You already have this domain in your account',
      }
    }

    const verifiedByOther = await client.domain.findFirst({
      where: {
        name: normalizedDomain,
        verificationStatus: 'VERIFIED',
        userId: { not: dbUser.id },
      },
    })

    if (verifiedByOther) {
      return {
        status: 400,
        message: 'This domain has already been verified by another user',
      }
    }

    const pendingCount = await client.domain.count({
      where: {
        name: normalizedDomain,
        verificationStatus: 'PENDING',
      },
    })

    if (pendingCount >= 2) {
      return {
        status: 400,
        message: 'This domain is currently pending verification on 2 accounts. Please verify one of them first, or contact support if you need help accessing your account.',
      }
    }

    const existingDomains = await client.domain.count({
      where: {
        userId: dbUser.id,
      },
    })

    const subscription = await client.billings.findUnique({
      where: {
        userId: dbUser.id,
      },
      select: {
        plan: true,
      },
    })

    const plan = subscription?.plan || 'STANDARD'
    const limits = {
      STANDARD: 1,
      PRO: 5,
      ULTIMATE: 10,
    }

    if (existingDomains >= limits[plan]) {
      return {
        status: 403,
        message: `You've reached your domain limit (${limits[plan]}) for the ${plan} plan`,
      }
    }

    const verificationToken = generateVerificationToken()

    let domain
    try {
      domain = await client.domain.create({
        data: {
          name: normalizedDomain,
          icon: icon || '/favicon.ico',
          userId: dbUser.id,
          verificationToken,
          verificationStatus: 'PENDING',
        },
      })
    } catch (createError: any) {
      if (createError.code === 'P2002') {
        const existingPending = await client.domain.findFirst({
          where: {
            name: normalizedDomain,
            verificationStatus: 'PENDING',
            userId: dbUser.id,
          },
        })

        if (existingPending) {
          return {
            status: 400,
            message: 'You already have this domain pending verification in your account',
          }
        }

        const otherPending = await client.domain.count({
          where: {
            name: normalizedDomain,
            verificationStatus: 'PENDING',
          },
        })

        if (otherPending >= 2) {
          return {
            status: 400,
            message: 'This domain is currently pending verification on 2 accounts. Please verify one of them first.',
          }
        }

        return {
          status: 400,
          message: 'This domain is already being verified by another account',
        }
      }

      throw createError
    }

    await client.chatBot.create({
      data: {
        welcomeMessage: 'Hi there! How can I help you today?',
        icon: icon || '/favicon.ico',
        domainId: domain.id,
      },
    })

    return {
      status: 200,
      message: 'Domain added successfully. Please verify ownership to activate it.',
      domain,
    }
  } catch (error) {
    console.error('❌ Error creating domain:', error)
    return {
      status: 500,
      message: 'Failed to create domain. Please try again.',
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

      await client.domain.deleteMany({
        where: {
          name: domain.name,
          verificationStatus: 'PENDING',
          id: { not: domainId },
        },
      })

      console.log(`🧹 Cleaned up other PENDING domains for: ${domain.name}`)

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