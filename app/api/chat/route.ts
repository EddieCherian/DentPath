import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ 
        content: [{ text: 'ERROR: No API key configured' }] 
      }, { status: 500 })
    }

    const lastMessage = messages[messages.length - 1]
    
    // 🚀 FASTEST MODEL: Use Flash-Lite for speed
    const model = 'gemini-2.5-flash-lite' // Fastest option
    
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: lastMessage.content }]
        }],
        generationConfig: {
          // ⚡ Speed optimizations:
          maxOutputTokens: 512,  // Reduced from 2048
          temperature: 0.7,
          topK: 20,  // Lower = faster, more focused
          topP: 0.8, // Slightly lower = faster
        },
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return NextResponse.json({ 
        content: [{ text: `ERROR: ${data.error?.message || 'Unknown error'}` }]
      })
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    return NextResponse.json({ 
      content: [{ text: text || 'No response' }]
    })

  } catch (error) {
    return NextResponse.json({ 
      content: [{ text: `ERROR: ${error instanceof Error ? error.message : String(error)}` }]
    }, { status: 500 })
  }
}