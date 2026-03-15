'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export const onGetDomainProductsAndConnectedAccountId = async (id: string) => {
  const user = await currentUser()
  if (!user) return null
  try {
    const connectedAccount = await client.domain.findUnique({
      where: {
        id,
      },
      select: {
        User: {
          select: {
            stripeId: true,
          },
        },
      },
    })

    const products = await client.product.findMany({
      where: {
        domainId: id,
      },
      select: {
        price: true,
        name: true,
        image: true,
      },
    })

    if (products) {
      const totalAmount = products.reduce((current: number, next: { price: number }) => {
        return current + next.price
      }, 0)
      return {
        products: products,
        amount: totalAmount,
        stripeId: connectedAccount?.User?.stripeId,
      }
    }
  } catch (error) {
    console.log(error)
  }
}

