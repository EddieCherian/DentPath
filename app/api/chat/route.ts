import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ content: [{ text: 'ERROR: No API key' }] })
  }

  const contents = messages.map((m: { role: string; content: string }) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.7,
        },
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    return NextResponse.json({ content: [{ text: `ERROR ${response.status}: ${JSON.stringify(data)}` }] })
  }

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  if (!text) {
    return NextResponse.json({ content: [{ text: `ERROR: Empty response. Full data: ${JSON.stringify(data)}` }] })
  }

  return NextResponse.json({ content: [{ text }] })
}
