import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET) {
  throw new Error(
    'STRIPE_SECRET environment variable is not set.\n' +
    'Check your .env.local file and Vercel project settings.'
  )
}

export const stripe = new Stripe(process.env.STRIPE_SECRET, {
  typescript: true,
})
