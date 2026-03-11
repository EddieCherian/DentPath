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

    // Use the model from your list
    const model = 'gemini-2.5-flash'
    
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 1.0,
        },
      }),
    })

    const data = await response.json()
    console.log('Full API response:', JSON.stringify(data, null, 2))

    // FIXED: Properly extract the text from Gemini's response
    // The path is: data.candidates[0].content.parts[0].text
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      console.error('No text in response:', data)
      return NextResponse.json({ 
        error: 'No text in response', 
        fullResponse: data 
      }, { status: 500 })
    }

    // Return in the format your frontend expects
    return NextResponse.json({ 
      role: 'assistant', 
      content: text 
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}