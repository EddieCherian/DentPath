'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false) }
    else { router.push('/dashboard'); router.refresh() }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05080F', display: 'flex', fontFamily: 'system-ui, sans-serif' }}>

      {/* LEFT PANEL */}
      <div style={{ display: 'none', flex: 1, background: 'linear-gradient(135deg, #0D1525 0%, #05080F 100%)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '3rem', flexDirection: 'column', justifyContent: 'space-between', minHeight: '100vh' }} className="left-panel">
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#EEF2FF' }}>
          Dent<span style={{ color: '#00C9A7' }}>Path</span>
        </div>
        <div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.2, color: '#EEF2FF', marginBottom: '1.5rem' }}>
            Your dental career<br />starts <span style={{ color: '#00C9A7' }}>here.</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['DAT Prep with 3,000+ questions', 'AI Tutor powered by Gemini', 'Application tracker for all 66 schools', 'Clinical procedure logger'].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#6B7A9A', fontSize: '0.9rem' }}>
                <span style={{ color: '#00C9A7', fontWeight: 700 }}>✓</span> {item}
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#4A5570' }}>© 2026 DentPath</div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* LOGO mobile */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EEF2FF', textDecoration: 'none' }}>
              Dent<span style={{ color: '#00C9A7' }}>Path</span>
            </Link>
            <div style={{ marginTop: '1rem' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#EEF2FF', marginBottom: '0.4rem' }}>Welcome back</h1>
              <p style={{ color: '#6B7A9A', fontSize: '0.9rem' }}>Sign in to continue your dental journey</p>
            </div>
          </div>

          {/* CARD */}
          <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '2rem' }}>

            {error && (
              <div style={{ backgroundColor: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.2)', color: '#FF6B8A', fontSize: '0.85rem', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
                {error}
              </div>
            )}

            {/* GOOGLE */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', backgroundColor: 'white', color: '#000', fontWeight: 600, fontSize: '0.9rem', padding: '0.85rem', borderRadius: '14px', border: 'none', cursor: 'pointer', marginBottom: '1.25rem', opacity: loading ? 0.6 : 1 }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            {/* DIVIDER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: '0.75rem', color: '#6B7A9A' }}>or continue with email</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' }} />
            </div>

            {/* FORM */}
            <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#6B7A9A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@university.edu"
                  style={{ width: '100%', backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.9rem', color: '#EEF2FF', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7A9A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
                  <a href="#" style={{ fontSize: '0.75rem', color: '#00C9A7', textDecoration: 'none' }}>Forgot password?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{ width: '100%', backgroundColor: '#111B2E', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '0.75rem 3rem 0.75rem 1rem', fontSize: '0.9rem', color: '#EEF2FF', outline: 'none', boxSizing: 'border-box' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#6B7A9A', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{ width: '100%', backgroundColor: '#00C9A7', color: '#000', fontWeight: 700, fontSize: '0.95rem', padding: '0.85rem', borderRadius: '14px', border: 'none', cursor: 'pointer', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? 'Signing in...' : 'Sign In →'}
              </button>
            </form>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6B7A9A', marginTop: '1.5rem' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#00C9A7', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
