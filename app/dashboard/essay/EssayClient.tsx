'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Essay {
  id: string
  title: string
  content: string
  feedback?: string
  word_count?: number
  updated_at: string
}

interface Profile {
  id: string
  full_name: string
}

interface Props {
  profile: Profile
  userId: string
  essays: Essay[]
}

export default function EssayClient({ profile, userId, essays: initialEssays }: Props) {
  const supabase = createClientComponentClient()
  const [essays, setEssays] = useState<Essay[]>(initialEssays)
  const [activeEssay, setActiveEssay] = useState<Essay | null>(null)
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'write' | 'feedback' | 'rewrite'>('write')
  const [rewrite, setRewrite] = useState('')
  const [rewriteLoading, setRewriteLoading] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  const createNewEssay = () => {
    setActiveEssay(null)
    setContent('')
    setTitle('Personal Statement Draft')
    setFeedback('')
    setRewrite('')
    setActiveTab('write')
  }

  const openEssay = (essay: Essay) => {
    setActiveEssay(essay)
    setContent(essay.content)
    setTitle(essay.title)
    setFeedback(essay.feedback || '')
    setRewrite('')
    setActiveTab('write')
  }

  const saveEssay = async () => {
    if (!content.trim()) return
    setSaving(true)
    const essayData = {
      user_id: userId,
      title: title || 'Untitled Essay',
      content,
      feedback,
      word_count: wordCount,
      updated_at: new Date().toISOString(),
    }

    if (activeEssay) {
      const { data } = await supabase
        .from('essays')
        .update(essayData)
        .eq('id', activeEssay.id)
        .select()
        .single()
      if (data) {
        setActiveEssay(data)
        setEssays(prev => prev.map(e => e.id === data.id ? data : e))
      }
    } else {
      const { data } = await supabase
        .from('essays')
        .insert(essayData)
        .select()
        .single()
      if (data) {
        setActiveEssay(data)
        setEssays(prev => [data, ...prev])
      }
    }
    setSaving(false)
  }

  const deleteEssay = async (id: string) => {
    await supabase.from('essays').delete().eq('id', id)
    setEssays(prev => prev.filter(e => e.id !== id))
    if (activeEssay?.id === id) {
      setActiveEssay(null)
      setContent('')
      setTitle('')
      setFeedback('')
    }
  }

  const getFeedback = async () => {
    if (!content.trim()) return
    setLoading(true)
    setFeedback('')
    setActiveTab('feedback')
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `You are an expert dental school admissions counselor who has helped hundreds of students get into top dental schools. Review this personal statement and provide detailed, actionable feedback.

Personal Statement:
"${content}"

Provide feedback in these exact sections:
**Overall Impression** (2-3 sentences on the essay's strengths and main areas to improve)

**Strengths**
- List 3-4 specific things done well with examples from the text

**Areas to Improve**
- List 3-4 specific weaknesses with concrete suggestions

**Structure & Flow**
- Comment on the opening hook, narrative flow, and conclusion

**Content Gaps**
- What's missing that dental schools want to see (passion for dentistry, shadowing experiences, specific moments, future goals)

**Word Count & Format**
- Current: ${wordCount} words. AADSAS limit is 4500 characters (~650 words). Comment on length.

**Score: X/10** - Give an honest overall score with one sentence explanation.

Be honest, specific, and encouraging. Reference actual lines from the essay in your feedback.`
          }]
        })
      })
      const data = await response.json()
      const text = data.content?.[0]?.text || 'Could not generate feedback.'
      setFeedback(text)
      if (activeEssay) {
        await supabase.from('essays').update({ feedback: text }).eq('id', activeEssay.id)
        setEssays(prev => prev.map(e => e.id === activeEssay.id ? { ...e, feedback: text } : e))
      }
    } catch {
      setFeedback('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const getRewrite = async (type: string) => {
    if (!content.trim()) return
    setRewriteLoading(true)
    setRewrite('')
    setActiveTab('rewrite')
    try {
      const prompts: Record<string, string> = {
        hook: `Rewrite ONLY the opening paragraph of this personal statement to be more compelling and hook the reader immediately. Make it vivid, specific, and start with a scene or moment rather than a generic statement. Keep the same voice.\n\nOriginal essay:\n"${content}"\n\nProvide only the rewritten opening paragraph.`,
        concise: `Rewrite this personal statement to be more concise and impactful. Remove filler words, passive voice, and redundant sentences. Target 600-650 words. Keep all key content and the same voice.\n\nOriginal:\n"${content}"\n\nProvide the full rewritten essay.`,
        compelling: `Rewrite this personal statement to be more emotionally compelling and memorable. Add more specific details, vivid moments, and a clearer narrative arc showing WHY this person chose dentistry. Keep the same facts but make it more engaging.\n\nOriginal:\n"${content}"\n\nProvide the full rewritten essay.`,
        custom: `You are editing a dental school personal statement. Here is the specific request: "${customPrompt}"\n\nPersonal statement:\n"${content}"\n\nProvide the rewritten version.`,
      }
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompts[type] || prompts.compelling }]
        })
      })
      const data = await response.json()
      setRewrite(data.content?.[0]?.text || 'Could not generate rewrite.')
    } catch {
      setRewrite('Something went wrong. Please try again.')
    }
    setRewriteLoading(false)
  }

  const inputStyle = {
    backgroundColor: '#111B2E',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: '#EEF2FF',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05080F', color: '#EEF2FF', fontFamily: 'system-ui, sans-serif', display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <div style={{ padding: '2rem 2rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#00C9A7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.4rem' }}>Phase 2 — Pre-Dental Tools</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>Personal Statement Coach</h1>
        <p style={{ color: '#6B7A9A', fontSize: '0.9rem' }}>AI-powered feedback, rewrites, and coaching for your dental school essays</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', flex: 1, overflow: 'hidden' }}>

        {/* SIDEBAR */}
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.07)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
          <button
            onClick={createNewEssay}
            style={{ width: '100%', backgroundColor: '#00C9A7', border: 'none', color: '#000', fontWeight: 700, fontSize: '0.82rem', padding: '0.65rem', borderRadius: '12px', cursor: 'pointer', marginBottom: '0.5rem' }}
          >
            + New Essay
          </button>

          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4A5570', textTransform: 'uppercase', letterSpacing: '1px', padding: '0.25rem 0.5rem' }}>Saved Essays</div>

          {essays.length === 0 && (
            <div style={{ fontSize: '0.8rem', color: '#4A5570', padding: '0.5rem', textAlign: 'center' }}>No essays yet</div>
          )}

          {essays.map(essay => (
            <div
              key={essay.id}
              onClick={() => openEssay(essay)}
              style={{ padding: '0.75rem', borderRadius: '12px', border: `1px solid ${activeEssay?.id === essay.id ? 'rgba(0,201,167,0.3)' : 'rgba(255,255,255,0.05)'}`, backgroundColor: activeEssay?.id === essay.id ? 'rgba(0,201,167,0.08)' : '#0D1525', cursor: 'pointer' }}
            >
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#EEF2FF', marginBottom: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{essay.title}</div>
              <div style={{ fontSize: '0.7rem', color: '#6B7A9A' }}>{essay.word_count || 0} words</div>
              <button
                onClick={e => { e.stopPropagation(); deleteEssay(essay.id) }}
                style={{ background: 'none', border: 'none', color: '#4A5570', fontSize: '0.68rem', cursor: 'pointer', marginTop: '0.25rem', padding: 0 }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* MAIN EDITOR */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* TOOLBAR */}
          <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {(['write', 'feedback', 'rewrite'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ backgroundColor: activeTab === tab ? '#00C9A7' : 'transparent', color: activeTab === tab ? '#000' : '#6B7A9A', border: `1px solid ${activeTab === tab ? '#00C9A7' : 'rgba(255,255,255,0.07)'}`, borderRadius: '50px', padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}
                >
                  {tab === 'write' ? '✏️ Write' : tab === 'feedback' ? '🔍 Feedback' : '✨ Rewrite'}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: wordCount > 650 ? '#FF6B8A' : '#6B7A9A' }}>
                {wordCount} / 650 words
              </span>
              <button
                onClick={saveEssay}
                disabled={saving || !content.trim()}
                style={{ backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', color: '#EEF2FF', fontWeight: 600, fontSize: '0.8rem', padding: '0.4rem 1rem', borderRadius: '50px', cursor: 'pointer', opacity: saving || !content.trim() ? 0.5 : 1 }}
              >
                {saving ? 'Saving...' : '💾 Save'}
              </button>
              <button
                onClick={getFeedback}
                disabled={loading || !content.trim()}
                style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', fontWeight: 700, fontSize: '0.8rem', padding: '0.4rem 1rem', borderRadius: '50px', cursor: 'pointer', opacity: loading || !content.trim() ? 0.6 : 1 }}
              >
                {loading ? 'Analyzing...' : '🤖 Get AI Feedback'}
              </button>
            </div>
          </div>

          {/* WRITE TAB */}
          {activeTab === 'write' && (
            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Essay title..."
                style={{ ...inputStyle, fontSize: '1rem', fontWeight: 600 }}
              />
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Start writing your personal statement here...

Tips:
• Open with a specific moment or scene that drew you to dentistry
• Show don't tell — use vivid details from your shadowing or experiences
• Connect your past experiences to your future goals
• End with why THIS specific path, and what kind of dentist you want to be
• AADSAS limit is 4,500 characters (~650 words)"
                style={{ ...inputStyle, minHeight: '500px', lineHeight: 1.8, resize: 'vertical' }}
              />

              {/* QUICK TIPS */}
              <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00C9A7', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>💡 What Dental Schools Want to See</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                  {[
                    'A specific moment that sparked your interest in dentistry',
                    'What you learned from shadowing experiences',
                    'How your background makes you unique',
                    'Your understanding of dentistry as a profession',
                    'Community service and leadership',
                    'Clear career goals and why dentistry specifically',
                  ].map(tip => (
                    <div key={tip} style={{ fontSize: '0.78rem', color: '#6B7A9A', display: 'flex', gap: '0.4rem' }}>
                      <span style={{ color: '#00C9A7', flexShrink: 0 }}>✓</span> {tip}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FEEDBACK TAB */}
          {activeTab === 'feedback' && (
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🤖</div>
                  <div style={{ color: '#6B7A9A' }}>Gemini is reading your essay...</div>
                  <div style={{ color: '#4A5570', fontSize: '0.8rem', marginTop: '0.5rem' }}>This takes about 10 seconds</div>
                </div>
              ) : feedback ? (
                <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '2rem' }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00C9A7', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🤖 AI Feedback from Gemini</div>
                  <div style={{ fontSize: '0.9rem', color: '#6B7A9A', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{feedback}</div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No feedback yet</div>
                  <div style={{ color: '#6B7A9A', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Write your essay and click "Get AI Feedback" to get detailed feedback</div>
                  <button onClick={getFeedback} disabled={!content.trim()} style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', fontWeight: 700, padding: '0.75rem 1.5rem', borderRadius: '50px', cursor: 'pointer', opacity: !content.trim() ? 0.5 : 1 }}>
                    Get AI Feedback
                  </button>
                </div>
              )}
            </div>
          )}

          {/* REWRITE TAB */}
          {activeTab === 'rewrite' && (
            <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ fontSize: '0.82rem', color: '#6B7A9A' }}>Choose what you want Gemini to rewrite or improve:</div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {[
                  { id: 'hook', label: '🎣 Rewrite Opening Hook', desc: 'Make the first paragraph more compelling' },
                  { id: 'concise', label: '✂️ Make More Concise', desc: 'Cut fluff, stay under 650 words' },
                  { id: 'compelling', label: '🔥 Make More Compelling', desc: 'Add more emotion and specificity' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => getRewrite(opt.id)}
                    disabled={rewriteLoading || !content.trim()}
                    style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '0.85rem 1.1rem', cursor: 'pointer', textAlign: 'left', opacity: rewriteLoading || !content.trim() ? 0.5 : 1 }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#EEF2FF', marginBottom: '0.2rem' }}>{opt.label}</div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7A9A' }}>{opt.desc}</div>
                  </button>
                ))}
              </div>

              {/* CUSTOM PROMPT */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <input
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder='Custom request e.g. "Make my opening more specific about my shadowing experience"'
                  style={{ flex: 1, backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.85rem', color: '#EEF2FF', outline: 'none' }}
                />
                <button
                  onClick={() => getRewrite('custom')}
                  disabled={rewriteLoading || !content.trim() || !customPrompt.trim()}
                  style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', fontWeight: 700, fontSize: '0.85rem', padding: '0.75rem 1.25rem', borderRadius: '12px', cursor: 'pointer', flexShrink: 0, opacity: rewriteLoading || !content.trim() || !customPrompt.trim() ? 0.5 : 1 }}
                >
                  →
                </button>
              </div>

              {rewriteLoading && (
                <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#0D1525', borderRadius: '16px' }}>
                  <div style={{ color: '#6B7A9A' }}>Gemini is rewriting your essay...</div>
                </div>
              )}

              {rewrite && !rewriteLoading && (
                <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(0,201,167,0.15)', borderRadius: '20px', padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#00C9A7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✨ AI Rewrite</div>
                    <button
                      onClick={() => { setContent(rewrite); setActiveTab('write') }}
                      style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', fontWeight: 700, fontSize: '0.78rem', padding: '0.4rem 0.9rem', borderRadius: '50px', cursor: 'pointer' }}
                    >
                      Use This Version
                    </button>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#6B7A9A', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{rewrite}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
