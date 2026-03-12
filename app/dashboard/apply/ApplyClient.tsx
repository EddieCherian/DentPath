'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Application {
  id: string
  school_name: string
  status: string
  deadline?: string
  notes?: string
  lor_complete?: boolean
  secondary_complete?: boolean
  created_at: string
}

interface Profile {
  id: string
  full_name: string
  dat_target_score: number
}

interface Props {
  applications: Application[]
  profile: Profile
  userId: string
}

const statuses = [
  { id: 'planning', label: 'Planning', color: '#6B7A9A', bg: 'rgba(107,122,154,0.1)' },
  { id: 'applied', label: 'Applied', color: '#4A9EFF', bg: 'rgba(74,158,255,0.1)' },
  { id: 'secondary', label: 'Secondary', color: '#F0C060', bg: 'rgba(240,192,96,0.1)' },
  { id: 'interview', label: 'Interview', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
  { id: 'accepted', label: 'Accepted', color: '#00C9A7', bg: 'rgba(0,201,167,0.1)' },
  { id: 'waitlisted', label: 'Waitlisted', color: '#F0C060', bg: 'rgba(240,192,96,0.1)' },
  { id: 'rejected', label: 'Rejected', color: '#FF6B8A', bg: 'rgba(255,107,138,0.1)' },
]

const dentalSchools = [
  'A.T. Still University', 'Boston University', 'Case Western Reserve', 'Columbia University',
  'Creighton University', 'East Carolina University', 'Harvard School of Dental Medicine',
  'Howard University', 'Indiana University', 'Louisiana State University',
  'Marquette University', 'Medical University of South Carolina', 'Meharry Medical College',
  'Michigan Medicine', 'Midwestern University - Arizona', 'Midwestern University - Illinois',
  'New York University', 'Northeastern University', 'Nova Southeastern University',
  'Ohio State University', 'Oregon Health & Science University', 'Penn Dental Medicine',
  'Roseman University', 'Rutgers School of Dental Medicine', 'Southern Illinois University',
  'Stony Brook University', 'Temple University', 'Texas A&M University',
  'Tufts University', 'UCLA', 'UCSF', 'University of Alabama',
  'University of Buffalo', 'University of Colorado', 'University of Connecticut',
  'University of Detroit Mercy', 'University of Florida', 'University of Illinois Chicago',
  'University of Iowa', 'University of Kentucky', 'University of Louisville',
  'University of Maryland', 'University of Minnesota', 'University of Mississippi',
  'University of Missouri - Kansas City', 'University of Nebraska', 'University of Nevada Las Vegas',
  'University of New England', 'University of North Carolina', 'University of Oklahoma',
  'University of Pittsburgh', 'University of Puerto Rico', 'University of Tennessee',
  'University of Texas - Houston', 'University of Texas - San Antonio', 'University of Utah',
  'University of Washington', 'University of Wisconsin', 'VCU School of Dentistry',
  'West Virginia University', 'Western University of Health Sciences', 'Loma Linda University',
  'Lake Erie College', 'Touro College', 'Pacific Dugoni', 'Arizona School of Dentistry',
  'Georgia School of Dentistry', 'East Tennessee State University',
]

export default function ApplyClient({ applications: initialApplications, profile, userId }: Props) {
  const supabase = createClientComponentClient()
  const [applications, setApplications] = useState<Application[]>(initialApplications)
  const [showAdd, setShowAdd] = useState(false)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState('')
  const [showAI, setShowAI] = useState(false)

  const [newSchool, setNewSchool] = useState('')
  const [newStatus, setNewStatus] = useState('planning')
  const [newDeadline, setNewDeadline] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [schoolSearch, setSchoolSearch] = useState('')
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false)

  const filteredSchools = dentalSchools.filter(s =>
    s.toLowerCase().includes(schoolSearch.toLowerCase())
  ).slice(0, 6)

  const addApplication = async () => {
    if (!newSchool.trim()) return
    setLoading(true)
    const { data, error } = await supabase
      .from('school_applications')
      .insert({
        user_id: userId,
        school_name: newSchool,
        status: newStatus,
        deadline: newDeadline || null,
        notes: newNotes || null,
        lor_complete: false,
        secondary_complete: false,
      })
      .select()
      .single()

    if (!error && data) {
      setApplications(prev => [data, ...prev])
      setNewSchool('')
      setNewStatus('planning')
      setNewDeadline('')
      setNewNotes('')
      setSchoolSearch('')
      setShowAdd(false)
    }
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('school_applications').update({ status }).eq('id', id)
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const toggleLOR = async (id: string, current: boolean) => {
    await supabase.from('school_applications').update({ lor_complete: !current }).eq('id', id)
    setApplications(prev => prev.map(a => a.id === id ? { ...a, lor_complete: !current } : a))
  }

  const toggleSecondary = async (id: string, current: boolean) => {
    await supabase.from('school_applications').update({ secondary_complete: !current }).eq('id', id)
    setApplications(prev => prev.map(a => a.id === id ? { ...a, secondary_complete: !current } : a))
  }

  const deleteApplication = async (id: string) => {
    await supabase.from('school_applications').delete().eq('id', id)
    setApplications(prev => prev.filter(a => a.id !== id))
  }

  const getAISuggestions = async () => {
    setAiLoading(true)
    setShowAI(true)
    setAiSuggestions('')
    const applied = applications.map(a => a.school_name).join(', ')
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `You are a dental school admissions expert. A pre-dental student has a DAT target score of ${profile.dat_target_score} and is applying to these schools: ${applied || 'none yet'}.

Give them specific, actionable advice on:
1. Whether their school list is balanced (reach, match, safety)
2. Any schools they should add or remove
3. Important deadlines to know about (AADSAS opens in May, most schools rolling admissions)
4. 2-3 specific tips for their application strategy

Keep it concise, honest, and encouraging. No fluff.`
          }]
        })
      })
      const data = await response.json()
      setAiSuggestions(data.content?.[0]?.text || 'Could not generate suggestions.')
    } catch {
      setAiSuggestions('Something went wrong. Please try again.')
    }
    setAiLoading(false)
  }

  const filtered = applications.filter(a => {
    const matchStatus = filterStatus === 'all' || a.status === filterStatus
    const matchSearch = a.school_name.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const stats = {
    total: applications.length,
    applied: applications.filter(a => ['applied', 'secondary', 'interview', 'accepted'].includes(a.status)).length,
    interviews: applications.filter(a => a.status === 'interview').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: '#111B2E',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: '#EEF2FF',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05080F', color: '#EEF2FF', fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#00C9A7', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Phase 3 — Applications</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.25rem' }}>Application Tracker</h1>
          <p style={{ color: '#6B7A9A', fontSize: '0.9rem' }}>Track every school, deadline, and status in one place</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={getAISuggestions}
            style={{ backgroundColor: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.2)', color: '#00C9A7', fontWeight: 600, fontSize: '0.85rem', padding: '0.65rem 1.25rem', borderRadius: '50px', cursor: 'pointer' }}
          >
            🤖 AI Advice
          </button>
          <button
            onClick={() => setShowAdd(true)}
            style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', fontWeight: 700, fontSize: '0.85rem', padding: '0.65rem 1.25rem', borderRadius: '50px', cursor: 'pointer' }}
          >
            + Add School
          </button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Schools Listed', value: stats.total, color: '#EEF2FF' },
          { label: 'Applications Sent', value: stats.applied, color: '#4A9EFF' },
          { label: 'Interviews', value: stats.interviews, color: '#A78BFA' },
          { label: 'Accepted', value: stats.accepted, color: '#00C9A7' },
        ].map(s => (
          <div key={s.label} style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.72rem', color: '#6B7A9A', marginTop: '0.3rem' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI SUGGESTIONS */}
      {showAI && (
        <div style={{ backgroundColor: 'rgba(0,201,167,0.06)', border: '1px solid rgba(0,201,167,0.15)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#00C9A7' }}>🤖 AI Application Advice</div>
            <button onClick={() => setShowAI(false)} style={{ background: 'none', border: 'none', color: '#6B7A9A', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
          </div>
          {aiLoading ? (
            <div style={{ color: '#6B7A9A', fontSize: '0.875rem' }}>Analyzing your school list...</div>
          ) : (
            <p style={{ fontSize: '0.875rem', color: '#6B7A9A', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>{aiSuggestions}</p>
          )}
        </div>
      )}

      {/* ADD SCHOOL MODAL */}
      {showAdd && (
        <>
          <div onClick={() => setShowAdd(false)} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '480px', zIndex: 50 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Add a School</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* SCHOOL SEARCH */}
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7A9A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>School Name</label>
                <input
                  value={schoolSearch}
                  onChange={e => { setSchoolSearch(e.target.value); setNewSchool(e.target.value); setShowSchoolDropdown(true) }}
                  placeholder="Search dental schools..."
                  style={inputStyle}
                />
                {showSchoolDropdown && schoolSearch && filteredSchools.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', marginTop: '0.25rem', zIndex: 60, overflow: 'hidden' }}>
                    {filteredSchools.map(school => (
                      <button
                        key={school}
                        onClick={() => { setNewSchool(school); setSchoolSearch(school); setShowSchoolDropdown(false) }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.65rem 1rem', fontSize: '0.85rem', color: '#EEF2FF', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        {school}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* STATUS */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7A9A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Status</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {statuses.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setNewStatus(s.id)}
                      style={{ padding: '0.35rem 0.85rem', borderRadius: '50px', fontSize: '0.78rem', fontWeight: 600, border: `1px solid ${newStatus === s.id ? s.color : 'rgba(255,255,255,0.07)'}`, backgroundColor: newStatus === s.id ? s.bg : 'transparent', color: newStatus === s.id ? s.color : '#6B7A9A', cursor: 'pointer' }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* DEADLINE */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7A9A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Deadline (optional)</label>
                <input type="date" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} style={{ ...inputStyle, colorScheme: 'dark' }} />
              </div>

              {/* NOTES */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7A9A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Notes (optional)</label>
                <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Any notes about this school..." rows={2} style={{ ...inputStyle, resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button onClick={() => setShowAdd(false)} style={{ flex: 1, backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7A9A', fontWeight: 600, fontSize: '0.875rem', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
                <button onClick={addApplication} disabled={loading || !newSchool.trim()} style={{ flex: 1, backgroundColor: '#00C9A7', border: 'none', color: '#000', fontWeight: 700, fontSize: '0.875rem', padding: '0.75rem', borderRadius: '12px', cursor: 'pointer', opacity: loading || !newSchool.trim() ? 0.6 : 1 }}>
                  {loading ? 'Adding...' : 'Add School'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* FILTERS */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search schools..."
          style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '50px', padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#EEF2FF', outline: 'none', width: '200px' }}
        />
        <button onClick={() => setFilterStatus('all')} style={{ backgroundColor: filterStatus === 'all' ? '#00C9A7' : '#0D1525', border: `1px solid ${filterStatus === 'all' ? '#00C9A7' : 'rgba(255,255,255,0.07)'}`, color: filterStatus === 'all' ? '#000' : '#6B7A9A', borderRadius: '50px', padding: '0.4rem 1rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>All</button>
        {statuses.map(s => (
          <button
            key={s.id}
            onClick={() => setFilterStatus(s.id)}
            style={{ backgroundColor: filterStatus === s.id ? s.bg : '#0D1525', border: `1px solid ${filterStatus === s.id ? s.color : 'rgba(255,255,255,0.07)'}`, color: filterStatus === s.id ? s.color : '#6B7A9A', borderRadius: '50px', padding: '0.4rem 1rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* SCHOOL LIST */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', backgroundColor: '#0D1525', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🏫</div>
          <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No schools added yet</div>
          <div style={{ fontSize: '0.85rem', color: '#6B7A9A', marginBottom: '1.5rem' }}>Start building your school list to track your applications</div>
          <button onClick={() => setShowAdd(true)} style={{ backgroundColor: '#00C9A7', border: 'none', color: '#000', fontWeight: 700, fontSize: '0.875rem', padding: '0.65rem 1.5rem', borderRadius: '50px', cursor: 'pointer' }}>+ Add Your First School</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(app => {
            const statusObj = statuses.find(s => s.id === app.status) || statuses[0]
            const deadline = app.deadline ? new Date(app.deadline) : null
            const daysLeft = deadline ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
            return (
              <div key={app.id} style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>

                  {/* LEFT */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#EEF2FF' }}>{app.school_name}</span>
                      <span style={{ backgroundColor: statusObj.bg, color: statusObj.color, fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '50px' }}>{statusObj.label}</span>
                      {daysLeft !== null && (
                        <span style={{ backgroundColor: daysLeft < 14 ? 'rgba(255,107,138,0.1)' : 'rgba(255,255,255,0.05)', color: daysLeft < 14 ? '#FF6B8A' : '#6B7A9A', fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '50px' }}>
                          {daysLeft < 0 ? 'Deadline passed' : `${daysLeft}d left`}
                        </span>
                      )}
                    </div>
                    {app.notes && <p style={{ fontSize: '0.8rem', color: '#6B7A9A', marginBottom: '0.75rem' }}>{app.notes}</p>}

                    {/* CHECKLIST */}
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => toggleLOR(app.id, app.lor_complete || false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: app.lor_complete ? 'rgba(0,201,167,0.1)' : '#111B2E', border: `1px solid ${app.lor_complete ? 'rgba(0,201,167,0.3)' : 'rgba(255,255,255,0.07)'}`, color: app.lor_complete ? '#00C9A7' : '#6B7A9A', fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: '50px', cursor: 'pointer' }}
                      >
                        {app.lor_complete ? '✓' : '○'} LORs
                      </button>
                      <button
                        onClick={() => toggleSecondary(app.id, app.secondary_complete || false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: app.secondary_complete ? 'rgba(0,201,167,0.1)' : '#111B2E', border: `1px solid ${app.secondary_complete ? 'rgba(0,201,167,0.3)' : 'rgba(255,255,255,0.07)'}`, color: app.secondary_complete ? '#00C9A7' : '#6B7A9A', fontSize: '0.75rem', fontWeight: 600, padding: '0.3rem 0.75rem', borderRadius: '50px', cursor: 'pointer' }}
                      >
                        {app.secondary_complete ? '✓' : '○'} Secondary
                      </button>
                    </div>
                  </div>

                  {/* RIGHT — STATUS CHANGER */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end' }}>
                    <select
                      value={app.status}
                      onChange={e => updateStatus(app.id, e.target.value)}
                      style={{ backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px', padding: '0.4rem 0.75rem', fontSize: '0.78rem', color: '#EEF2FF', outline: 'none', cursor: 'pointer' }}
                    >
                      {statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    <button
                      onClick={() => deleteApplication(app.id)}
                      style={{ background: 'none', border: 'none', color: '#4A5570', fontSize: '0.75rem', cursor: 'pointer', padding: '0.2rem 0.5rem' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
