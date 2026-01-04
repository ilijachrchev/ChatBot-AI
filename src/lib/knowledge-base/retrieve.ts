import 'server-only'
import { client } from '@/lib/prisma'
import OpenAi from 'openai'

const openai = new OpenAi({
  apiKey: process.env.OPEN_AI_KEY,
})

const MAX_CHUNKS = 6 
const MAX_CONTEXT_LENGTH = 4000 

async function createQueryEmbedding(query: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error creating query embedding:', error)
    throw new Error('Failed to create query embedding')
  }
}

export async function retrieveRelevantChunks(
  query: string,
  userId: string,
  domainId: string | null,
  maxChunks: number = MAX_CHUNKS
): Promise<
  Array<{
    content: string
    filename: string
    chunkIndex: number
    similarity: number
  }>
> {
  try {
    const queryEmbedding = await createQueryEmbedding(query)
    const embeddingStr = `[${queryEmbedding.join(',')}]`

    let sqlQuery = `
      SELECT 
        kbchunk.content,
        kbfile.filename,
        kbchunk."chunkIndex",
        1 - (kbchunk.embedding <=> '${embeddingStr}'::vector) as similarity
      FROM "KnowledgeBaseChunk" kbchunk
      INNER JOIN "KnowledgeBaseFile" kbfile ON kbchunk."fileId" = kbfile.id
      WHERE 
        kbchunk."userId" = '${userId}'::uuid
        AND kbfile.status = 'READY'
    `

    if (domainId) {
      sqlQuery += ` AND (kbchunk."domainId" = '${domainId}'::uuid OR kbchunk."domainId" IS NULL)`
    } else {
      sqlQuery += ` AND kbchunk."domainId" IS NULL`
    }

    sqlQuery += ` ORDER BY kbchunk.embedding <=> '${embeddingStr}'::vector LIMIT ${maxChunks}`

    const results = await client.$queryRawUnsafe(sqlQuery)

    return (results as any[]).map((row: any) => ({
      content: row.content,
      filename: row.filename,
      chunkIndex: row.chunkIndex,
      similarity: parseFloat(row.similarity) || 0,
    }))
  } catch (error) {
    console.error('Error retrieving chunks:', error)
    return []
  }
}

export function buildContextString(
  chunks: Array<{
    content: string
    filename: string
    chunkIndex: number
    similarity: number
  }>
): string {
  if (chunks.length === 0) {
    return ''
  }

  const relevantChunks = chunks.filter((chunk) => chunk.similarity > 0.7)

  if (relevantChunks.length === 0) {
    return ''
  }

  const contextParts = relevantChunks.map(
    (chunk) =>
      `[KB:${chunk.filename}#${chunk.chunkIndex}]\n${chunk.content}`
  )

  let context = contextParts.join('\n\n---\n\n')

  if (context.length > MAX_CONTEXT_LENGTH) {
    context = context.slice(0, MAX_CONTEXT_LENGTH)
    const lastBreak = Math.max(
      context.lastIndexOf('\n\n---\n\n'),
      context.lastIndexOf('\n')
    )
    if (lastBreak > MAX_CONTEXT_LENGTH * 0.8) {
      context = context.slice(0, lastBreak)
    }
  }

  return context
}

export async function getKnowledgeBaseContext(
  query: string,
  userId: string,
  domainId: string | null
): Promise<string> {
  const chunks = await retrieveRelevantChunks(query, userId, domainId)
  return buildContextString(chunks)
}

