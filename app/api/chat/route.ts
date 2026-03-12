// app/api/chat/route.ts
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
    
    // Use the correct model name
    const model = 'gemini-2.5-flash'
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ 
            text: lastMessage.content + '\n\nIMPORTANT: Return ONLY valid JSON. No explanations, no markdown, no backticks.' 
          }]
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

    if (!text) {
      return NextResponse.json({ 
        content: [{ text: 'ERROR: Empty response from Gemini' }]
      })
    }

    // Log what we're sending back
    console.log('Sending to client:', text.substring(0, 200))
    
    return NextResponse.json({ 
      content: [{ text }]
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ 
      content: [{ text: `ERROR: ${error instanceof Error ? error.message : String(error)}` }]
    })
  }
}
