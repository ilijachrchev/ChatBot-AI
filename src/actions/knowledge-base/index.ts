'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs/server'

export const getKnowledgeBaseFiles = async () => {
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
        status: 'READY',
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

    // Verify the file belongs to the user
    const file = await client.knowledgeBaseFile.findFirst({
      where: {
        id: fileId,
        userId: dbUser.id,
      },
    })

    if (!file) {
      return { status: 404, message: 'File not found' }
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

    // Verify the file belongs to the user
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

