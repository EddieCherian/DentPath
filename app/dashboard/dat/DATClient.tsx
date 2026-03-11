'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { bioQuestions } from '@/lib/questions/biology'
import { gchemQuestions } from '@/lib/questions/gchem'
import { ochemQuestions } from '@/lib/questions/ochem'
import { patQuestions } from '@/lib/questions/pat'
import { mathQuestions } from '@/lib/questions/math'

interface Profile {
  id: string
  full_name: string
  dat_target_score: number
}

interface Props {
  profile: Profile
  userId: string
}

const subjects = [
  { id: 'biology', label: 'Biology', icon: '🔬', color: '#00C9A7' },
  { id: 'gchem', label: 'General Chemistry', icon: '⚗️', color: '#F0C060' },
  { id: 'ochem', label: 'Organic Chemistry', icon: '🧪', color: '#4A9EFF' },
  { id: 'pat', label: 'PAT', icon: '📐', color: '#FF6B8A' },
  { id: 'math', label: 'Quantitative Reasoning', icon: '🔢', color: '#00C9A7' },
]

const questionMap: Record<string, any[]> = {
  biology: bioQuestions,
  gchem: gchemQuestions,
  ochem: ochemQuestions,
  pat: patQuestions,
  math: mathQuestions,
}

export default function DATClient({ profile, userId }: Props) {
  const supabase = createClientComponentClient()
  const [activeSubject, setActiveSubject] = useState('biology')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [mode, setMode] = useState<'practice' | 'flashcard' | 'exam'>('practice')
  const [flipped, setFlipped] = useState(false)
  const [examStarted, setExamStarted] = useState(false)
  const [examTime, setExamTime] = useState(270 * 60)
  const [subjectScores, setSubjectScores] = useState<Record<string, { correct: number; total: number }>>({})

  const questions = questionMap[activeSubject] || []
  const currentQuestion = questions[currentIndex]

  useEffect(() => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setAnswered(false)
    setScore({ correct: 0, total: 0 })
    setFlipped(false)
  }, [activeSubject])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (examStarted && examTime > 0) {
      timer = setInterval(() => setExamTime((t) => t - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [examStarted, examTime])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleAnswer = (index: number) => {
    if (answered) return
    setSelectedAnswer(index)
    setAnswered(true)
    const isCorrect = index === currentQuestion.correctIndex
    const newScore = { correct: score.correct + (isCorrect ? 1 : 0), total: score.total + 1 }
    setScore(newScore)
    setSubjectScores((prev) => ({
      ...prev,
      [activeSubject]: {
        correct: (prev[activeSubject]?.correct || 0) + (isCorrect ? 1 : 0),
        total: (prev[activeSubject]?.total || 0) + 1,
      },
    }))
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedAnswer(null)
      setAnswered(false)
      setFlipped(false)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1)
      setSelectedAnswer(null)
      setAnswered(false)
      setFlipped(false)
    }
  }

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
  const estimatedScore = Math.round(17 + (accuracy / 100) * 13)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05080F', color: '#EEF2FF', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#00C9A7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Phase 2 — DAT Prep</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>DAT Prep Suite</h1>
        <p style={{ color: '#6B7A9A', fontSize: '0.9rem' }}>Practice questions, flashcards, and timed mock exams</p>
      </div>

      {/* MODE TABS */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {(['practice', 'flashcard', 'exam'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{ backgroundColor: mode === m ? '#00C9A7' : '#0D1525', color: mode === m ? '#000' : '#6B7A9A', border: `1px solid ${mode === m ? '#00C9A7' : 'rgba(255,255,255,0.07)'}`, borderRadius: '50px', padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}
          >
            {m === 'practice' ? '📝 Practice' : m === 'flashcard' ? '⚡ Flashcards' : '⏱️ Mock Exam'}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* SIDEBAR */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7A9A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Subjects</div>
          {subjects.map((s) => {
            const ss = subjectScores[s.id]
            const pct = ss && ss.total > 0 ? Math.round((ss.correct / ss.total) * 100) : null
            return (
              <button
                key={s.id}
                onClick={() => setActiveSubject(s.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '14px', border: `1px solid ${activeSubject === s.id ? s.color : 'rgba(255,255,255,0.07)'}`, backgroundColor: activeSubject === s.id ? `${s.color}12` : '#0D1525', cursor: 'pointer', textAlign: 'left', width: '100%', transition: 'all 0.2s' }}
              >
                <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: activeSubject === s.id ? s.color : '#EEF2FF' }}>{s.label}</div>
                  <div style={{ fontSize: '0.7rem', color: '#6B7A9A', marginTop: '0.1rem' }}>
                    {pct !== null ? `${pct}% accuracy` : `${questionMap[s.id]?.length || 0} questions`}
                  </div>
                </div>
              </button>
            )
          })}

          {/* SCORE CARD */}
          <div style={{ marginTop: '1rem', backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.1rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#6B7A9A', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Session Stats</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ textAlign: 'center', backgroundColor: '#111B2E', borderRadius: '10px', padding: '0.6rem' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00C9A7' }}>{score.correct}</div>
                <div style={{ fontSize: '0.65rem', color: '#6B7A9A' }}>Correct</div>
              </div>
              <div style={{ textAlign: 'center', backgroundColor: '#111B2E', borderRadius: '10px', padding: '0.6rem' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#EEF2FF' }}>{score.total}</div>
                <div style={{ fontSize: '0.65rem', color: '#6B7A9A' }}>Attempted</div>
              </div>
              <div style={{ textAlign: 'center', backgroundColor: '#111B2E', borderRadius: '10px', padding: '0.6rem' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F0C060' }}>{accuracy}%</div>
                <div style={{ fontSize: '0.65rem', color: '#6B7A9A' }}>Accuracy</div>
              </div>
              <div style={{ textAlign: 'center', backgroundColor: '#111B2E', borderRadius: '10px', padding: '0.6rem' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4A9EFF' }}>{estimatedScore}</div>
                <div style={{ fontSize: '0.65rem', color: '#6B7A9A' }}>Est. Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div>

          {/* PRACTICE MODE */}
          {mode === 'practice' && currentQuestion && (
            <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7A9A', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {subjects.find(s => s.id === activeSubject)?.label} · Q{currentIndex + 1} of {questions.length}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <span style={{ backgroundColor: 'rgba(0,201,167,0.1)', color: '#00C9A7', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '50px' }}>{currentQuestion.difficulty}</span>
                  <span style={{ backgroundColor: 'rgba(74,158,255,0.1)', color: '#4A9EFF', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '50px' }}>{currentQuestion.topic}</span>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div style={{ height: '4px', backgroundColor: '#111B2E', borderRadius: '2px', marginBottom: '1.5rem' }}>
                <div style={{ height: '100%', backgroundColor: '#00C9A7', borderRadius: '2px', width: `${((currentIndex + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
              </div>

              <p style={{ fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.75rem', color: '#EEF2FF' }}>{currentQuestion.question}</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
                {currentQuestion.options.map((option: string, i: number) => {
                  const isSelected = selectedAnswer === i
                  const isCorrect = i === currentQuestion.correctIndex
                  let bg = '#111B2E'
                  let border = 'rgba(255,255,255,0.07)'
                  let color = '#EEF2FF'
                  if (answered) {
                    if (isCorrect) { bg = 'rgba(0,201,167,0.1)'; border = '#00C9A7'; color = '#00C9A7' }
                    else if (isSelected && !isCorrect) { bg = 'rgba(255,107,138,0.1)'; border = '#FF6B8A'; color = '#FF6B8A' }
                  } else if (isSelected) {
                    bg = 'rgba(0,201,167,0.08)'; border = '#00C9A7'; color = '#00C9A7'
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => handleAnswer(i)}
                      disabled={answered}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '12px', border: `1px solid ${border}`, backgroundColor: bg, cursor: answered ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0D1525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: color, flexShrink: 0, border: `1px solid ${border}` }}>
                        {String.fromCharCode(65 + i)}
                      </div>
                      <span style={{ fontSize: '0.9rem', color: color, lineHeight: 1.5 }}>{option}</span>
                      {answered && isCorrect && <span style={{ marginLeft: 'auto', color: '#00C9A7', flexShrink: 0 }}>✓</span>}
                      {answered && isSelected && !isCorrect && <span style={{ marginLeft: 'auto', color: '#FF6B8A', flexShrink: 0 }}>✗</span>}
                    </button>
                  )
                })}
              </div>

              {answered && (
                <div style={{ backgroundColor: 'rgba(0,201,167,0.06)', border: '1px solid rgba(0,201,167,0.15)', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00C9A7', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Explanation</div>
                  <p style={{ fontSize: '0.875rem', color: '#6B7A9A', lineHeight: 1.65 }}>{currentQuestion.explanation}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={handlePrev} disabled={currentIndex === 0} style={{ backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7A9A', padding: '0.65rem 1.25rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, cursor: currentIndex === 0 ? 'not-allowed' : 'pointer', opacity: currentIndex === 0 ? 0.4 : 1 }}>← Prev</button>
                {!answered && (
                  <button onClick={() => handleAnswer(-1)} style={{ backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7A9A', padding: '0.65rem 1.25rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Skip</button>
                )}
                <button onClick={handleNext} disabled={currentIndex === questions.length - 1} style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', padding: '0.65rem 1.5rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, cursor: currentIndex === questions.length - 1 ? 'not-allowed' : 'pointer', marginLeft: 'auto', opacity: currentIndex === questions.length - 1 ? 0.4 : 1 }}>Next →</button>
              </div>
            </div>
          )}

          {/* FLASHCARD MODE */}
          {mode === 'flashcard' && currentQuestion && (
            <div>
              <div style={{ perspective: '1000px', marginBottom: '1.5rem' }}>
                <div
                  onClick={() => setFlipped(!flipped)}
                  style={{ backgroundColor: '#0D1525', border: `1px solid ${flipped ? 'rgba(0,201,167,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '24px', padding: '3rem 2rem', minHeight: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', position: 'relative' }}
                >
                  <div style={{ position: 'absolute', top: '1rem', left: '1.25rem', fontSize: '0.72rem', fontWeight: 700, color: '#6B7A9A', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {flipped ? '✅ Answer' : '❓ Question'} · {subjects.find(s => s.id === activeSubject)?.label}
                  </div>
                  <div style={{ position: 'absolute', top: '1rem', right: '1.25rem', fontSize: '0.72rem', color: '#6B7A9A' }}>
                    {currentIndex + 1} / {questions.length}
                  </div>
                  {!flipped ? (
                    <p style={{ fontSize: '1.05rem', lineHeight: 1.7, color: '#EEF2FF', maxWidth: '500px' }}>{currentQuestion.question}</p>
                  ) : (
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#00C9A7', marginBottom: '0.75rem' }}>{currentQuestion.options[currentQuestion.correctIndex]}</div>
                      <p style={{ fontSize: '0.875rem', color: '#6B7A9A', lineHeight: 1.6, maxWidth: '500px' }}>{currentQuestion.explanation}</p>
                    </div>
                  )}
                  <div style={{ position: 'absolute', bottom: '1rem', fontSize: '0.75rem', color: '#4A5570' }}>
                    {flipped ? 'Click to see question' : 'Click to reveal answer'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                <button onClick={handlePrev} disabled={currentIndex === 0} style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7A9A', padding: '0.65rem 1.5rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', opacity: currentIndex === 0 ? 0.4 : 1 }}>← Prev</button>
                <button onClick={() => setFlipped(!flipped)} style={{ backgroundColor: '#111B2E', border: '1px solid rgba(0,201,167,0.2)', color: '#00C9A7', padding: '0.65rem 1.5rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>Flip Card</button>
                <button onClick={handleNext} disabled={currentIndex === questions.length - 1} style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', padding: '0.65rem 1.5rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', opacity: currentIndex === questions.length - 1 ? 0.4 : 1 }}>Next →</button>
              </div>
            </div>
          )}

          {/* EXAM MODE */}
          {mode === 'exam' && (
            <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2rem' }}>
              {!examStarted ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏱️</div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Full DAT Mock Exam</h2>
                  <p style={{ color: '#6B7A9A', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '400px', margin: '0 auto 2rem' }}>
                    Simulates the real DAT experience. 90 questions across all subjects. 4.5 hours total time. Get a full score report when done.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
                    {[['90', 'Questions'], ['4.5hrs', 'Time Limit'], ['6', 'Subjects']].map(([val, label]) => (
                      <div key={label} style={{ backgroundColor: '#111B2E', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#00C9A7' }}>{val}</div>
                        <div style={{ fontSize: '0.7rem', color: '#6B7A9A' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { setExamStarted(true); setExamTime(270 * 60) }}
                    style={{ backgroundColor: '#00C9A7', color: '#000', fontWeight: 700, fontSize: '1rem', padding: '0.9rem 2.5rem', borderRadius: '50px', border: 'none', cursor: 'pointer' }}
                  >
                    Start Mock Exam
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0.75rem 1rem', backgroundColor: '#111B2E', borderRadius: '12px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Mock Exam in Progress</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: examTime < 600 ? '#FF6B8A' : '#00C9A7', fontFamily: 'monospace' }}>{formatTime(examTime)}</div>
                    <button onClick={() => setExamStarted(false)} style={{ backgroundColor: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.2)', color: '#FF6B8A', fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 0.9rem', borderRadius: '50px', cursor: 'pointer' }}>End Exam</button>
                  </div>
                  {currentQuestion && (
                    <div>
                      <p style={{ fontSize: '1rem', lineHeight: 1.75, marginBottom: '1.5rem' }}>{currentQuestion.question}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {currentQuestion.options.map((option: string, i: number) => (
                          <button
                            key={i}
                            onClick={() => handleAnswer(i)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', borderRadius: '12px', border: `1px solid ${selectedAnswer === i ? '#00C9A7' : 'rgba(255,255,255,0.07)'}`, backgroundColor: selectedAnswer === i ? 'rgba(0,201,167,0.08)' : '#111B2E', cursor: 'pointer', textAlign: 'left', width: '100%' }}
                          >
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#0D1525', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                              {String.fromCharCode(65 + i)}
                            </div>
                            <span style={{ fontSize: '0.9rem' }}>{option}</span>
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
                        <button onClick={handleNext} style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', padding: '0.65rem 1.5rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>Next →</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
