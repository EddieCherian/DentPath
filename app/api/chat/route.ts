import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      )
    }

    // Convert messages to Gemini format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }))

    // List of models to try in order
    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-2.5-flash-preview-05-20',
      'gemini-pro',
      'gemini-1.0-pro'
    ]

    let lastError = null
    
    // Try each model until one works
    for (const model of modelsToTry) {
      try {
        console.log(`Trying model: ${model}`)
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              maxOutputTokens: 2048,
              temperature: 0.7,
            },
          }),
        })

        const data = await response.json()

        if (response.ok) {
          console.log(`✅ Model ${model} worked!`)
          
          // Extract the text from Gemini's response
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text

          if (!text) {
            console.error('No text in response:', data)
            continue // Try next model
          }

          return NextResponse.json({ 
            role: 'assistant',
            content: text 
          })
        } else {
          console.log(`❌ Model ${model} failed:`, data.error?.message || 'Unknown error')
          lastError = data
        }
      } catch (error) {
        console.log(`❌ Model ${model} threw error:`, error)
        lastError = error
      }
    }

    // If we get here, all models failed
    console.error('All models failed:', lastError)
    return NextResponse.json(
      { error: 'All Gemini models failed', details: lastError },
      { status: 500 }
    )

  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}