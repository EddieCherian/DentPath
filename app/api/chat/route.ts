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
    
    const model = 'gemini-2.5-flash'
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: lastMessage.content }]
        }],
        generationConfig: {
          maxOutputTokens: 2048,  // INCREASED FROM 1024 TO 2048
          temperature: 0.7,
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
    })
  }
}