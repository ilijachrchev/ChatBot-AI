export type PlanType = 'STANDARD' | 'PRO' | 'ULTIMATE'

export const PLAN_LIMITS: Record<
  PlanType,
  {
    credits: number
    domains: number
    clients: number
    chatbots: number
    campaigns: number
  }
> = {
  STANDARD: { credits: 10, domains: 1, clients: 10, chatbots: 1, campaigns: 3 },
  PRO: { credits: 50, domains: 2, clients: 50, chatbots: 2, campaigns: 10 },
  ULTIMATE: { credits: 500, domains: 100, clients: 500, chatbots: 100, campaigns: 100 },
}

export const PLAN_DISPLAY: Record<PlanType, { label: string; accentColor: string }> = {
  STANDARD: { label: 'Standard', accentColor: 'zinc' },
  PRO: { label: 'Pro', accentColor: 'blue' },
  ULTIMATE: { label: 'Ultimate', accentColor: 'amber' },
}
