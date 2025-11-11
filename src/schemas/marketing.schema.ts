import { z } from 'zod'

export const EmailMarketingSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'The campaign name must be at least 3 characters' }),
})

export const EmailMarketingBodySchema = z.object({
  description: z
    .string()
    .min(30, { message: 'The body must have at least 30 characters' }),
})

export type EmailMarketingProps = z.infer<typeof EmailMarketingSchema>
export type EmailMarketingBodyProps = z.infer<typeof EmailMarketingBodySchema>