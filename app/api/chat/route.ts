import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: 'No API key found', content: [{ text: 'ERROR: GEMINI_API_KEY is missing from environment' }] })
  }

  try {
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-04-17:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data, content: [{ text: `ERROR: Gemini returned ${response.status} — ${JSON.stringify(data)}` }] })
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
    return NextResponse.json({ content: [{ text }] })

  } catch (err: any) {
    return NextResponse.json({ error: err.message, content: [{ text: `ERROR: ${err.message}` }] })
  }
}
