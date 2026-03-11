'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type UserType = 'pre-dental' | 'dental-student' | null

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [step, setStep] = useState<1 | 2>(1)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState<UserType>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userType) return
    setLoading(true)
    setError('')

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (signupError) { setError(signupError.message); setLoading(false); return }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        email,
        full_name: fullName,
        user_type: userType,
        streak_count: 0,
        dat_target_score: 20,
        shadowing_hours: 0,
        schools_count: 0,
        created_at: new Date().toISOString(),
      })
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: '#111B2E',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    color: '#EEF2FF',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    display: 'block' as const,
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#6B7A9A',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '0.5rem',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05080F', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>

        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link href="/" style={{ fontSize: '1.8rem', fontWeight: 900, color: '#EEF2FF', textDecoration: 'none' }}>
            Dent<span style={{ color: '#00C9A7' }}>Path</span>
          </Link>

          {/* STEP INDICATOR */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#00C9A7', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>1</div>
            <div style={{ width: '40px', height: '2px', backgroundColor: step === 2 ? '#00C9A7' : 'rgba(255,255,255,0.1)', borderRadius: '1px', transition: 'background 0.3s' }} />
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: step === 2 ? '#00C9A7' : '#111B2E', border: step === 2 ? 'none' : '1px solid rgba(255,255,255,0.1)', color: step === 2 ? '#000' : '#6B7A9A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, transition: 'all 0.3s' }}>2</div>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#EEF2FF', marginTop: '1rem', marginBottom: '0.3rem' }}>
            {step === 1 ? 'Create your account' : 'One last thing'}
          </h1>
          <p style={{ color: '#6B7A9A', fontSize: '0.875rem' }}>
            {step === 1 ? 'Start your dental journey today — free' : 'Tell us where you are in your journey'}
          </p>
        </div>

        {/* CARD */}
        <div style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '24px', padding: '2rem' }}>

          {error && (
            <div style={{ backgroundColor: 'rgba(255,107,138,0.1)', border: '1px solid rgba(255,107,138,0.2)', color: '#FF6B8A', fontSize: '0.85rem', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1.25rem' }}>
              {error}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', backgroundColor: 'white', color: '#000', fontWeight: 600, fontSize: '0.9rem', padding: '0.85rem', borderRadius: '14px', border: 'none', cursor: 'pointer', marginBottom: '1.25rem' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: '0.75rem', color: '#6B7A9A' }}>or sign up with email</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.07)' }} />
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="Your full name" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@university.edu" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} placeholder="Min. 8 characters" style={inputStyle} />
                </div>
                <button
                  type="submit"
                  style={{ width: '100%', backgroundColor: '#00C9A7', color: '#000', fontWeight: 700, fontSize: '0.95rem', padding: '0.85rem', borderRadius: '14px', border: 'none', cursor: 'pointer', marginTop: '0.5rem' }}
                >
                  Continue →
                </button>
              </form>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#6B7A9A', marginBottom: '0.5rem', lineHeight: 1.6 }}>
                This helps us personalize your dashboard and show you the right tools for your stage.
              </p>

              {/* PRE-DENTAL OPTION */}
              <button
                type="button"
                onClick={() => setUserType('pre-dental')}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.2rem', borderRadius: '16px', border: `2px solid ${userType === 'pre-dental' ? '#00C9A7' : 'rgba(255,255,255,0.07)'}`, backgroundColor: userType === 'pre-dental' ? 'rgba(0,201,167,0.08)' : '#111B2E', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(0,201,167,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🎓</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#EEF2FF', marginBottom: '0.2rem' }}>I'm Pre-Dental</div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7A9A' }}>Preparing for DAT, applying to dental school</div>
                </div>
                {userType === 'pre-dental' && (
                  <div style={{ marginLeft: 'auto', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#00C9A7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#000', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>
                  </div>
                )}
              </button>

              {/* DENTAL STUDENT OPTION */}
              <button
                type="button"
                onClick={() => setUserType('dental-student')}
                style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.1rem 1.2rem', borderRadius: '16px', border: `2px solid ${userType === 'dental-student' ? '#F0C060' : 'rgba(255,255,255,0.07)'}`, backgroundColor: userType === 'dental-student' ? 'rgba(240,192,96,0.08)' : '#111B2E', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(240,192,96,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>🦷</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#EEF2FF', marginBottom: '0.2rem' }}>I'm a Dental Student</div>
                  <div style={{ fontSize: '0.8rem', color: '#6B7A9A' }}>Currently enrolled in dental school (D1–D4)</div>
                </div>
                {userType === 'dental-student' && (
                  <div style={{ marginLeft: 'auto', width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#F0C060', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#000', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>
                  </div>
                )}
              </button>

              <button
                type="submit"
                disabled={!userType || loading}
                style={{ width: '100%', backgroundColor: userType ? '#00C9A7' : '#111B2E', color: userType ? '#000' : '#4A5570', fontWeight: 700, fontSize: '0.95rem', padding: '0.85rem', borderRadius: '14px', border: 'none', cursor: userType ? 'pointer' : 'not-allowed', marginTop: '0.5rem', transition: 'all 0.2s' }}
              >
                {loading ? 'Creating account...' : 'Create Account →'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: '#6B7A9A', fontSize: '0.875rem', cursor: 'pointer', padding: '0.25rem' }}
              >
                ← Back
              </button>
            </form>
          )}
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6B7A9A', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: '#00C9A7', fontWeight: 600, textDecoration: 'none' }}>Log in</Link>
        </p>

      </div>
    </div>
  )
}
