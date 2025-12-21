import { PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

const prisma = new PrismaClient()
const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
})

async function importStripePayments() {
  try {
    console.log('Starting import of Stripe payments...')

    const users = await prisma.user.findMany({
      where: {
        stripeCustomerId: {
          not: null,
        },
      },
      select: {
        id: true,
        clerkId: true,
        fullname: true,
        stripeCustomerId: true,
      },
    })

    console.log(`Found ${users.length} users with Stripe customers`)

    for (const user of users) {
      if (!user.stripeCustomerId) continue

      console.log(`\nProcessing user: ${user.fullname} (${user.stripeCustomerId})`)

      try {
        const paymentIntents = await stripe.paymentIntents.list({
          customer: user.stripeCustomerId,
          limit: 100,
        })

        console.log(`Found ${paymentIntents.data.length} payments`)

        for (const payment of paymentIntents.data) {
          const existing = await prisma.paymentHistory.findUnique({
            where: {
              stripePaymentIntentId: payment.id,
            },
          })

          if (existing) {
            console.log(`Skipping ${payment.id} (already exists)`)
            continue
          }

          let paymentMethod = null
          let paymentBrand = null
          if (payment.payment_method) {
            try {
              const pm = await stripe.paymentMethods.retrieve(
                payment.payment_method as string
              )
              paymentMethod = pm.card?.last4 || null
              paymentBrand = pm.card?.brand || null
            } catch (e) {
              console.log(`Could not retrieve payment method`)
            }
          }

          let plan = payment.metadata?.plan || null
          let description = payment.description || 'Subscription Payment'

          await prisma.paymentHistory.create({
            data: {
              userId: user.id,
              amount: payment.amount,
              currency: payment.currency,
              status: payment.status,
              plan: plan as any,
              description: description,
              stripePaymentIntentId: payment.id,
              paymentMethod: paymentMethod,
              paymentBrand: paymentBrand,
              createdAt: new Date(payment.created * 1000),
            },
          })

          console.log(`  ✅ Imported ${payment.id} - $${(payment.amount / 100).toFixed(2)}`)
        }
      } catch (error: any) {
        console.error(`Error processing user ${user.fullname}:`, error.message)
      }
    }

    console.log('\nImport complete!')
  } catch (error) {
    console.error('Error importing payments:', error)
  } finally {
    await prisma.$disconnect()
  }
}

importStripePayments()