'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface Props {
  children: React.ReactNode
  profile: any
  email: string
}

const preDentalLinks = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/dashboard/dat', icon: '📊', label: 'DAT Prep' },
  { href: '/dashboard/apply', icon: '📋', label: 'Application Tracker' },
  { href: '/dashboard/essay', icon: '✍️', label: 'Essay Coach' },
  { href: '/dashboard/interview', icon: '🎤', label: 'Interview Prep' },
  { href: '/dashboard/ai', icon: '🤖', label: 'AI Tutor' },
  { href: '/dashboard/community', icon: '💬', label: 'Community' },
  { href: '/dashboard/career', icon: '🏆', label: 'Career Planner' },
]

const dentalLinks = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/dashboard/clinical', icon: '🦷', label: 'Clinical Tracker' },
  { href: '/dashboard/boards', icon: '📚', label: 'Board Prep' },
  { href: '/dashboard/anatomy', icon: '🔬', label: 'Anatomy Tools' },
  { href: '/dashboard/ai', icon: '🤖', label: 'AI Tutor' },
  { href: '/dashboard/community', icon: '💬', label: 'Community' },
  { href: '/dashboard/career', icon: '🏆', label: 'Career Planner' },
]

export default function DashboardShell({ children, profile, email }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const links = profile?.user_type === 'dental-student' ? dentalLinks : preDentalLinks
  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const Sidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#0D1525', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
      {/* LOGO */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/dashboard" style={{ fontSize: '1.5rem', fontWeight: 900, color: '#EEF2FF', textDecoration: 'none' }} onClick={() => setSidebarOpen(false)}>
          Dent<span style={{ color: '#00C9A7' }}>Path</span>
        </Link>
        <div style={{ fontSize: '0.72rem', color: '#6B7A9A', fontWeight: 500, marginTop: '0.3rem' }}>
          {profile?.user_type === 'dental-student' ? '🦷 Dental Student' : '🎓 Pre-Dental'}
        </div>
      </div>

      {/* LINKS */}
      <nav style={{ flex: 1, padding: '0.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setSidebarOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '12px', textDecoration: 'none', fontSize: '0.875rem', fontWeight: isActive ? 600 : 500, color: isActive ? '#00C9A7' : '#6B7A9A', backgroundColor: isActive ? 'rgba(0,201,167,0.1)' : 'transparent', border: isActive ? '1px solid rgba(0,201,167,0.15)' : '1px solid transparent', transition: 'all 0.15s' }}
            >
              <span style={{ fontSize: '1rem' }}>{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* UPGRADE */}
      <div style={{ padding: '0.75rem' }}>
        <div style={{ backgroundColor: 'rgba(0,201,167,0.06)', border: '1px solid rgba(0,201,167,0.15)', borderRadius: '16px', padding: '1rem' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#EEF2FF', marginBottom: '0.3rem' }}>Upgrade to Pro</div>
          <div style={{ fontSize: '0.75rem', color: '#6B7A9A', lineHeight: 1.5, marginBottom: '0.75rem' }}>Unlock all AI features and question banks</div>
          <Link href="/pricing" style={{ display: 'block', textAlign: 'center', backgroundColor: '#00C9A7', color: '#000', fontWeight: 700, fontSize: '0.78rem', padding: '0.5rem', borderRadius: '10px', textDecoration: 'none' }}>
            Upgrade — $19/mo
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05080F', color: '#EEF2FF', fontFamily: 'system-ui, sans-serif', display: 'flex' }}>

      {/* DESKTOP SIDEBAR */}
      <div style={{ width: '240px', flexShrink: 0, position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40, display: 'none' }} className="desktop-sidebar">
        <Sidebar />
      </div>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <>
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 40, backdropFilter: 'blur(4px)' }}
          />
          <div style={{ position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px', zIndex: 50 }}>
            <Sidebar />
          </div>
        </>
      )}

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

        {/* TOP NAV */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, backgroundColor: 'rgba(5,8,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* LEFT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7A9A', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', flexShrink: 0 }}
            >
              ☰
            </button>
            <Link href="/dashboard" style={{ fontSize: '1.2rem', fontWeight: 900, color: '#EEF2FF', textDecoration: 'none' }}>
              Dent<span style={{ color: '#00C9A7' }}>Path</span>
            </Link>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
            <button style={{ background: 'none', border: '1px solid rgba(255,255,255,0.07)', color: '#6B7A9A', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '1rem', position: 'relative' }}>
              🔔
            </button>

            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.4rem 0.75rem', cursor: 'pointer' }}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: 'rgba(0,201,167,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#00C9A7' }}>
                {initials}
              </div>
              <span style={{ fontSize: '0.82rem', color: '#EEF2FF', fontWeight: 500, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {profile?.full_name?.split(' ')[0] || email.split('@')[0]}
              </span>
              <span style={{ color: '#6B7A9A', fontSize: '0.7rem' }}>▾</span>
            </button>

            {dropdownOpen && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 10 }} onClick={() => setDropdownOpen(false)} />
                <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '200px', backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '0.5rem', zIndex: 20, boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}>
                  <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '0.25rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#EEF2FF' }}>{profile?.full_name || 'User'}</div>
                    <div style={{ fontSize: '0.72rem', color: '#6B7A9A', marginTop: '0.1rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
                  </div>
                  {[
                    { label: '👤 My Profile', href: '/dashboard/profile' },
                    { label: '⚙️ Settings', href: '/dashboard/settings' },
                  ].map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)} style={{ display: 'block', padding: '0.6rem 0.75rem', fontSize: '0.83rem', color: '#6B7A9A', textDecoration: 'none', borderRadius: '10px' }}>
                      {item.label}
                    </Link>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
                    <button
                      onClick={handleLogout}
                      style={{ width: '100%', textAlign: 'left', padding: '0.6rem 0.75rem', fontSize: '0.83rem', color: '#FF6B8A', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '10px' }}
                    >
                      🚪 Log Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .desktop-sidebar { display: block !important; }
          main { margin-left: 240px; }
        }
      `}</style>
    </div>
  )
}
