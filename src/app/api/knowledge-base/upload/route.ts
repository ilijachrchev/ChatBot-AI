import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { createKnowledgeBaseFile } from '@/actions/knowledge-base'
import { client } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt']

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const domainId = formData.get('domainId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const isValidType = ALLOWED_TYPES.includes(file.type)
    const isValidExtension = ALLOWED_EXTENSIONS.includes(fileExtension)

    if (!isValidType || !isValidExtension) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOCX, and TXT files are allowed.' },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    if (domainId) {
      const ownedDomain = await client.domain.findFirst({
        where: {
          id: domainId,
          User: { clerkId: user.id },
        },
        select: { id: true },
      })
      if (!ownedDomain) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }
    }

    const pubKey = process.env.NEXT_PUBLIC_UPLOAD_CARE_PUBLIC_KEY
    if (!pubKey) {
      return NextResponse.json(
        { error: 'Upload service not configured' },
        { status: 500 }
      )
    }

    const upload = new FormData()
    upload.append('UPLOADCARE_PUB_KEY', pubKey)
    upload.append('UPLOADCARE_STORE', '1')
    upload.append('file', file, file.name)

    const ucRes = await fetch('https://upload.uploadcare.com/base/', {
      method: 'POST',
      body: upload,
    })

    if (!ucRes.ok) {
      const text = await ucRes.text()
      console.error('Uploadcare error:', text)
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      )
    }

    const ucData = await ucRes.json() as { file: string }
    const url = `https://ucarecdn.com/${ucData.file}/`

    const result = await createKnowledgeBaseFile(
      file.name,
      file.type || `application/${fileExtension.slice(1)}`,
      url,
      file.size,
      domainId || undefined
    )

    if (result.status !== 200) {
      return NextResponse.json(
        { error: result.message || 'Failed to save file record' },
        { status: result.status }
      )
    }

    if (result.file?.id) {
      const { ingestKnowledgeBaseFile } = await import('@/lib/knowledge-base/ingest')
      ingestKnowledgeBaseFile(result.file.id).catch((error) => {
        console.error('Background ingestion error:', error)
      })
    }

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
      fileId: result.file?.id,
    })
  } catch (error) {
    console.error('Knowledge base upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
