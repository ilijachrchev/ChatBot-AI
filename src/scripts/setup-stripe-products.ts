import Stripe from 'stripe'
import { PRICING_CONFIG } from '../lib/pricing-config'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const stripe = new Stripe(process.env.STRIPE_SECRET!, {
  typescript: true,
})

async function setupStripeProducts() {
  if (!process.env.STRIPE_SECRET) {
    console.error('STRIPE_SECRET not found in .env.local')
    process.exit(1)
  }

  console.log('Setting up Stripe products and prices...\n')

  const proProduct = await stripe.products.create({
    name: 'Pro Plan',
    description: PRICING_CONFIG.PRO.description,
    metadata: {
      plan: 'PRO',
    },
  })

  const proPrice = await stripe.prices.create({
    product: proProduct.id,
    unit_amount: PRICING_CONFIG.PRO.price,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    metadata: {
      plan: 'PRO',
    },
  })

  console.log('PRO Plan created')
  console.log(`Product ID: ${proProduct.id}`)
  console.log(`Price ID: ${proPrice.id}\n`)

  const ultimateProduct = await stripe.products.create({
    name: 'Ultimate Plan',
    description: PRICING_CONFIG.ULTIMATE.description,
    metadata: {
      plan: 'ULTIMATE',
    },
  })

  const ultimatePrice = await stripe.prices.create({
    product: ultimateProduct.id,
    unit_amount: PRICING_CONFIG.ULTIMATE.price,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    metadata: {
      plan: 'ULTIMATE',
    },
  })

  console.log('ULTIMATE Plan created')
  console.log(`Product ID: ${ultimateProduct.id}`)
  console.log(`Price ID: ${ultimatePrice.id}\n`)

  console.log('Add these to your .env.local:')
  console.log(`STRIPE_PRO_PRICE_ID=${proPrice.id}`)
  console.log(`STRIPE_ULTIMATE_PRICE_ID=${ultimatePrice.id}`)
}

setupStripeProducts()
  .then(() => console.log('\nSetup complete!'))
  .catch((error) => {
    console.error('Error:', error.message)
    process.exit(1)
  })