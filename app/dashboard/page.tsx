import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Add this to fix dynamic server error
export const dynamic = 'force-dynamic'

const preDentalModules = [
  { icon: '📊', title: 'DAT Prep', desc: '3,000+ AI-generated questions, mock exams, flashcards', href: '/dashboard/dat', status: 'active', color: '#00C9A7' },
  { icon: '📋', title: 'Application Tracker', desc: 'Track schools, deadlines, LORs, and secondaries', href: '/dashboard/apply', status: 'coming-soon', color: '#F0C060' },
  { icon: '✍️', title: 'Essay Coach', desc: 'AI-powered personal statement review and feedback', href: '/dashboard/essay', status: 'coming-soon', color: '#4A9EFF' },
  { icon: '🎤', title: 'Interview Prep', desc: '500+ MMI prompts with AI evaluation', href: '/dashboard/interview', status: 'coming-soon', color: '#FF6B8A' },
  { icon: '💬', title: 'Community', desc: 'Forums, mentors, and study partners', href: '/dashboard/community', status: 'coming-soon', color: '#F0C060' },
]

const dentalStudentModules = [
  { icon: '🦷', title: 'Clinical Tracker', desc: 'Log procedures and track graduation requirements', href: '/dashboard/clinical', status: 'coming-soon', color: '#00C9A7' },
  { icon: '📚', title: 'Board Prep', desc: 'INBDE question bank with AI explanations', href: '/dashboard/boards', status: 'coming-soon', color: '#F0C060' },
  { icon: '🤖', title: 'AI Tutor', desc: 'Pharmacology, oral path, perio, endo and more', href: '/dashboard/ai', status: 'coming-soon', color: '#4A9EFF' },
  { icon: '🔬', title: 'Anatomy Tools', desc: '3D tooth viewer, numbering quiz, radiographs', href: '/dashboard/anatomy', status: 'coming-soon', color: '#FF6B8A' },
  { icon: '💬', title: 'Community', desc: 'Forums, mentors, and study partners', href: '/dashboard/community', status: 'coming-soon', color: '#A78BFA' },
  { icon: '🏆', title: 'Career Planner', desc: 'Specialties, residency, salary explorer', href: '/dashboard/career', status: 'coming-soon', color: '#F0C060' },
]

export default async function DashboardPage() {
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Pull real stats from Supabase
  const { count: procedureCount } = await supabase
    .from('procedure_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  const { count: questionsAnswered } = await supabase
    .from('dat_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  const { count: correctAnswers } = await supabase
    .from('dat_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)
    .eq('correct', true)

  const { count: schoolsCount } = await supabase
    .from('school_applications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  const firstName = profile?.full_name?.split(' ')[0] || session.user.email?.split('@')[0] || 'there'
  const isPreDental = profile?.user_type === 'pre-dental'
  const modules = isPreDental ? preDentalModules : dentalStudentModules
  const accuracy = questionsAnswered && questionsAnswered > 0
    ? Math.round(((correctAnswers || 0) / questionsAnswered) * 100)
    : 0

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05080F', color: '#EEF2FF', fontFamily: 'system-ui, sans-serif', padding: '2.5rem' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ color: '#6B7A9A', fontSize: '0.875rem', marginBottom: '0.4rem' }}>👋 Welcome back</p>
        <h1 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '0.4rem' }}>
          Hey, <span style={{ color: '#00C9A7' }}>{firstName}</span>
        </h1>
        <p style={{ color: '#6B7A9A', fontSize: '0.875rem' }}>
          {isPreDental ? '🎓 Pre-Dental Student' : '🦷 Dental Student'} · Keep up the great work!
        </p>
      </div>

      {/* STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>

        {/* STREAK — always shown */}
        <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: 'rgba(240,192,96,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>🔥</div>
          <div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F0C060', lineHeight: 1 }}>{profile?.streak_count || 0}</div>
            <div style={{ fontSize: '0.72rem', color: '#6B7A9A', fontWeight: 500, marginTop: '0.2rem' }}>Day Streak</div>
          </div>
        </div>

        {isPreDental ? (
          <>
            <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#00C9A7', lineHeight: 1 }}>{questionsAnswered || 0}</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7A9A', fontWeight: 500, marginTop: '0.2rem' }}>Questions Done</div>
            </div>
            <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F0C060', lineHeight: 1 }}>{accuracy}%</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7A9A', fontWeight: 500, marginTop: '0.2rem' }}>DAT Accuracy</div>
            </div>
            <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#4A9EFF', lineHeight: 1 }}>{schoolsCount || 0}</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7A9A', fontWeight: 500, marginTop: '0.2rem' }}>Schools Listed</div>
            </div>
          </>
        ) : (
          <>
            <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#00C9A7', lineHeight: 1 }}>{procedureCount || 0}</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7A9A', fontWeight: 500, marginTop: '0.2rem' }}>Procedures Logged</div>
            </div>
            <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F0C060', lineHeight: 1 }}>{questionsAnswered || 0}</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7A9A', fontWeight: 500, marginTop: '0.2rem' }}>Board Questions</div>
            </div>
            <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '1.25rem' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#4A9EFF', lineHeight: 1 }}>{accuracy}%</div>
              <div style={{ fontSize: '0.72rem', color: '#6B7A9A', fontWeight: 500, marginTop: '0.2rem' }}>Accuracy</div>
            </div>
          </>
        )}
      </div>

      {/* MODULES */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.3rem' }}>Your Modules</h2>
        <p style={{ fontSize: '0.85rem', color: '#6B7A9A' }}>
          {isPreDental ? 'Tools for getting into dental school' : 'Tools for thriving in dental school'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {modules.map((mod) => (
          <div key={mod.title} style={{ backgroundColor: '#0D1525', border: `1px solid ${mod.status === 'active' ? `${mod.color}25` : 'rgba(255,255,255,0.07)'}`, borderRadius: '20px', padding: '1.5rem', position: 'relative', opacity: mod.status === 'active' ? 1 : 0.65 }}>
            {mod.status === 'coming-soon' && (
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '50px', padding: '0.2rem 0.6rem', fontSize: '0.65rem', fontWeight: 700, color: '#6B7A9A' }}>
                SOON
              </div>
            )}
            <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{mod.icon}</div>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.4rem' }}>{mod.title}</h3>
            <p style={{ fontSize: '0.82rem', color: '#6B7A9A', lineHeight: 1.6, marginBottom: '1.1rem' }}>{mod.desc}</p>
            {mod.status === 'active' ? (
              <Link href={mod.href} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: mod.color, color: '#000', fontWeight: 700, fontSize: '0.82rem', padding: '0.5rem 1.1rem', borderRadius: '50px', textDecoration: 'none' }}>
                Open →
              </Link>
            ) : (
              <span style={{ fontSize: '0.8rem', color: '#4A5570', fontWeight: 500 }}>Coming in next phase</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}