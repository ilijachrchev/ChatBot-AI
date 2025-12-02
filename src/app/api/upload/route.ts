import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs' 

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const mimeType = file.type || 'image/png'

    const dataUrl = `data:${mimeType};base64,${base64}`

    return NextResponse.json({ url: dataUrl }, { status: 200 })
  } catch (err) {
    console.error('Upload API error:', err)
    return NextResponse.json(
      { error: 'Internal upload error' },
      { status: 500 }
    )
  }
}
