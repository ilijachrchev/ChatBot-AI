import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { currentUser } from '@clerk/nextjs/server'
import { createKnowledgeBaseFile } from '@/actions/knowledge-base'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
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

    // Validate file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (
      !ALLOWED_TYPES.includes(file.type) &&
      !ALLOWED_EXTENSIONS.includes(fileExtension)
    ) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF, DOCX, and TXT files are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop()?.toLowerCase() || 'txt'
    const filename = `${randomUUID()}.${ext}`

    const uploadDir = join(process.cwd(), 'public', 'uploads', 'knowledge-base')
    await mkdir(uploadDir, { recursive: true })

    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    const url = `/uploads/knowledge-base/${filename}`

    // Save file record to database
    const result = await createKnowledgeBaseFile(
      file.name,
      file.type || `application/${ext}`,
      url,
      file.size,
      domainId || undefined
    )

    if (result.status !== 200) {
      // Clean up file if database save failed
      try {
        await import('fs/promises').then((fs) => fs.unlink(filepath))
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError)
      }

      return NextResponse.json(
        { error: result.message || 'Failed to save file record' },
        { status: result.status }
      )
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

