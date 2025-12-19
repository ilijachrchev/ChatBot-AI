export type PlanType = 'STANDARD' | 'PRO' | 'ULTIMATE'

export interface PlanFeatures {
  conversations: number | 'unlimited'
  domains: number
  emailCampaigns: number
  chatbotCustomization: boolean
  analytics: boolean
  prioritySupport: boolean
  apiAccess: boolean
  customBranding: boolean
  advancedAI: boolean
  integrations: number | 'unlimited'
}

export interface PlanDetails {
  name: string
  displayName: string
  price: number 
  priceDisplay: string
  monthlyCredits: number
  features: PlanFeatures
  description: string
  recommended?: boolean
  popular?: boolean
}

export const PRICING_CONFIG: Record<PlanType, PlanDetails> = {
  STANDARD: {
    name: 'STANDARD',
    displayName: 'Standard',
    price: 0,
    priceDisplay: '$0',
    monthlyCredits: 10,
    description: 'Perfect for getting started with AI-powered customer service',
    features: {
      conversations: 100,
      domains: 1,
      emailCampaigns: 10,
      chatbotCustomization: false,
      analytics: true,
      prioritySupport: false,
      apiAccess: false,
      customBranding: false,
      advancedAI: false,
      integrations: 2,
    },
  },
  PRO: {
    name: 'PRO',
    displayName: 'Pro',
    price: 3500, // $35.00
    priceDisplay: '$35',
    monthlyCredits: 50,
    description: 'For growing businesses that need more power and customization',
    recommended: true,
    popular: true,
    features: {
      conversations: 1000,
      domains: 3,
      emailCampaigns: 100,
      chatbotCustomization: true,
      analytics: true,
      prioritySupport: true,
      apiAccess: true,
      customBranding: true,
      advancedAI: false,
      integrations: 10,
    },
  },
  ULTIMATE: {
    name: 'ULTIMATE',
    displayName: 'Ultimate',
    price: 7500, // $75.00
    priceDisplay: '$75',
    monthlyCredits: 500,
    description: 'For enterprises requiring unlimited scale and premium features',
    features: {
      conversations: 'unlimited',
      domains: 10,
      emailCampaigns: 500,
      chatbotCustomization: true,
      analytics: true,
      prioritySupport: true,
      apiAccess: true,
      customBranding: true,
      advancedAI: true,
      integrations: 'unlimited',
    },
  },
}

export const getPlanDetails = (plan: PlanType): PlanDetails => {
  return PRICING_CONFIG[plan]
}

export const getPlanPrice = (plan: PlanType): number => {
  return PRICING_CONFIG[plan].price
}

export const getPlanPriceDisplay = (plan: PlanType): string => {
  return PRICING_CONFIG[plan].priceDisplay
}

export const getPlanCredits = (plan: PlanType): number => {
  return PRICING_CONFIG[plan].monthlyCredits
}

export const isPlanFeatureAvailable = (
  plan: PlanType,
  feature: keyof PlanFeatures
): boolean => {
  const planFeature = PRICING_CONFIG[plan].features[feature]
  if (typeof planFeature === 'boolean') {
    return planFeature
  }
  return planFeature === 'unlimited' || planFeature > 0
}

export const PLAN_ORDER: PlanType[] = ['STANDARD', 'PRO', 'ULTIMATE']

export const isPlanHigherTier = (planA: PlanType, planB: PlanType): boolean => {
  return PLAN_ORDER.indexOf(planA) > PLAN_ORDER.indexOf(planB)
}

export const getNextPlan = (currentPlan: PlanType): PlanType | null => {
  const currentIndex = PLAN_ORDER.indexOf(currentPlan)
  if (currentIndex === PLAN_ORDER.length - 1) return null
  return PLAN_ORDER[currentIndex + 1]
}

export const DISCOUNT_CONFIG = {
  active: false,
  percentage: 0, 
  code: '',
  validUntil: null as Date | null,
}

export const applyDiscount = (price: number): number => {
  if (!DISCOUNT_CONFIG.active) return price
  if (DISCOUNT_CONFIG.validUntil && new Date() > DISCOUNT_CONFIG.validUntil) {
    return price
  }
  return Math.round(price * (1 - DISCOUNT_CONFIG.percentage / 100))
}

export const getDiscountedPriceDisplay = (plan: PlanType): string => {
  const originalPrice = getPlanPrice(plan)
  const discountedPrice = applyDiscount(originalPrice)
  
  if (originalPrice === discountedPrice) {
    return getPlanPriceDisplay(plan)
  }
  
  return `$${(discountedPrice / 100).toFixed(2)}`
}