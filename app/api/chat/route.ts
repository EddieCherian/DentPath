import { NextRequest, NextResponse } from 'next/server'

// Simple cache (REALLY helps with speed)
const responseCache = new Map()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour

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
    
    // Check cache first (instant if cached)
    const cacheKey = lastMessage.content
    const cached = responseCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({ content: [{ text: cached.text }] })
    }
    
    // Use flash-lite but with optimizations for complete JSON
    const model = 'gemini-2.5-flash-lite'
    
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`
    
    // Shorter, more focused prompt = faster response
    const prompt = `Generate a DAT question. Return ONLY valid JSON:
{
  "question": "...",
  "options": ["A","B","C","D"],
  "correctIndex": 0,
  "explanation": "...",
  "topic": "...",
  "difficulty": "..."
}`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 1024,  // Balanced: enough for full JSON, not too slow
          temperature: 0.7,
          topK: 40,  // Slightly higher for better quality
          topP: 0.9,
        },
      }),
    })

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // If truncated, retry once with flash (slower but reliable)
    if (text.includes('"options": [') && !text.includes(']')) {
      console.log('⚠️ Truncated, retrying with flash...')
      
      // Retry with flash model
      const retryResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.7,
            },
          }),
        }
      )
      
      const retryData = await retryResponse.json()
      const retryText = retryData?.candidates?.[0]?.content?.parts?.[0]?.text || text
      
      // Cache and return
      responseCache.set(cacheKey, { text: retryText, timestamp: Date.now() })
      return NextResponse.json({ content: [{ text: retryText }] })
    }

    // Cache and return
    responseCache.set(cacheKey, { text, timestamp: Date.now() })
    return NextResponse.json({ content: [{ text }] })

  } catch (error) {
    return NextResponse.json({ 
      content: [{ text: `ERROR: ${error instanceof Error ? error.message : String(error)}` }]
    }, { status: 500 })
  }
}