'use client'

import { useState, useEffect, useCallback } from 'react'

interface Profile {
  id: string
  full_name: string
  dat_target_score: number
}

interface Props {
  profile: Profile
  userId: string
}

interface Question {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  topic: string
  difficulty: string
}

const subjects = [
  { id: 'Biology', icon: '🔬', color: '#00C9A7', desc: 'Cells, genetics, evolution, ecology' },
  { id: 'General Chemistry', icon: '⚗️', color: '#F0C060', desc: 'Atoms, bonding, reactions, equilibrium' },
  { id: 'Organic Chemistry', icon: '🧪', color: '#4A9EFF', desc: 'Mechanisms, reactions, stereochemistry' },
  { id: 'PAT', icon: '📐', color: '#FF6B8A', desc: 'Spatial reasoning, angle ranking, hole punching' },
  { id: 'Quantitative Reasoning', icon: '🔢', color: '#A78BFA', desc: 'Algebra, probability, statistics' },
  { id: 'Reading Comprehension', icon: '📖', color: '#F0C060', desc: 'Scientific passages, tone, inference' },
]

const difficultyLevels = ['Easy', 'Medium', 'Hard']

// ONLY THIS FUNCTION WAS FIXED - EVERYTHING ELSE IS EXACTLY AS BEFORE
function extractJSON(text: string, isArray: boolean): any {
  try {
    // Try direct parse first
    return JSON.parse(text.trim())
  } catch {}

  // Strip markdown code fences
  const stripped = text.replace(/```json|```/g, '').trim()
  try {
    return JSON.parse(stripped)
  } catch {}

  // Extract with regex
  const pattern = isArray ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/
  const match = stripped.match(pattern)
  if (match) {
    try {
      return JSON.parse(match[0])
    } catch {}
  }

  // Last attempt: clean up common JSON issues
  try {
    // Replace single quotes with double quotes
    const fixed = stripped.replace(/'/g, '"')
    return JSON.parse(fixed)
  } catch {}

  throw new Error(`Could not parse JSON from response: ${text.slice(0, 300)}`)
}

export default function DATClient({ profile, userId }: Props) {
  const [activeSubject, setActiveSubject] = useState('Biology')
  const [difficulty, setDifficulty] = useState('Medium')
  const [mode, setMode] = useState<'practice' | 'flashcard' | 'tutor' | 'exam'>('practice')
  const [question, setQuestion] = useState<Question | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [flipped, setFlipped] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: `Hi! I'm your DAT tutor powered by Gemini. I'm here to help you master ${activeSubject}. Ask me anything — concepts, practice questions, mnemonics, or just explain something you're confused about!` }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [weakTopics, setWeakTopics] = useState<string[]>([])
  const [topicPerformance, setTopicPerformance] = useState<Record<string, { correct: number; total: number }>>({})
  const [examQuestions, setExamQuestions] = useState<Question[]>([])
  const [examIndex, setExamIndex] = useState(0)
  const [examAnswers, setExamAnswers] = useState<number[]>([])
  const [examDone, setExamDone] = useState(false)
  const [examTime, setExamTime] = useState(270 * 60)
  const [examStarted, setExamStarted] = useState(false)
  const [examLoading, setExamLoading] = useState(false)
  const [prefetchedQuestion, setPrefetchedQuestion] = useState<Question | null>(null)
  const [isPrefetching, setIsPrefetching] = useState(false)

  const generateQuestion = useCallback(async (subj?: string, diff?: string) => {
    setLoading(true)
    setSelectedAnswer(null)
    setAnswered(false)
    
    if (prefetchedQuestion) {
      console.log('🚀 Using prefetched question!')
      setQuestion(prefetchedQuestion)
      setPrefetchedQuestion(null)
      setLoading(false)
      return
    }

    setQuestion(null)

    const subject = subj || activeSubject
    const diffLevel = diff || difficulty
    const weakTopicHint = weakTopics.length > 0
      ? `Focus on these weak topics if possible: ${weakTopics.slice(0, 3).join(', ')}.`
      : ''

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Generate a ${diffLevel} difficulty DAT (Dental Admission Test) multiple choice question for the subject: ${subject}.
${weakTopicHint}
Return ONLY valid JSON in this exact format, nothing else:
{
  "question": "the question text",
  "options": ["option A", "option B", "option C", "option D"],
  "correctIndex": 0,
  "explanation": "detailed explanation of why the answer is correct and why others are wrong",
  "topic": "specific topic within ${subject}",
  "difficulty": "${diffLevel}"
}
Make it realistic and representative of actual DAT questions. Do not include any text outside the JSON.`
          }]
        })
      })

      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const parsed = extractJSON(text, false)
      setQuestion(parsed)
    } catch (err: any) {
      setQuestion({
        question: `Error: ${err.message}`,
        options: ['Try again', 'Check API key', 'Refresh page', 'Contact support'],
        correctIndex: 0,
        explanation: `Full error: ${JSON.stringify(err)}`,
        topic: 'Error',
        difficulty: diffLevel,
      })
    }
    setLoading(false)
  }, [activeSubject, difficulty, weakTopics, prefetchedQuestion])

  useEffect(() => {
    if (mode === 'practice' && question && !loading && !isPrefetching && !prefetchedQuestion) {
      const prefetchNext = async () => {
        setIsPrefetching(true)
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [{
                role: 'user',
                content: `Generate a ${difficulty} difficulty DAT question for ${activeSubject}. Return ONLY valid JSON.`
              }]
            })
          })
          const data = await response.json()
          const text = data.content?.[0]?.text || ''
          const parsed = extractJSON(text, false)
          setPrefetchedQuestion(parsed)
          console.log('🎯 Next question pre-fetched!')
        } catch (e) {
          console.log('Pre-fetch failed')
        }
        setIsPrefetching(false)
      }
      
      const timer = setTimeout(prefetchNext, 2000)
      return () => clearTimeout(timer)
    }
  }, [mode, question, loading, activeSubject, difficulty, isPrefetching, prefetchedQuestion])

  useEffect(() => {
    if (mode === 'practice' || mode === 'flashcard') {
      generateQuestion()
    }
  }, [activeSubject, mode])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (examStarted && !examDone && examTime > 0) {
      timer = setInterval(() => setExamTime(t => t - 1), 1000)
    }
    if (examTime === 0) setExamDone(true)
    return () => clearInterval(timer)
  }, [examStarted, examDone, examTime])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const handleAnswer = (index: number) => {
    if (answered) return
    setSelectedAnswer(index)
    setAnswered(true)
    const isCorrect = index === question?.correctIndex
    setScore(prev => ({ correct: prev.correct + (isCorrect ? 1 : 0), total: prev.total + 1 }))
    if (question?.topic) {
      setTopicPerformance(prev => ({
        ...prev,
        [question.topic]: {
          correct: (prev[question.topic]?.correct || 0) + (isCorrect ? 1 : 0),
          total: (prev[question.topic]?.total || 0) + 1,
        }
      }))
      if (!isCorrect && !weakTopics.includes(question.topic)) {
        setWeakTopics(prev => [...prev.slice(-4), question.topic])
      }
    }
  }

  const sendChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `You are an expert DAT tutor helping a pre-dental student. The student is studying ${activeSubject} for the DAT exam. Answer their question in a clear, helpful, and encouraging way. Use examples and mnemonics where helpful. Keep responses concise but thorough.

Student question: ${userMsg}`
          }]
        })
      })
      const data = await response.json()
      const text = data.content?.[0]?.text || 'Sorry, I could not generate a response.'
      setChatMessages(prev => [...prev, { role: 'ai', text }])
    } catch (err: any) {
      setChatMessages(prev => [...prev, { role: 'ai', text: `Sorry, something went wrong: ${err.message}` }])
    }
    setChatLoading(false)
  }

  const startExam = async () => {
    setExamLoading(true)
    setExamQuestions([])
    setExamIndex(0)
    setExamAnswers([])
    setExamDone(false)
    setExamTime(270 * 60)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Generate 10 DAT practice exam questions covering: Biology (3), General Chemistry (2), Organic Chemistry (2), Quantitative Reasoning (2), Reading Comprehension (1). Mix of Easy, Medium, and Hard difficulties.

Return ONLY a valid JSON array, nothing else:
[
  {
    "question": "question text",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "explanation",
    "topic": "topic name",
    "difficulty": "Medium"
  }
]
Do not include any text outside the JSON array.`
          }]
        })
      })
      const data = await response.json()
      const text = data.content?.[0]?.text || ''
      const parsed = extractJSON(text, true)
      setExamQuestions(parsed)
      setExamStarted(true)
    } catch (err: any) {
      alert(`Failed to generate exam: ${err.message}`)
    }
    setExamLoading(false)
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
  const estimatedScore = Math.round(17 + (accuracy / 100) * 13)
  const currentSubject = subjects.find(s => s.id === activeSubject)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05080F', color: '#EEF2FF', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#00C9A7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Phase 2 — DAT Prep</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>DAT Prep Suite</h1>
        <p style={{ color: '#6B7A9A', fontSize: '0.9rem' }}>AI-powered questions, explanations, and tutoring — never the same question twice</p>
      </div>

      {/* MODE TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {([
          { id: 'practice', label: '📝 Practice' },
          { id: 'flashcard', label: '⚡ Flashcards' },
          { id: 'tutor', label: '🤖 AI Tutor' },
          { id: 'exam', label: '⏱️ Mock Exam' },
        ] as const).map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{ backgroundColor: mode === m.id ? '#00C9A7' : '#0D1525', color: mode === m.id ? '#000' : '#6B7A9A', border: `1px solid ${mode === m.id ? '#00C9A7' : 'rgba(255,255,255,0.07)'}`, borderRadius: '50px', padding: '0.55rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mode === 'tutor' || mode === 'exam' ? '1fr' : '220px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* SIDEBAR — practice + flashcard only */}
        {(mode === 'practice' || mode === 'flashcard') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7A9A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Subject</div>
            {subjects.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSubject(s.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem', borderRadius: '14px', border: `1px solid ${activeSubject === s.id ? s.color : 'rgba(255,255,255,0.07)'}`, backgroundColor: activeSubject === s.id ? `${s.color}15` : '#0D1525', cursor: 'pointer', textAlign: 'left', width: '100%' }}
              >
                <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: activeSubject === s.id ? s.color : '#EEF2FF' }}>{s.id}</div>
                  <div style={{ fontSize: '0.68rem', color: '#6B7A9A', marginTop: '0.1rem' }}>{s.desc}</div>
                </div>
              </button>
            ))}

            {/* DIFFICULTY */}
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7A9A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Difficulty</div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {difficultyLevels.map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '8px', border: `1px solid ${difficulty === d ? '#00C9A7' : 'rgba(255,255,255,0.07)'}`, backgroundColor: difficulty === d ? 'rgba(0,201,167,0.1)' : '#0D1525', color: difficulty === d ? '#00C9A7' : '#6B7A9A', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* STATS */}
            <div style={{ marginTop: '0.5rem', backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1rem' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7A9A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Session Stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {[
                  { label: 'Correct', value: score.correct, color: '#00C9A7' },
                  { label: 'Attempted', value: score.total, color: '#EEF2FF' },
                  { label: 'Accuracy', value: `${accuracy}%`, color: '#F0C060' },
                  { label: 'Est. Score', value: estimatedScore, color: '#4A9EFF' },
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: 'center', backgroundColor: '#111B2E', borderRadius: '10px', padding: '0.6rem' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 900, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: '0.65rem', color: '#6B7A9A' }}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* WEAK TOPICS */}
            {weakTopics.length > 0 && (
              <div style={{ backgroundColor: 'rgba(255,107,138,0.06)', border: '1px solid rgba(255,107,138,0.15)', borderRadius: '14px', padding: '1rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FF6B8A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>⚠️ Weak Topics</div>
                {weakTopics.slice(-3).map(t => (
                  <div key={t} style={{ fontSize: '0.78rem', color: '#6B7A9A', padding: '0.2rem 0' }}>• {t}</div>
                ))}
                <button
                  onClick={() => generateQuestion()}
                  style={{ marginTop: '0.5rem', width: '100%', backgroundColor: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.2)', color: '#FF6B8A', fontSize: '0.75rem', fontWeight: 600, padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  Drill Weak Topics
                </button>
              </div>
            )}
          </div>
        )}

        {/* MAIN */}
        <div>

          {/* PRACTICE MODE */}
          {mode === 'practice' && (
            <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2rem' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</div>
                  <div style={{ color: '#6B7A9A', fontSize: '0.9rem' }}>Gemini is generating your question...</div>
                  <div style={{ color: '#4A5570', fontSize: '0.8rem', marginTop: '0.5rem' }}>Tailored to {activeSubject} · {difficulty} difficulty</div>
                </div>
              ) : question ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ backgroundColor: `${currentSubject?.color}18`, color: currentSubject?.color, fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '50px' }}>{question.topic}</span>
                      <span style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#6B7A9A', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '50px' }}>{question.difficulty}</span>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#4A5570' }}>AI Generated</span>
                  </div>

                  <p style={{ fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.75rem', color: '#EEF2FF' }}>{question.question}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                    {question.options.map((option, i) => {
                      const isSelected = selectedAnswer === i
                      const isCorrect = i === question.correctIndex
                      let bg = '#111B2E'
                      let border = 'rgba(255,255,255,0.07)'
                      let color = '#EEF2FF'
                      if (answered) {
                        if (isCorrect) { bg = 'rgba(0,201,167,0.1)'; border = '#00C9A7'; color = '#00C9A7' }
                        else if (isSelected) { bg = 'rgba(255,107,138,0.1)'; border = '#FF6B8A'; color = '#FF6B8A' }
                      } else if (isSelected) {
                        bg = 'rgba(0,201,167,0.06)'; border = 'rgba(0,201,167,0.4)'; color = '#EEF2FF'
                      }
                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(i)}
                          disabled={answered}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.9rem 1rem', borderRadius: '12px', border: `1px solid ${border}`, backgroundColor: bg, cursor: answered ? 'default' : 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.15s' }}
                        >
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0D1525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color, flexShrink: 0, border: `1px solid ${border}` }}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span style={{ fontSize: '0.9rem', color, lineHeight: 1.5 }}>{option}</span>
                          {answered && isCorrect && <span style={{ marginLeft: 'auto', color: '#00C9A7', fontWeight: 700, flexShrink: 0 }}>✓</span>}
                          {answered && isSelected && !isCorrect && <span style={{ marginLeft: 'auto', color: '#FF6B8A', fontWeight: 700, flexShrink: 0 }}>✗</span>}
                        </button>
                      )
                    })}
                  </div>

                  {answered && (
                    <div style={{ backgroundColor: 'rgba(0,201,167,0.06)', border: '1px solid rgba(0,201,167,0.15)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00C9A7', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🤖 Gemini Explanation</div>
                      <p style={{ fontSize: '0.875rem', color: '#6B7A9A', lineHeight: 1.7 }}>{question.explanation}</p>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => generateQuestion()}
                      style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', padding: '0.7rem 1.5rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Next Question →
                    </button>
                    <button
                      onClick={() => { setMode('tutor'); setChatMessages([{ role: 'ai', text: `Let me help you understand this topic better! I noticed you were working on ${question.topic}. What would you like me to explain?` }]) }}
                      style={{ backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7A9A', padding: '0.7rem 1.25rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      🤖 Ask AI to explain
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* FLASHCARD MODE */}
          {mode === 'flashcard' && (
            <div>
              {loading ? (
                <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center' }}>
                  <div style={{ color: '#6B7A9A' }}>Generating flashcard...</div>
                </div>
              ) : question ? (
                <>
                  <div
                    onClick={() => setFlipped(!flipped)}
                    style={{ backgroundColor: '#0D1525', border: `2px solid ${flipped ? 'rgba(0,201,167,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '24px', padding: '3.5rem 2.5rem', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', marginBottom: '1.25rem', position: 'relative' }}
                  >
                    <div style={{ position: 'absolute', top: '1.25rem', left: '1.5rem', fontSize: '0.72rem', fontWeight: 700, color: '#6B7A9A', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {flipped ? '✅ Answer' : '❓ Question'} · {activeSubject}
                    </div>
                    {!flipped ? (
                      <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: '#EEF2FF', maxWidth: '520px' }}>{question.question}</p>
                    ) : (
                      <div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#00C9A7', marginBottom: '1rem' }}>{question.options[question.correctIndex]}</div>
                        <p style={{ fontSize: '0.875rem', color: '#6B7A9A', lineHeight: 1.65, maxWidth: '480px' }}>{question.explanation}</p>
                      </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '1.25rem', fontSize: '0.75rem', color: '#4A5570' }}>
                      {flipped ? 'Click to see question' : 'Click anywhere to reveal answer'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button onClick={() => setFlipped(!flipped)} style={{ backgroundColor: '#0D1525', border: '1px solid rgba(0,201,167,0.2)', color: '#00C9A7', padding: '0.65rem 1.5rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Flip</button>
                    <button onClick={() => generateQuestion()} style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', padding: '0.65rem 1.75rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Next Card →</button>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* AI TUTOR MODE */}
          {mode === 'tutor' && (
            <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setActiveSubject(s.id); setChatMessages([{ role: 'ai', text: `Switched to ${s.id}! I'm ready to help you master this subject. What do you want to learn or practice?` }]) }}
                    style={{ backgroundColor: activeSubject === s.id ? `${s.color}18` : 'transparent', border: `1px solid ${activeSubject === s.id ? s.color : 'rgba(255,255,255,0.07)'}`, color: activeSubject === s.id ? s.color : '#6B7A9A', borderRadius: '50px', padding: '0.3rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {s.icon} {s.id}
                  </button>
                ))}
              </div>

              <div style={{ height: '420px', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: msg.role === 'ai' ? 'rgba(0,201,167,0.15)' : '#111B2E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0 }}>
                      {msg.role === 'ai' ? '🤖' : '👤'}
                    </div>
                    <div style={{ maxWidth: '75%', backgroundColor: msg.role === 'user' ? 'rgba(0,201,167,0.1)' : '#111B2E', border: `1px solid ${msg.role === 'user' ? 'rgba(0,201,167,0.2)' : 'rgba(255,255,255,0.05)'}`, borderRadius: '16px', padding: '0.85rem 1rem', fontSize: '0.875rem', lineHeight: 1.65, color: '#EEF2FF', whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(0,201,167,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>🤖</div>
                    <div style={{ backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '0.85rem 1rem', fontSize: '0.875rem', color: '#6B7A9A' }}>Thinking...</div>
                  </div>
                )}
              </div>

              <div style={{ padding: '0 1.5rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {[
                  `Explain a key concept in ${activeSubject}`,
                  `Give me a mnemonic for ${activeSubject}`,
                  `What are the most tested topics?`,
                  `Generate a practice question`,
                ].map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => setChatInput(prompt)}
                    style={{ backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7A9A', fontSize: '0.72rem', fontWeight: 500, padding: '0.3rem 0.7rem', borderRadius: '50px', cursor: 'pointer' }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '0.75rem' }}>
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()}
                  placeholder={`Ask anything about ${activeSubject}...`}
                  style={{ flex: 1, backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#EEF2FF', outline: 'none' }}
                />
                <button
                  onClick={sendChat}
                  disabled={chatLoading || !chatInput.trim()}
                  style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}
                >
                  →
                </button>
              </div>
            </div>
          )}

          {/* EXAM MODE */}
          {mode === 'exam' && (
            <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2rem' }}>
              {!examStarted && !examLoading && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⏱️</div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: '0.75rem' }}>AI-Generated Mock Exam</h2>
                  <p style={{ color: '#6B7A9A', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto 2rem' }}>
                    Gemini generates a fresh 10-question exam every time. Covers all DAT subjects with mixed difficulties. Get a full score report at the end.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', maxWidth: '380px', margin: '0 auto 2rem' }}>
                    {[['10', 'Questions'], ['AI', 'Generated'], ['6', 'Subjects']].map(([val, label]) => (
                      <div key={label} style={{ backgroundColor: '#111B2E', borderRadius: '12px', padding: '0.85rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00C9A7' }}>{val}</div>
                        <div style={{ fontSize: '0.7rem', color: '#6B7A9A', marginTop: '0.1rem' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={startExam} style={{ backgroundColor: '#00C9A7', color: '#000', fontWeight: 700, fontSize: '1rem', padding: '0.9rem 2.5rem', borderRadius: '50px', border: 'none', cursor: 'pointer' }}>
                    Generate & Start Exam →
                  </button>
                </div>
              )}

              {examLoading && (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚙️</div>
                  <div style={{ color: '#6B7A9A' }}>Gemini is generating your exam...</div>
                </div>
              )}

              {examStarted && !examDone && examQuestions.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0.75rem 1rem', backgroundColor: '#111B2E', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Question {examIndex + 1} of {examQuestions.length}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: examTime < 300 ? '#FF6B8A' : '#00C9A7', fontFamily: 'monospace' }}>{formatTime(examTime)}</div>
                    <button onClick={() => setExamDone(true)} style={{ backgroundColor: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.2)', color: '#FF6B8A', fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 0.9rem', borderRadius: '50px', cursor: 'pointer' }}>Submit Exam</button>
                  </div>

                  <div style={{ height: '4px', backgroundColor: '#111B2E', borderRadius: '2px', marginBottom: '1.5rem' }}>
                    <div style={{ height: '100%', backgroundColor: '#00C9A7', borderRadius: '2px', width: `${((examIndex + 1) / examQuestions.length) * 100}%`, transition: 'width 0.3s' }} />
                  </div>

                  <p style={{ fontSize: '1rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>{examQuestions[examIndex].question}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                    {examQuestions[examIndex].options.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => { const newAnswers = [...examAnswers]; newAnswers[examIndex] = i; setExamAnswers(newAnswers) }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '12px', border: `1px solid ${examAnswers[examIndex] === i ? '#00C9A7' : 'rgba(255,255,255,0.07)'}`, backgroundColor: examAnswers[examIndex] === i ? 'rgba(0,201,167,0.08)' : '#111B2E', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                      >
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0D1525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span style={{ fontSize: '0.9rem' }}>{opt}</span>
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={() => setExamIndex(i => Math.max(0, i - 1))} disabled={examIndex === 0} style={{ backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7A9A', padding: '0.65rem 1.25rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', opacity: examIndex === 0 ? 0.4 : 1 }}>← Prev</button>
                    {examIndex < examQuestions.length - 1
                      ? <button onClick={() => setExamIndex(i => i + 1)} style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', padding: '0.65rem 1.5rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Next →</button>
                      : <button onClick={() => setExamDone(true)} style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', padding: '0.65rem 1.5rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Submit Exam ✓</button>
                    }
                  </div>
                </div>
              )}

              {examDone && examQuestions.length > 0 && (
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem', textAlign: 'center' }}>Exam Results 🎉</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {(() => {
                      const correct = examQuestions.filter((q, i) => examAnswers[i] === q.correctIndex).length
                      const pct = Math.round((correct / examQuestions.length) * 100)
                      const est = Math.round(17 + (pct / 100) * 13)
                      return [
                        { label: 'Correct', value: `${correct}/${examQuestions.length}`, color: '#00C9A7' },
                        { label: 'Score', value: `${pct}%`, color: '#F0C060' },
                        { label: 'Est. DAT', value: est, color: '#4A9EFF' },
                      ].map(s => (
                        <div key={s.label} style={{ backgroundColor: '#111B2E', borderRadius: '14px', padding: '1.1rem', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                          <div style={{ fontSize: '0.75rem', color: '#6B7A9A', marginTop: '0.25rem' }}>{s.label}</div>
                        </div>
                      ))
                    })()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    {examQuestions.map((q, i) => {
                      const userAns = examAnswers[i]
                      const correct = userAns === q.correctIndex
                      return (
                        <div key={i} style={{ backgroundColor: correct ? 'rgba(0,201,167,0.06)' : 'rgba(255,107,138,0.06)', border: `1px solid ${correct ? 'rgba(0,201,167,0.15)' : 'rgba(255,107,138,0.15)'}`, borderRadius: '12px', padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: correct ? '#00C9A7' : '#FF6B8A' }}>{correct ? '✓ Correct' : '✗ Incorrect'}</span>
                            <span style={{ fontSize: '0.72rem', color: '#6B7A9A' }}>{q.topic}</span>
                          </div>
                          <p style={{ fontSize: '0.85rem', color: '#EEF2FF', marginBottom: '0.4rem', lineHeight: 1.5 }}>{q.question}</p>
                          {!correct && (
                            <p style={{ fontSize: '0.8rem', color: '#6B7A9A' }}>
                              Correct: <span style={{ color: '#00C9A7' }}>{q.options[q.correctIndex]}</span>
                              {userAns !== undefined && <> · Your answer: <span style={{ color: '#FF6B8A' }}>{q.options[userAns]}</span></>}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <button onClick={() => { setExamStarted(false); setExamDone(false) }} style={{ width: '100%', backgroundColor: '#00C9A7', border: 'none', color: '#000', fontWeight: 700, padding: '0.85rem', borderRadius: '14px', fontSize: '0.95rem', cursor: 'pointer' }}>
                    Take Another Exam →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}