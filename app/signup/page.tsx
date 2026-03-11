'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { ArrowRight, GraduationCap, Stethoscope } from 'lucide-react'

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

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
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

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
        return
      }
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
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05080F] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="font-display text-3xl font-bold">
            Dent<span className="text-[#00C9A7]">Path</span>
          </Link>
          <h1 className="text-2xl font-bold mt-6 mb-2">
            {step === 1 ? 'Create your account' : 'One last thing'}
          </h1>
          <p className="text-[#6B7A9A] text-sm">
            {step === 1 ? 'Start your dental journey today' : 'Tell us where you are in your journey'}
          </p>
        </div>

        <div className="bg-[#0D1525] border border-white/5 rounded-2xl p-8">
          {error && (
            <div className="bg-[rgba(255,107,138,0.1)] border border-[rgba(255,107,138,0.2)] text-[#FF6B8A] text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {step === 1 && (
            <>
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 bg-white text-black font-semibold text-sm py-3 rounded-xl hover:bg-gray-100 transition-all mb-6 disabled:opacity-50"
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-[#6B7A9A]">or sign up with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setStep(2) }} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#6B7A9A] uppercase tracking-wider block mb-2">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Your full name"
                    className="w-full bg-[#111B2E] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4A5570] outline-none focus:border-[rgba(0,201,167,0.4)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7A9A] uppercase tracking-wider block mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@university.edu"
                    className="w-full bg-[#111B2E] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4A5570] outline-none focus:border-[rgba(0,201,167,0.4)] transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#6B7A9A] uppercase tracking-wider block mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    className="w-full bg-[#111B2E] border border-white/5 rounded-xl px-4 py-3 text-sm text-white placeholder:text-[#4A5570] outline-none focus:border-[rgba(0,201,167,0.4)] transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#00C9A7] text-black font-bold py-3 rounded-xl hover:bg-[#00A88B] transition-all flex items-center justify-center gap-2 mt-2"
                >
                  Continue <ArrowRight size={16} />
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <form onSubmit={handleSignup} className="space-y-4">
              <p className="text-sm text-[#6B7A9A] mb-6">This helps us personalize your dashboard and show you the right tools.</p>
              <button
                type="button"
                onClick={() => setUserType('pre-dental')}
                className={`w-full flex items-center gap-4 p-5 rounded-xl border transition-all text-left ${userType === 'pre-dental' ? 'border-[#00C9A7] bg-[rgba(0,201,167,0.08)]' : 'border-white/5 bg-[#111B2E] hover:border-white/20'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-[rgba(0,201,167,0.1)] flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={22} className="text-[#00C9A7]" />
                </div>
                <div>
                  <div className="font-bold text-sm">I'm Pre-Dental</div>
                  <div className="text-xs text-[#6B7A9A] mt-0.5">Preparing for DAT, applying to dental school</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setUserType('dental-student')}
                className={`w-full flex items-center gap-4 p-5 rounded-xl border transition-all text-left ${userType === 'dental-student' ? 'border-[#00C9A7] bg-[rgba(0,201,167,0.08)]' : 'border-white/5 bg-[#111B2E] hover:border-white/20'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-[rgba(240,192,96,0.1)] flex items-center justify-center flex-shrink-0">
                  <Stethoscope size={22} className="text-[#F0C060]" />
                </div>
                <div>
                  <div className="font-bold text-sm">I'm a Dental Student</div>
                  <div className="text-xs text-[#6B7A9A] mt-0.5">Currently enrolled in dental school (D1–D4)</div>
                </div>
              </button>
              <button
                type="submit"
                disabled={!userType || loading}
                className="w-full bg-[#00C9A7] text-black font-bold py-3 rounded-xl hover:bg-[#00A88B] transition-all flex items-center justify-center gap-2 disabled:opacity-40 mt-2"
              >
                {loading ? 'Creating account...' : <>Create Account <ArrowRight size={16} /></>}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-[#6B7A9A] hover:text-white transition-colors">
                ← Back
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-[#6B7A9A] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[#00C9A7] font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}

