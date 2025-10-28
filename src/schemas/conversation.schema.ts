import z, { ZodType } from "zod";


export const ConversationSearchSchema = z.object({
    query: z.string().min(1, { message: 'You must enter a search query' }),
    domain: z.string().min(1, { message: 'You must select a domain' }),
})

export type ConversationSearchForm = z.infer<typeof ConversationSearchSchema>;
