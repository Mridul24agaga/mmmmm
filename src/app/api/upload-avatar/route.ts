import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('avatar') as unknown as File

    if (!file) {
      console.error('No file uploaded')
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filename = `avatar-${Date.now()}${path.extname(file.name)}`
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const filepath = path.join(uploadsDir, filename)

    console.log('Creating directory:', uploadsDir)
    await mkdir(uploadsDir, { recursive: true })

    console.log('Writing file:', filepath)
    await writeFile(filepath, buffer)

    const avatarUrl = `/uploads/${filename}`
    console.log('File saved successfully:', avatarUrl)

    return NextResponse.json({ success: true, avatarUrl })
  } catch (error) {
    console.error('Error saving file:', error)
    return NextResponse.json({ success: false, error: 'Error saving file' }, { status: 500 })
  }
}

