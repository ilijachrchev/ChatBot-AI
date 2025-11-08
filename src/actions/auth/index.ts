'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { onGetAllAccountDomains } from '../settings'
import { redirect } from 'next/navigation'

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