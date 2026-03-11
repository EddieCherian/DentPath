import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Convert messages to Gemini format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    // Use v1 API (not v1beta) with correct Gemini 3 model names
    const modelsToTry = [
      'gemini-3.1-pro-preview',
      'gemini-3-flash-preview',
      'gemini-3.1-flash-lite-preview'
    ]

    for (const model of modelsToTry) {
      try {
        console.log(`Trying model: ${model} with v1 API`)
        
        // IMPORTANT: Using v1 API, not v1beta
        const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              maxOutputTokens: 2048,
              temperature: 1.0, // Gemini 3 works best with temperature 1.0 [citation:3]
            },
          }),
        })

        const data = await response.json()

        if (response.ok) {
          console.log(`✅ Model ${model} worked!`)
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text
          
          if (text) {
            return NextResponse.json({ role: 'assistant', content: text })
          }
        } else {
          console.log(`❌ Model ${model} failed:`, data.error?.message)
        }
      } catch (error) {
        console.log(`❌ Model ${model} error:`, error)
      }
    }

    return NextResponse.json({ error: 'All models failed' }, { status: 500 })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}