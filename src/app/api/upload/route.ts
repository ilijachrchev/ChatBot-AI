import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPEG, JPG, and WEBP are allowed.' },
        { status: 400 }
      )
    }

    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 2MB' },
        { status: 400 }
      )
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

    return NextResponse.json({
      success: true,
      url,
      filename: file.name,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
