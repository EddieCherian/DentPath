import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ 
        content: [{ text: 'ERROR: No API key configured' }]  // Match expected format
      }, { status: 500 })
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1]
    
    const model = 'gemini-2.5-flash' // From your working models list
    
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: lastMessage.content }]
        }],
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 1.0,
        },
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ 
        content: [{ text: `ERROR: ${data.error?.message || 'Unknown error'}` }]
      }, { status: response.status })
    }

    // Extract the text from Gemini's response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!text) {
      return NextResponse.json({ 
        content: [{ text: 'ERROR: Empty response from Gemini' }]
      }, { status: 500 })
    }

    // ✅ CRITICAL: Return in the EXACT format your frontend expects
    return NextResponse.json({ 
      content: [{ text }]  // This matches what your frontend is looking for
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      content: [{ text: `ERROR: ${error instanceof Error ? error.message : String(error)}` }]
    }, { status: 500 })
  }
}