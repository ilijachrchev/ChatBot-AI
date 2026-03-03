export type PlanType = 'STANDARD' | 'PRO' | 'ULTIMATE'

export const PLAN_LIMITS: Record<
  PlanType,
  {
    credits: number
    domains: number
    clients: number
    chatbots: number
    campaigns: number
    conversationsPerMonth: number
    knowledgeBaseFiles: number
  }
> = {
  STANDARD: {
    credits: 10,
    domains: 1,
    clients: 10,
    chatbots: 1,
    campaigns: 1,
    conversationsPerMonth: 10,
    knowledgeBaseFiles: 3,
  },
  PRO: {
    credits: 50,
    domains: 2,
    clients: 50,
    chatbots: 2,
    campaigns: 5,
    conversationsPerMonth: 2000,
    knowledgeBaseFiles: 20,
  },
  ULTIMATE: {
    credits: 500,
    domains: 100,
    clients: 500,
    chatbots: 100,
    campaigns: -1,
    conversationsPerMonth: -1,
    knowledgeBaseFiles: -1,
  },
}

export const PLAN_DISPLAY: Record<PlanType, { label: string; accentColor: string }> = {
  STANDARD: { label: 'Standard', accentColor: 'zinc' },
  PRO: { label: 'Pro', accentColor: 'blue' },
  ULTIMATE: { label: 'Ultimate', accentColor: 'amber' },
}

export const PLAN_PRICES: Record<
  PlanType,
  {
    amountCents: number
    amountDisplay: string
    stripePriceId: string | null
  }
> = {
  STANDARD: {
    amountCents: 0,
    amountDisplay: '$0',
    stripePriceId: null,
  },
  PRO: {
    amountCents: 3500,
    amountDisplay: '$35',
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID ?? null,
  },
  ULTIMATE: {
    amountCents: 5500,
    amountDisplay: '$55',
    stripePriceId: process.env.STRIPE_ULTIMATE_PRICE_ID ?? null,
  },
}

export const PLAN_FEATURES: Record<
  PlanType,
  {
    included: string[]
    notIncluded: string[]
    description: string
  }
> = {
  STANDARD: {
    description: 'Get started for free',
    included: [
      '1 domain & chatbot',
      '10 conversations/month',
      'Embed code (15 languages)',
      'Basic AI responses',
      '1 email campaign/month',
      'Community support',
    ],
    notIncluded: [
      'Knowledge base',
      'Human handoff',
      'Website scraping',
      'Integrations',
    ],
  },
  PRO: {
    description: 'For growing businesses',
    included: [
      '2 domains & chatbots',
      '2,000 conversations/month',
      'Knowledge base (file uploads)',
      'Human handoff & real-time chat',
      '5 email campaigns/month',
      'Appointment booking',
      'Custom AI persona',
      'Working hours & availability',
      'Email support',
    ],
    notIncluded: [
      'Website scraping',
      'Integrations',
    ],
  },
  ULTIMATE: {
    description: 'For power users & agencies',
    included: [
      'Unlimited domains & chatbots',
      'Unlimited conversations',
      'Everything in Pro',
      'Website scraping',
      'Integrations (coming soon)',
      'Priority support',
    ],
    notIncluded: [],
  },
}

export const formatLimit = (value: number): string =>
  value === -1 ? '∞' : value.toLocaleString()

export const getPlanPriceId = (plan: PlanType): string | null =>
  PLAN_PRICES[plan].stripePriceId ?? null
