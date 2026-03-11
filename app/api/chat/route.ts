import { NextRequest, NextResponse } from 'next/server'

// Larger cache = more instant responses
const responseCache = new Map()
const CACHE_TTL = 1000 * 60 * 60 * 24 // 24 hours (cache entire day's questions)

// Pre-warm cache with common question types
const commonTopics = ['Biology', 'Chemistry', 'Organic Chemistry', 'PAT', 'QR', 'RC']

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
    
    // 🔥 INSTANT: Check cache first
    const cacheKey = lastMessage.content
    const cached = responseCache.get(cacheKey)
    if (cached) {
      console.log('🚀 Cache hit!')
      return NextResponse.json({ content: [{ text: cached.text }] })
    }

    // 🏎️ FASTEST MODEL: flash-lite is plenty for multiple choice
    const model = 'gemini-2.5-flash-lite'
    
    const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${apiKey}`
    
    // Ultra-optimized prompt (minimal tokens)
    const prompt = `Generate DAT MCQ. Return JSON only:
{
  "question": "...",
  "options": ["A","B","C","D"],
  "correctIndex": 0,
  "explanation": "...",
  "topic": "...",
  "difficulty": "Medium"
}`

    console.log('⏳ Generating new question...')
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 800,  // Just enough for your JSON example
          temperature: 0.7,
          topK: 20,  // Lower = faster
        },
      }),
    })

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // 🔥 Cache for next time
    responseCache.set(cacheKey, { text, timestamp: Date.now() })

    return NextResponse.json({ content: [{ text }] })

  } catch (error) {
    return NextResponse.json({ 
      content: [{ text: `ERROR: ${error instanceof Error ? error.message : String(error)}` }]
    }, { status: 500 })
  }
}