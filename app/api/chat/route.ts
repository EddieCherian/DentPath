import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ 
        content: [{ text: 'ERROR: No API key configured' }] 
      })
    }

    const lastMessage = messages[messages.length - 1]
    
    // ✅ CORRECT model name from your list
    const model = 'gemini-2.5-flash'  // Removed -preview-05-20
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: lastMessage.content }]
        }],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      console.error('Gemini API error:', data)
      return NextResponse.json({ 
        content: [{ text: `ERROR: ${data.error?.message || 'Unknown error'}` }]
      })
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

    return NextResponse.json({ 
      content: [{ text: text || 'No response' }]
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      content: [{ text: `ERROR: ${error instanceof Error ? error.message : String(error)}` }]
    })
  }
}
