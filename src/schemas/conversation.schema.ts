import z, { ZodType } from "zod";
import { ACCEPTED_FILE_TYPES, MAX_UPLOAD_SIZE } from "./settings.schema";


export const ConversationSearchSchema = z.object({
    query: z.string().min(1, { message: 'You must enter a search query' }),
    domain: z.string().min(1, { message: 'You must select a domain' }),
})

export type ChatBotMessageProps = {
    content?: string;
    image?: any;
}

export type ConversationSearchForm = z.infer<typeof ConversationSearchSchema>;

export const ChatBotMessageSchema: ZodType<ChatBotMessageProps> = z
  .object({
    content: z.string().optional(),
    image: z.any().optional(),
  })
  .refine(
    (schema) => {
      const hasContent = schema.content && schema.content.trim().length > 0
      const hasImage = schema.image && schema.image.length > 0
      return hasContent || hasImage
    },
    {
      message: 'Please provide either a message or an image',
      path: ['content'],
    }
  )
