'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Application {
  id: string
  school_name: string
  status: 'interested' | 'preparing' | 'applied' | 'interview' | 'accepted' | 'rejected' | 'waitlisted'
  deadline: string | null
  date_applied: string | null
  interview_date: string | null
  lor_count: number
  lor_notes: string | null
  secondary_received: boolean
  secondary_submitted: boolean
  secondary_due: string | null
  notes: string | null
}

interface Essay {
  id: string
  title: string
  content: string
  prompt: string | null
  school_id: string | null
  updated_at: string
}

interface Props {
  applications: Application[]
  essays: Essay[]
}

const statusColors = {
  interested: '#4A9EFF',
  preparing: '#F0C060',
  applied: '#A78BFA',
  interview: '#00C9A7',
  accepted: '#00C9A7',
  rejected: '#FF6B8A',
  waitlisted: '#F0C060',
}

const statusLabels = {
  interested: 'Interested',
  preparing: 'Preparing',
  applied: 'Applied',
  interview: 'Interview',
  accepted: 'Accepted',
  rejected: 'Rejected',
  waitlisted: 'Waitlisted',
}

export default function ApplyClient({ applications, essays }: Props) {
  const supabase = createClientComponentClient()
  const [apps, setApps] = useState<Application[]>(applications)
  const [showForm, setShowForm] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiPrompt, setAIPrompt] = useState('')
  const [aiResponse, setAIResponse] = useState('')
  const [aiLoading, setAILoading] = useState(false)
  const [selectedEssay, setSelectedEssay] = useState<Essay | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    school_name: '',
    status: 'interested' as Application['status'],
    deadline: '',
    date_applied: '',
    interview_date: '',
    lor_count: 0,
    lor_notes: '',
    secondary_received: false,
    secondary_submitted: false,
    secondary_due: '',
    notes: '',
  })

  const resetForm = () => {
    setFormData({
      school_name: '',
      status: 'interested',
      deadline: '',
      date_applied: '',
      interview_date: '',
      lor_count: 0,
      lor_notes: '',
      secondary_received: false,
      secondary_submitted: false,
      secondary_due: '',
      notes: '',
    })
    setEditingApp(null)
    setShowForm(false)
  }

  const handleSubmit = async () => {
    if (!formData.school_name.trim()) return

    const data = {
      ...formData,
      deadline: formData.deadline || null,
      date_applied: formData.date_applied || null,
      interview_date: formData.interview_date || null,
      secondary_due: formData.secondary_due || null,
    }

    if (editingApp) {
      const { error } = await supabase
        .from('school_applications')
        .update(data)
        .eq('id', editingApp.id)

      if (!error) {
        setApps(apps.map(a => a.id === editingApp.id ? { ...a, ...data } : a))
        resetForm()
      }
    } else {
      const { data: newApp, error } = await supabase
        .from('school_applications')
        .insert([data])
        .select()
        .single()

      if (!error && newApp) {
        setApps([newApp, ...apps])
        resetForm()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this application?')) return
    const { error } = await supabase
      .from('school_applications')
      .delete()
      .eq('id', id)

    if (!error) {
      setApps(apps.filter(a => a.id !== id))
    }
  }

  const askAI = async () => {
    if (!aiPrompt.trim()) return
    setAILoading(true)
    setAIResponse('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `You are an expert pre-dental advisor helping with dental school applications. 
Answer this question clearly and helpfully: ${aiPrompt}

If the user asks about a specific school or essay help, give tailored advice. Keep responses concise but thorough.`
          }]
        })
      })

      const data = await response.json()
      setAIResponse(data.content?.[0]?.text || 'No response')
    } catch (error) {
      setAIResponse('Sorry, something went wrong. Please try again.')
    }
    setAILoading(false)
  }

  const useEssayInAI = (essay: Essay) => {
    setSelectedEssay(essay)
    setAIPrompt(`Please review my personal statement (below) and give me feedback on content, structure, and how to make it stronger for dental school applications:

"${essay.content.substring(0, 500)}${essay.content.length > 500 ? '...' : ''}"`)
    setShowAIPanel(true)
  }

  const stats = {
    total: apps.length,
    applied: apps.filter(a => a.status === 'applied').length,
    interview: apps.filter(a => a.status === 'interview').length,
    accepted: apps.filter(a => a.status === 'accepted').length,
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05080F', color: '#EEF2FF', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#00C9A7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Phase 2 — Applications</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>Application Tracker</h1>
        <p style={{ color: '#6B7A9A', fontSize: '0.9rem' }}>Track schools, deadlines, LORs, and get AI-powered advice</p>
      </div>

      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total', value: stats.total, color: '#EEF2FF' },
          { label: 'Applied', value: stats.applied, color: '#A78BFA' },
          { label: 'Interviews', value: stats.interview, color: '#00C9A7' },
          { label: 'Accepted', value: stats.accepted, color: '#00C9A7' },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: '0.72rem', color: '#6B7A9A', fontWeight: 500, marginTop: '0.2rem' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* MAIN TOOLBAR */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', padding: '0.7rem 1.5rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          + {showForm ? 'Cancel' : 'Add School'}
        </button>
        <button
          onClick={() => setShowAIPanel(!showAIPanel)}
          style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', color: '#EEF2FF', padding: '0.7rem 1.5rem', borderRadius: '50px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}
        >
          🤖 AI Advisor {showAIPanel ? '−' : '+'}
        </button>
      </div>

      {/* ADD/EDIT FORM */}
      {showForm && (
        <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>{editingApp ? 'Edit' : 'Add'} School</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7A9A', marginBottom: '0.3rem' }}>School Name *</div>
              <input
                value={formData.school_name}
                onChange={e => setFormData({ ...formData, school_name: e.target.value })}
                placeholder="e.g. Harvard School of Dental Medicine"
                style={{ width: '100%', backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.6rem', fontSize: '0.85rem', color: '#EEF2FF' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7A9A', marginBottom: '0.3rem' }}>Status</div>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as Application['status'] })}
                style={{ width: '100%', backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.6rem', fontSize: '0.85rem', color: '#EEF2FF' }}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7A9A', marginBottom: '0.3rem' }}>Deadline</div>
              <input
                type="date"
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                style={{ width: '100%', backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.6rem', fontSize: '0.85rem', color: '#EEF2FF' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7A9A', marginBottom: '0.3rem' }}>Date Applied</div>
              <input
                type="date"
                value={formData.date_applied}
                onChange={e => setFormData({ ...formData, date_applied: e.target.value })}
                style={{ width: '100%', backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.6rem', fontSize: '0.85rem', color: '#EEF2FF' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7A9A', marginBottom: '0.3rem' }}>Interview Date</div>
              <input
                type="date"
                value={formData.interview_date}
                onChange={e => setFormData({ ...formData, interview_date: e.target.value })}
                style={{ width: '100%', backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.6rem', fontSize: '0.85rem', color: '#EEF2FF' }}
              />
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#6B7A9A', marginBottom: '0.3rem' }}>LOR Count</div>
              <input
                type="number"
                min="0"
                max="10"
                value={formData.lor_count}
                onChange={e => setFormData({ ...formData, lor_count: parseInt(e.target.value) || 0 })}
                style={{ width: '100%', backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.6rem', fontSize: '0.85rem', color: '#EEF2FF' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7A9A', marginBottom: '0.3rem' }}>LOR Notes</div>
            <input
              value={formData.lor_notes || ''}
              onChange={e => setFormData({ ...formData, lor_notes: e.target.value })}
              placeholder="e.g. Dr. Smith - general dentistry, Dr. Jones - research"
              style={{ width: '100%', backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.6rem', fontSize: '0.85rem', color: '#EEF2FF' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#6B7A9A' }}>
              <input
                type="checkbox"
                checked={formData.secondary_received}
                onChange={e => setFormData({ ...formData, secondary_received: e.target.checked })}
              />
              Secondary Received
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#6B7A9A' }}>
              <input
                type="checkbox"
                checked={formData.secondary_submitted}
                onChange={e => setFormData({ ...formData, secondary_submitted: e.target.checked })}
              />
              Secondary Submitted
            </label>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7A9A', marginBottom: '0.3rem' }}>Secondary Due Date</div>
            <input
              type="date"
              value={formData.secondary_due}
              onChange={e => setFormData({ ...formData, secondary_due: e.target.value })}
              style={{ width: '100%', backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.6rem', fontSize: '0.85rem', color: '#EEF2FF' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#6B7A9A', marginBottom: '0.3rem' }}>Notes</div>
            <textarea
              value={formData.notes || ''}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes about this school..."
              rows={3}
              style={{ width: '100%', backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.6rem', fontSize: '0.85rem', color: '#EEF2FF', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={handleSubmit}
              style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', padding: '0.6rem 1.25rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {editingApp ? 'Update' : 'Save'} School
            </button>
            <button
              onClick={resetForm}
              style={{ backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7A9A', padding: '0.6rem 1.25rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* AI ADVISOR PANEL */}
      {showAIPanel && (
        <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(0,201,167,0.2)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#00C9A7' }}>🤖 AI Application Advisor</h3>
          
          {essays.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#6B7A9A', marginBottom: '0.5rem' }}>Quick select an essay for feedback:</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {essays.slice(0, 3).map(essay => (
                  <button
                    key={essay.id}
                    onClick={() => useEssayInAI(essay)}
                    style={{ backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', color: '#EEF2FF', fontSize: '0.75rem', padding: '0.3rem 0.7rem', borderRadius: '50px', cursor: 'pointer' }}
                  >
                    {essay.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <textarea
              value={aiPrompt}
              onChange={e => setAIPrompt(e.target.value)}
              placeholder="Ask anything about applications: essay tips, school selection, interview advice, etc..."
              rows={3}
              style={{ width: '100%', backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.75rem', fontSize: '0.85rem', color: '#EEF2FF', resize: 'vertical' }}
            />
          </div>

          <button
            onClick={askAI}
            disabled={aiLoading || !aiPrompt.trim()}
            style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', padding: '0.6rem 1.25rem', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', opacity: (aiLoading || !aiPrompt.trim()) ? 0.5 : 1 }}
          >
            {aiLoading ? 'Thinking...' : 'Ask Advisor →'}
          </button>

          {aiResponse && (
            <div style={{ marginTop: '1.5rem', backgroundColor: '#111B2E', border: '1px solid rgba(0,201,167,0.15)', borderRadius: '12px', padding: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: '#EEF2FF', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{aiResponse}</div>
            </div>
          )}
        </div>
      )}

      {/* APPLICATIONS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {apps.length === 0 ? (
          <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '3rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏫</div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No schools yet</h3>
            <p style={{ color: '#6B7A9A', fontSize: '0.85rem' }}>Click "Add School" to start tracking your applications</p>
          </div>
        ) : (
          apps.map(app => {
            const isDeadlineSoon = app.deadline && new Date(app.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            
            return (
              <div key={app.id} style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{app.school_name}</h3>
                      <span style={{ backgroundColor: `${statusColors[app.status]}15`, color: statusColors[app.status], fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '50px' }}>
                        {statusLabels[app.status]}
                      </span>
                      {isDeadlineSoon && app.status === 'interested' && (
                        <span style={{ backgroundColor: '#FF6B8A15', color: '#FF6B8A', fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '50px' }}>
                          ⚠️ Deadline Soon
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setEditingApp(app)
                        setFormData({
                          school_name: app.school_name,
                          status: app.status,
                          deadline: app.deadline || '',
                          date_applied: app.date_applied || '',
                          interview_date: app.interview_date || '',
                          lor_count: app.lor_count,
                          lor_notes: app.lor_notes || '',
                          secondary_received: app.secondary_received,
                          secondary_submitted: app.secondary_submitted,
                          secondary_due: app.secondary_due || '',
                          notes: app.notes || '',
                        })
                        setShowForm(true)
                      }}
                      style={{ background: 'none', border: 'none', color: '#6B7A9A', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(app.id)}
                      style={{ background: 'none', border: 'none', color: '#FF6B8A', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                  {app.deadline && (
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#6B7A9A', marginBottom: '0.1rem' }}>Deadline</div>
                      <div style={{ fontSize: '0.8rem', color: isDeadlineSoon ? '#FF6B8A' : '#EEF2FF' }}>
                        {new Date(app.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  )}
                  {app.date_applied && (
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#6B7A9A', marginBottom: '0.1rem' }}>Applied</div>
                      <div style={{ fontSize: '0.8rem' }}>{new Date(app.date_applied).toLocaleDateString()}</div>
                    </div>
                  )}
                  {app.interview_date && (
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#6B7A9A', marginBottom: '0.1rem' }}>Interview</div>
                      <div style={{ fontSize: '0.8rem', color: '#00C9A7' }}>{new Date(app.interview_date).toLocaleDateString()}</div>
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#6B7A9A', marginBottom: '0.1rem' }}>LORs</div>
                    <div style={{ fontSize: '0.8rem' }}>{app.lor_count} / 4</div>
                  </div>
                  {app.secondary_due && (
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#6B7A9A', marginBottom: '0.1rem' }}>Secondary Due</div>
                      <div style={{ fontSize: '0.8rem' }}>{new Date(app.secondary_due).toLocaleDateString()}</div>
                    </div>
                  )}
                </div>

                {(app.lor_notes || app.notes) && (
                  <div style={{ fontSize: '0.8rem', color: '#6B7A9A', lineHeight: 1.6 }}>
                    {app.lor_notes && <div>📝 LORs: {app.lor_notes}</div>}
                    {app.notes && <div style={{ marginTop: '0.25rem' }}>📌 {app.notes}</div>}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
