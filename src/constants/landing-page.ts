import { PLAN_PRICES, PLAN_FEATURES } from '@/constants/pricing'

export const pricingCards = [
  {
    title: 'Standard',
    description: PLAN_FEATURES.STANDARD.description,
    price: PLAN_PRICES.STANDARD.amountDisplay,
    duration: '',
    highlight: 'Key features',
    features: PLAN_FEATURES.STANDARD.included,
    priceId: '',
  },
  {
    title: 'Pro',
    description: PLAN_FEATURES.PRO.description,
    price: PLAN_PRICES.PRO.amountDisplay,
    duration: 'month',
    highlight: 'Key features',
    features: PLAN_FEATURES.PRO.included,
    priceId: '',
  },
  {
    title: 'Ultimate',
    description: PLAN_FEATURES.ULTIMATE.description,
    price: PLAN_PRICES.ULTIMATE.amountDisplay,
    duration: 'month',
    highlight: 'Everything in Pro, plus',
    features: PLAN_FEATURES.ULTIMATE.included,
    priceId: '',
  },
]
