'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'
import { mkdir, unlink, writeFile } from 'fs/promises'
import { join } from 'path'

export const getKnowledgeBaseFiles = async (domainId?: string) => {
  try {
    const user = await currentUser()
    if (!user) {
      return { status: 401, message: 'Unauthorized' }
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    })

    if (!dbUser) {
      return { status: 404, message: 'User not found' }
    }

    const files = await client.knowledgeBaseFile.findMany({
      where: {
        userId: dbUser.id,
        ...(domainId ? { domainId } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        Domain: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return { status: 200, files }
  } catch (error) {
    console.error('Error fetching knowledge base files:', error)
    return { status: 500, message: 'Failed to fetch files' }
  }
}

export const createKnowledgeBaseFile = async (
  filename: string,
  fileType: string,
  filePath: string,
  fileSize: number,
  domainId?: string
) => {
  try {
    const user = await currentUser()
    if (!user) {
      return { status: 401, message: 'Unauthorized' }
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    })

    if (!dbUser) {
      return { status: 404, message: 'User not found' }
    }

    const file = await client.knowledgeBaseFile.create({
      data: {
        filename,
        fileType,
        filePath,
        fileSize,
        userId: dbUser.id,
        domainId: domainId || null,
        status: 'PROCESSING', 
      },
    })

    return { status: 200, file }
  } catch (error) {
    console.error('Error creating knowledge base file:', error)
    return { status: 500, message: 'Failed to create file record' }
  }
}

export const deleteKnowledgeBaseFile = async (fileId: string) => {
  try {
    const user = await currentUser()
    if (!user) {
      return { status: 401, message: 'Unauthorized' }
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    })

    if (!dbUser) {
      return { status: 404, message: 'User not found' }
    }

    const file = await client.knowledgeBaseFile.findFirst({
      where: {
        id: fileId,
        userId: dbUser.id,
      },
    })

    if (!file) {
      return { status: 404, message: 'File not found' }
    }

    await client.$executeRawUnsafe(
      `DELETE FROM "KnowledgeBaseChunk" WHERE "fileId" = $1::uuid`,
      fileId
    )

    try {
      const fullPath = join(process.cwd(), 'public', file.filePath.replace(/^\//, ''))
      await unlink(fullPath)
    } catch (fileError) {
      console.error('Error deleting physical file:', fileError)
    }

    await client.knowledgeBaseFile.delete({
      where: { id: fileId },
    })

    return { status: 200, message: 'File deleted successfully' }
  } catch (error) {
    console.error('Error deleting knowledge base file:', error)
    return { status: 500, message: 'Failed to delete file' }
  }
}

export const toggleKnowledgeBaseFileStatus = async (
  fileId: string,
  status: 'READY' | 'DISABLED'
) => {
  try {
    const user = await currentUser()
    if (!user) {
      return { status: 401, message: 'Unauthorized' }
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    })

    if (!dbUser) {
      return { status: 404, message: 'User not found' }
    }

    const file = await client.knowledgeBaseFile.findFirst({
      where: {
        id: fileId,
        userId: dbUser.id,
      },
    })

    if (!file) {
      return { status: 404, message: 'File not found' }
    }

    const updatedFile = await client.knowledgeBaseFile.update({
      where: { id: fileId },
      data: { status },
    })

    return { status: 200, file: updatedFile }
  } catch (error) {
    console.error('Error toggling knowledge base file status:', error)
    return { status: 500, message: 'Failed to update file status' }
  }
}

export const scrapeWebsiteToKnowledgeBase = async (
  url: string,
  maxPages: number,
  domainId?: string
) => {
  try {
    const scrapeRes = await fetch('http://localhost:3001/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, maxPages }),
    })

    if (!scrapeRes.ok) {
      const err = await scrapeRes.text()
      console.error('Scraper error:', err)
      return { status: 500, message: 'Scraper service returned an error' }
    }

    const { pages } = (await scrapeRes.json()) as Array<{ url: string; content: string }> & {
      pages: Array<{ url: string; content: string }>
    }

    const combined = pages
      .map((p) => `=== PAGE: ${p.url} ===\n${p.content}\n\n`)
      .join('')

    const timestamp = Date.now()
    const filename = `${timestamp}-scraped.txt`
    const relativeDir = 'uploads/knowledge-base'
    const absoluteDir = join(process.cwd(), 'public', relativeDir)
    await mkdir(absoluteDir, { recursive: true })
    await writeFile(join(absoluteDir, filename), combined, 'utf8')

    const filePath = `/${relativeDir}/${filename}`
    const fileSize = Buffer.byteLength(combined, 'utf8')

    const result = await createKnowledgeBaseFile(
      filename,
      'text/plain',
      filePath,
      fileSize,
      domainId
    )

    if (result.status !== 200 || !result.file) {
      return { status: 500, message: 'Failed to create knowledge base record' }
    }

    const { ingestKnowledgeBaseFile } = await import('@/lib/knowledge-base/ingest')
    ingestKnowledgeBaseFile(result.file.id).catch((error) => {
      console.error('Background ingestion error:', error)
    })

    return { status: 200, message: 'Scraping started', filename }
  } catch (error) {
    console.error('Error scraping website:', error)
    return { status: 500, message: 'Failed to scrape website' }
  }
}

export const reprocessKnowledgeBaseFile = async (fileId: string) => {
  try {
    const user = await currentUser()
    if (!user) {
      return { status: 401, message: 'Unauthorized' }
    }

    const dbUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    })

    if (!dbUser) {
      return { status: 404, message: 'User not found' }
    }

    const file = await client.knowledgeBaseFile.findFirst({
      where: {
        id: fileId,
        userId: dbUser.id,
      },
    })

    if (!file) {
      return { status: 404, message: 'File not found' }
    }

    const { ingestKnowledgeBaseFile } = await import('@/lib/knowledge-base/ingest')
    ingestKnowledgeBaseFile(fileId).catch((error) => {
      console.error('Background reprocessing error:', error)
    })

    return { status: 200, message: 'Reprocessing started' }
  } catch (error) {
    console.error('Error reprocessing knowledge base file:', error)
    return { status: 500, message: 'Failed to start reprocessing' }
  }
}

