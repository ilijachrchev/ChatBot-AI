import { z } from 'zod'

export const MAX_UPLOAD_SIZE = 1024 * 1024 * 2 // 2MB
export const ACCEPTED_FILE_TYPES = ['image/png', 'image/jpg', 'image/jpeg']

export type HelpDeskQuestionsProps = {
  question: string
  answer: string
}

export type AddProductProps = {
  name: string
  image: any
  price: string
}

export type FilterQuestionsProps = {
  question: string
}

export const AddDomainSchema = z.object({
  domain: z
    .string()
    .min(4, { message: 'A domain must have atleast 3 characters' })
    .refine(
      (value) =>
        /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,3}$/.test(value ?? ''),
      'This is not a valid domain'
    ),
  image: z.any().optional(),
})
  .refine(
    (schema) => {
      if (schema.image && schema.image?.length > 0) {
        const file = schema.image[0]
        
        if (file.size > MAX_UPLOAD_SIZE) {
          return false
        }
        
        if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
          return false
        }
      }
      
      return true
    },
    {
      message: 'Image must be less than 2MB and be PNG, JPEG, or JPG',
      path: ['image'],
    }
  )

export type AddDomainProps = z.infer<typeof AddDomainSchema>

export const DomainSettingsSchema = z
  .object({
    domain: z
      .string()
      .min(4, { message: 'A domain must have atleast 3 characters' })
      .refine(
        (value) =>
          /^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\.)+[A-Za-z]{2,3}$/.test(value ?? ''),
        'This is not a valid domain'
      )
      .optional()
      .or(z.literal('').transform(() => undefined)),
    image: z.any().optional(),
    welcomeMessage: z
      .string()
      .min(6, 'The message must be atleast 6 characters')
      .optional()
      .or(z.literal('').transform(() => undefined)),
    chatbotColor: z.string().optional(),
    chatbotTitle: z.string().optional(),
    chatbotSubtitle: z.string().optional(),
    userBubbleColor: z.string().optional(),
    botBubbleColor: z.string().optional(),
    userTextColor: z.string().optional(),
    botTextColor: z.string().optional(),
    buttonStyle: z.enum(['ROUNDED', 'SQUARE', 'PILL']).optional(),
    bubbleStyle: z.enum(['ROUNDED', 'SQUARE', 'PILL']).optional(),
    showAvatars: z.boolean().optional(),
    widgetSize: z.string().optional(),
    widgetStyle: z.string().optional(),
  })
  .refine(
    (schema) => {
      if (schema.image?.length) {
        if (
          ACCEPTED_FILE_TYPES.includes(schema.image?.[0].type!) &&
          schema.image?.[0].size <= MAX_UPLOAD_SIZE
        ) {
          return true
        }
      }
      if (!schema.image?.length) {
        return true
      }
    },
    {
      message:
        'The file must be less than 2MB, and only PNG, JPEG & JPG files are accepted',
      path: ['image'],
    }
  )

export type DomainSettingsProps = z.infer<typeof DomainSettingsSchema>

export const HelpDeskQuestionsSchema = z.object({
  question: z.string().min(1, { message: 'Question cannot be left empty' }),
  answer: z.string().min(1, { message: 'Question cannot be left empty' }),
})

export const FilterQuestionsSchema = z.object({
  question: z.string().min(1, { message: 'Question cannot be left empty' }),
})

export const AddProductSchema = z.object({
  name: z
    .string()
    .min(3, { message: 'The name must have atleast 3 characters' }),
  image: z
    .any()
    .refine((files) => files?.[0]?.size <= MAX_UPLOAD_SIZE, {
      message: 'Your file size must be less then 2MB',
    })
    .refine((files) => ACCEPTED_FILE_TYPES.includes(files?.[0]?.type), {
      message: 'Only JPG, JPEG & PNG are accepted file formats',
    }),
  price: z.string(),
})

export const PersonaSchema = z.object({
  persona: z.enum([
    'SALES_AGENT',
    'APPOINTMENT_SETTER',
    'CUSTOMER_SUPPORT',
    'ECOMMERCE_RECOMMENDER',
    'REAL_ESTATE_QUALIFIER',
    'HEALTHCARE_INTAKE',
    'RESTAURANT_RESERVATION',
    'CUSTOM'
  ]),
  customPrompt: z.string().optional(),
}).refine((data) => {
  if (data.persona === 'CUSTOM') {
    return data.customPrompt && data.customPrompt.trim().length > 0
  }
  return true
}, {
  message: 'Custom prompt is required when Custom Persona is selected',
  path: ['customPrompt']
})