import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#05080F', color: '#EEF2FF', fontFamily: 'system-ui, sans-serif' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 2rem', backgroundColor: 'rgba(5,8,15,0.9)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
          Dent<span style={{ color: '#00C9A7' }}>Path</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/login" style={{ color: '#6B7A9A', textDecoration: 'none', fontSize: '0.875rem' }}>Log in</Link>
          <Link href="/signup" style={{ backgroundColor: '#00C9A7', color: '#000', fontWeight: 700, fontSize: '0.875rem', padding: '0.5rem 1.25rem', borderRadius: '50px', textDecoration: 'none' }}>Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '6rem 2rem 4rem', position: 'relative' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.2)', color: '#00C9A7', padding: '0.4rem 1.1rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '2rem' }}>
          🦷 The #1 Platform for Dental Students
        </div>
        <h1 style={{ fontSize: 'clamp(3rem,7vw,6rem)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-2px', marginBottom: '1.5rem' }}>
          From <span style={{ color: '#00C9A7' }}>Pre-Dental</span><br />
          to <span style={{ color: '#F0C060' }}>DDS</span> — We've<br />
          Got Every Step
        </h1>
        <p style={{ fontSize: '1.1rem', color: '#6B7A9A', maxWidth: '560px', lineHeight: 1.7, marginBottom: '2.5rem' }}>
          DentPath combines AI tutoring, DAT prep, application tools, clinical trackers, and career planning into one platform built specifically for dental students.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link href="/signup" style={{ backgroundColor: '#00C9A7', color: '#000', fontWeight: 700, fontSize: '1rem', padding: '0.9rem 2rem', borderRadius: '50px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            Start for Free →
          </Link>
          <Link href="/login" style={{ backgroundColor: '#0D1525', color: '#EEF2FF', fontWeight: 600, fontSize: '1rem', padding: '0.9rem 2rem', borderRadius: '50px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
            Log In
          </Link>
        </div>

        {/* STATS */}
        <div style={{ display: 'flex', gap: '3rem', marginTop: '4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['50K+', 'Active Students'], ['66+', 'Dental Schools'], ['92%', 'Acceptance Rate'], ['500+', 'AI Features']].map(([num, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#EEF2FF', lineHeight: 1 }}>{num}</div>
              <div style={{ fontSize: '0.8rem', color: '#6B7A9A', marginTop: '0.25rem', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '5rem 2rem', backgroundColor: '#080D18' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#00C9A7', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Everything You Need</div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, lineHeight: 1.1 }}>Built for Every Stage<br />of Your Dental Journey</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: '📊', title: 'DAT Prep Suite', desc: '3,000+ practice questions, PAT visualizer, timed mock exams, and AI-powered study plans.', tag: 'Phase 2' },
              { icon: '📋', title: 'Application Tracker', desc: 'Track every school, deadline, LOR, and secondary. AADSAS navigator built in.', tag: 'Phase 3' },
              { icon: '🤖', title: 'AI Tutor', desc: 'Ask anything about pharmacology, oral path, perio, endo, and more. Powered by Gemini.', tag: 'Phase 7' },
              { icon: '🦷', title: 'Clinical Tracker', desc: 'Log every procedure, track graduation requirements, and monitor clinical competency.', tag: 'Phase 4' },
              { icon: '💬', title: 'Community', desc: 'Forums, mentor marketplace, study groups, and accountability partners.', tag: 'Phase 5' },
              { icon: '🏆', title: 'Career Planning', desc: 'Explore specialties, residency tracker, salary data, and loan calculators.', tag: 'Phase 6' },
            ].map((f) => (
              <div key={f.title} style={{ backgroundColor: '#0D1525', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '1.5rem' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: '#6B7A9A', lineHeight: 1.6, marginBottom: '1rem' }}>{f.desc}</p>
                <span style={{ backgroundColor: 'rgba(0,201,167,0.1)', color: '#00C9A7', fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '50px' }}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '5rem 2rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ color: '#00C9A7', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Simple Pricing</div>
            <h2 style={{ fontSize: 'clamp(2rem,4vw,3rem)', fontWeight: 900, lineHeight: 1.1 }}>Invest in Your Future<br />Dental Career</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {[
              { name: 'Free', price: '$0', period: '/mo', desc: 'Great for exploring DentPath', features: ['Basic DAT flashcards', 'School database browsing', 'Community forum access', 'Basic experience logger'], featured: false, cta: 'Get Started Free' },
              { name: 'Pro', price: '$19', period: '/mo', desc: 'Everything you need to get in and thrive', features: ['Full DAT question bank (3,000+ Qs)', 'Unlimited AI Tutor', 'Interview simulator', 'Personal statement coach', 'Clinical procedure tracker', 'INBDE question bank'], featured: true, cta: 'Start Pro' },
              { name: 'Lifetime', price: '$299', period: ' once', desc: 'Pay once, use forever', features: ['Everything in Pro', 'All future features', 'Priority AI responses', 'Early access', 'Founding member badge'], featured: false, cta: 'Get Lifetime Access' },
            ].map((plan) => (
              <div key={plan.name} style={{ position: 'relative', backgroundColor: plan.featured ? 'rgba(0,201,167,0.05)' : '#0D1525', border: `1px solid ${plan.featured ? 'rgba(0,201,167,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: '24px', padding: '2rem' }}>
                {plan.featured && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#00C9A7', color: '#000', fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.9rem', borderRadius: '50px' }}>MOST POPULAR</div>
                )}
                <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: '#6B7A9A', marginBottom: '0.5rem' }}>{plan.name}</div>
                <div style={{ fontSize: '3rem', fontWeight: 900, lineHeight: 1, marginBottom: '0.25rem' }}>
                  {plan.price}<span style={{ fontSize: '1rem', fontWeight: 400, color: '#6B7A9A' }}>{plan.period}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6B7A9A', marginBottom: '1.5rem' }}>{plan.desc}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ fontSize: '0.83rem', color: '#6B7A9A', paddingLeft: '1.2rem', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#00C9A7', fontWeight: 700 }}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" style={{ display: 'block', width: '100%', textAlign: 'center', padding: '0.75rem', borderRadius: '50px', fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none', backgroundColor: plan.featured ? '#00C9A7' : 'transparent', color: plan.featured ? '#000' : '#EEF2FF', border: plan.featured ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ backgroundColor: '#0D1525', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem' }}>
          Dent<span style={{ color: '#00C9A7' }}>Path</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#6B7A9A', marginBottom: '1.5rem' }}>The complete platform for dental students — pre-dental to DDS.</p>
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {['About', 'DAT Prep', 'Community', 'Blog', 'Contact'].map((l) => (
            <a key={l} href="#" style={{ fontSize: '0.82rem', color: '#6B7A9A', textDecoration: 'none' }}>{l}</a>
          ))}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#4A5570' }}>© 2026 DentPath. All rights reserved.</p>
      </footer>

    </div>
  )
}
