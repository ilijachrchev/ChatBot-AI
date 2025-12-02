export async function uploadImageToNode(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch('/api/upload', {  
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      console.error('Upload failed:', response.status, text)
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}
