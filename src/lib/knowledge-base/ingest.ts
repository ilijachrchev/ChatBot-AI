'use server'

import 'server-only'

import { readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { client } from '@/lib/prisma'
import OpenAi from 'openai'

const openai = new OpenAi({
  apiKey: process.env.OPEN_AI_KEY,
})

// Chunk configuration
const CHUNK_SIZE_TOKENS = 1000 // Target chunk size in tokens (~800-1200 range)
const CHUNK_OVERLAP_TOKENS = 150 // Overlap between chunks (~100-200 range)
const CHARS_PER_TOKEN = 4 // Rough estimate: 1 token ≈ 4 characters

// Convert tokens to characters for chunking
const CHUNK_SIZE_CHARS = CHUNK_SIZE_TOKENS * CHARS_PER_TOKEN
const CHUNK_OVERLAP_CHARS = CHUNK_OVERLAP_TOKENS * CHARS_PER_TOKEN

/**
 * Extract text from a file based on its type
 */
async function extractTextFromFile(
  filePath: string,
  fileType: string
): Promise<string> {
  const fullPath = join(process.cwd(), 'public', filePath.replace(/^\//, ''))

  if (fileType.includes('pdf') || filePath.endsWith('.pdf')) {
    const buffer = await readFile(fullPath)
    const pdfParseModule = await import('pdf-parse')
    // pdf-parse can be default or named export depending on module system
    const pdfParse = (pdfParseModule as any).default || pdfParseModule
    const data = await (pdfParse as any)(buffer)
    return data.text
  } else if (
    fileType.includes('word') ||
    fileType.includes('docx') ||
    filePath.endsWith('.docx')
  ) {
    const buffer = await readFile(fullPath)
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  } else if (
    fileType.includes('text') ||
    fileType.includes('txt') ||
    filePath.endsWith('.txt')
  ) {
    const buffer = await readFile(fullPath, 'utf-8')
    return buffer.toString()
  } else {
    throw new Error(`Unsupported file type: ${fileType}`)
  }
}

/**
 * Normalize and clean text
 */
function normalizeText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/\n{3,}/g, '\n\n') // Collapse multiple newlines
    .trim()
}

/**
 * Split text into chunks with overlap
 */
function chunkText(text: string): string[] {
  const normalized = normalizeText(text)
  const chunks: string[] = []
  let start = 0

  while (start < normalized.length) {
    const end = Math.min(start + CHUNK_SIZE_CHARS, normalized.length)
    let chunk = normalized.slice(start, end)

    // Try to break at sentence boundaries if not at the end
    if (end < normalized.length) {
      const lastPeriod = chunk.lastIndexOf('.')
      const lastNewline = chunk.lastIndexOf('\n')
      const breakPoint = Math.max(lastPeriod, lastNewline)

      if (breakPoint > CHUNK_SIZE_CHARS * 0.5) {
        // Only break if we're at least halfway through
        chunk = chunk.slice(0, breakPoint + 1)
        start += breakPoint + 1
      } else {
        start = end - CHUNK_OVERLAP_CHARS // Apply overlap
      }
    } else {
      start = end
    }

    if (chunk.trim().length > 0) {
      chunks.push(chunk.trim())
    }

    if (start >= normalized.length) break
  }

  return chunks
}

/**
 * Create embedding for a text chunk using OpenAI
 */
async function createEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // Using small model for cost efficiency, 1536 dimensions
      input: text,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error creating embedding:', error)
    throw new Error('Failed to create embedding')
  }
}

/**
 * Store chunks in database with embeddings
 */
async function storeChunks(
  fileId: string,
  userId: string,
  domainId: string | null,
  chunks: Array<{ content: string; embedding: number[]; chunkIndex: number }>
): Promise<void> {
  // Delete existing chunks for this file
  // Using raw SQL since Prisma client may not be regenerated yet
  await client.$executeRawUnsafe(
    `DELETE FROM "KnowledgeBaseChunk" WHERE "fileId" = $1::uuid`,
    fileId
  )

  // Insert new chunks using raw SQL for vector support
  for (const chunk of chunks) {
    const embeddingStr = `[${chunk.embedding.join(',')}]`
    const domainIdValue = domainId || null
    
    await client.$executeRawUnsafe(
      `INSERT INTO "KnowledgeBaseChunk" (
        id,
        content,
        embedding,
        "userId",
        "domainId",
        "fileId",
        "chunkIndex",
        "createdAt"
      ) VALUES (
        gen_random_uuid(),
        $1,
        $2::vector,
        $3::uuid,
        $4::uuid,
        $5::uuid,
        $6,
        NOW()
      )`,
      chunk.content,
      embeddingStr,
      userId,
      domainIdValue,
      fileId,
      chunk.chunkIndex
    )
  }
}

/**
 * Main ingestion function
 */
export async function ingestKnowledgeBaseFile(fileId: string): Promise<void> {
  try {
    // Get file record
    const file = await client.knowledgeBaseFile.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        filePath: true,
        fileType: true,
        status: true,
        userId: true,
        domainId: true,
      },
    })

    if (!file) {
      throw new Error(`File not found: ${fileId}`)
    }

    // Don't ingest if disabled
    if (file.status === 'DISABLED') {
      console.log(`Skipping ingestion for disabled file: ${fileId}`)
      return
    }

    // Update status to PROCESSING
    await client.$executeRawUnsafe(
      `UPDATE "KnowledgeBaseFile" SET status = 'PROCESSING', "errorMessage" = NULL WHERE id = $1::uuid`,
      fileId
    )

    // Extract text
    console.log(`Extracting text from file: ${file.filePath}`)
    const text = await extractTextFromFile(file.filePath, file.fileType)

    if (!text || text.trim().length === 0) {
      throw new Error('No text extracted from file')
    }

    // Chunk text
    console.log(`Chunking text (${text.length} characters)`)
    const chunks = chunkText(text)
    console.log(`Created ${chunks.length} chunks`)

    if (chunks.length === 0) {
      throw new Error('No chunks created from text')
    }

    // Create embeddings for all chunks
    console.log(`Creating embeddings for ${chunks.length} chunks...`)
    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (content, index) => {
        const embedding = await createEmbedding(content)
        return { content, embedding, chunkIndex: index }
      })
    )

    // Store chunks in database
    console.log(`Storing ${chunksWithEmbeddings.length} chunks in database...`)
    await storeChunks(fileId, file.userId, file.domainId, chunksWithEmbeddings)

    // Update status to READY
    await client.$executeRawUnsafe(
      `UPDATE "KnowledgeBaseFile" SET status = 'READY', "errorMessage" = NULL WHERE id = $1::uuid`,
      fileId
    )

    console.log(`Successfully ingested file: ${fileId}`)
  } catch (error: any) {
    console.error(`Error ingesting file ${fileId}:`, error)

    // Update status to FAILED
    const errorMsg = error.message || 'Unknown error during ingestion'
    await client.$executeRawUnsafe(
      `UPDATE "KnowledgeBaseFile" SET status = 'FAILED', "errorMessage" = $1 WHERE id = $2::uuid`,
      errorMsg,
      fileId
    )

    throw error
  }
}

