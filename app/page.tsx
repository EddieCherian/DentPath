import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, BookOpen, Users, Award, Brain, Stethoscope } from 'lucide-react'

const features = [
  { icon: BookOpen, title: 'DAT Prep Suite', desc: '3,000+ practice questions, PAT visualizer, timed mock exams, and AI-powered study plans.', tag: 'Phase 2', color: 'teal' },
  { icon: CheckCircle, title: 'Application Tracker', desc: 'Track every school, deadline, LOR, and secondary. AADSAS navigator built in.', tag: 'Phase 3', color: 'gold' },
  { icon: Brain, title: 'AI Tutor', desc: 'Ask anything about pharmacology, oral path, perio, endo, and more. Powered by Gemini.', tag: 'Phase 7', color: 'blue' },
  { icon: Stethoscope, title: 'Clinical Tracker', desc: 'Log every procedure, track graduation requirements, and monitor clinical competency.', tag: 'Phase 4', color: 'rose' },
  { icon: Users, title: 'Community', desc: 'Forums, mentor marketplace, study groups, and accountability partners.', tag: 'Phase 5', color: 'teal' },
  { icon: Award, title: 'Career Planning', desc: 'Explore specialties, residency tracker, salary data, and loan calculators.', tag: 'Phase 6', color: 'gold' },
]

const stats = [
  { num: '50K+', label: 'Active Students' },
  { num: '66+', label: 'Dental Schools' },
  { num: '92%', label: 'Acceptance Rate' },
  { num: '500+', label: 'AI Features' },
]

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: '/mo',
    desc: 'Great for exploring DentPath',
    features: ['Basic DAT flashcards (100 cards)', 'School database browsing', 'Community forum access', 'Basic experience logger'],
    excluded: ['Full question bank', 'AI Tutor', 'Interview simulator', 'Essay coach'],
    cta: 'Get Started Free',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: '/mo',
    desc: 'Everything you need to get in and thrive',
    features: ['Everything in Free', 'Full DAT question bank (3,000+ Qs)', 'Unlimited AI Tutor', 'Interview simulator (500+ MMIs)', 'Personal statement coach', 'Clinical procedure tracker', 'INBDE question bank', 'Career & specialty tools'],
    excluded: [],
    cta: 'Start Pro',
    featured: true,
  },
  {
    name: 'Lifetime',
    price: '$299',
    period: ' once',
    desc: 'Pay once, use forever',
    features: ['Everything in Pro', 'All future features included', 'Priority AI responses', 'Early access to new modules', 'Founding member badge'],
    excluded: [],
    cta: 'Get Lifetime Access',
    featured: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#05080F] text-white">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 bg-[#05080F]/80 backdrop-blur-xl border-b border-white/5">
        <div className="font-display text-2xl font-bold">
          Dent<span className="text-[#00C9A7]">Path</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-[#6B7A9A] hover:text-white transition-colors">Features</a>
          <a href="#pricing" className="text-sm text-[#6B7A9A] hover:text-white transition-colors">Pricing</a>
          <Link href="/login" className="text-sm text-[#6B7A9A] hover:text-white transition-colors">Log in</Link>
          <Link href="/signup" className="bg-[#00C9A7] text-black text-sm font-bold px-5 py-2 rounded-full hover:bg-[#00A88B] transition-all hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
        <Link href="/signup" className="md:hidden bg-[#00C9A7] text-black text-sm font-bold px-4 py-2 rounded-full">
          Get Started
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/3 w-[700px] h-[700px] bg-[radial-gradient(ellipse,rgba(0,201,167,0.08)_0%,transparent_65%)] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(ellipse,rgba(240,192,96,0.04)_0%,transparent_65%)] pointer-events-none" />

        <div className="inline-flex items-center gap-2 bg-[rgba(0,201,167,0.1)] border border-[rgba(0,201,167,0.2)] text-[#00C9A7] px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide mb-8">
          🦷 The #1 Platform for Dental Students
        </div>

        <h1 className="font-display text-6xl md:text-8xl font-bold leading-none tracking-tight mb-6">
          From <span className="text-[#00C9A7]">Pre-Dental</span><br />
          to <span className="text-[#F0C060]">DDS</span> — We've<br />
          Got Every Step
        </h1>

        <p className="text-lg text-[#6B7A9A] max-w-xl leading-relaxed mb-10">
          DentPath combines AI tutoring, DAT prep, application tools, clinical trackers, and career planning into one platform built specifically for dental students.
        </p>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link href="/signup" className="inline-flex items-center gap-2 bg-[#00C9A7] text-black font-bold px-8 py-3.5 rounded-full hover:bg-[#00A88B] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,201,167,0.3)]">
            Start for Free <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="inline-flex items-center gap-2 bg-[#0D1525] text-white font-semibold px-8 py-3.5 rounded-full border border-white/10 hover:border-[#00C9A7]/40 hover:text-[#00C9A7] transition-all">
            Log In
          </Link>
        </div>

        <div className="flex items-center gap-12 mt-16 flex-wrap justify-center">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-4xl font-bold text-white">{s.num}</div>
              <div className="text-xs text-[#6B7A9A] font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-24 px-4 bg-[#080D18]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[#00C9A7] text-xs font-bold tracking-widest uppercase mb-3">
              <span className="w-5 h-0.5 bg-[#00C9A7] rounded" />
              Everything You Need
            </div>
            <h2 className="font-display text-5xl font-bold">Built for Every Stage<br />of Your Dental Journey</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-[#0D1525] border border-white/5 rounded-2xl p-6 hover:-translate-y-1 hover:border-[rgba(0,201,167,0.2)] transition-all duration-300 group">
                <div className="w-11 h-11 rounded-xl bg-[rgba(0,201,167,0.08)] flex items-center justify-center mb-4 group-hover:bg-[rgba(0,201,167,0.12)] transition-colors">
                  <f.icon size={20} className="text-[#00C9A7]" />
                </div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-[#6B7A9A] leading-relaxed mb-4">{f.desc}</p>
                <span className="inline-block bg-[rgba(0,201,167,0.1)] text-[#00C9A7] text-xs font-bold px-3 py-1 rounded-full">{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 text-[#00C9A7] text-xs font-bold tracking-widest uppercase mb-3">
              <span className="w-5 h-0.5 bg-[#00C9A7] rounded" />
              Simple Pricing
            </div>
            <h2 className="font-display text-5xl font-bold">Invest in Your Future<br />Dental Career</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <div key={plan.name} className={`relative rounded-2xl p-8 border transition-all ${plan.featured ? 'bg-[rgba(0,201,167,0.05)] border-[rgba(0,201,167,0.3)]' : 'bg-[#0D1525] border-white/5'}`}>
                {plan.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#00C9A7] text-black text-xs font-bold px-4 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-xs font-bold tracking-widest uppercase text-[#6B7A9A] mb-2">{plan.name}</div>
                <div className="font-display text-5xl font-bold mb-1">
                  {plan.price}<span className="text-base font-sans font-normal text-[#6B7A9A]">{plan.period}</span>
                </div>
                <div className="text-sm text-[#6B7A9A] mb-6">{plan.desc}</div>
                <ul className="space-y-2.5 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#6B7A9A]">
                      <CheckCircle size={14} className="text-[#00C9A7] mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.excluded.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[#4A5570] line-through">
                      <span className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/signup" className={`block w-full text-center py-3 rounded-full font-semibold text-sm transition-all ${plan.featured ? 'bg-[#00C9A7] text-black hover:bg-[#00A88B]' : 'bg-[#111B2E] border border-white/10 text-white hover:border-[#00C9A7] hover:text-[#00C9A7]'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0D1525] border-t border-white/5 py-12 px-4 text-center">
        <div className="font-display text-2xl font-bold mb-3">Dent<span className="text-[#00C9A7]">Path</span></div>
        <p className="text-sm text-[#6B7A9A] mb-6">The complete platform for dental students — pre-dental to DDS.</p>
        <div className="flex gap-8 justify-center mb-6">
          {['About', 'DAT Prep', 'Community', 'Blog', 'Contact'].map((l) => (
            <a key={l} href="#" className="text-sm text-[#6B7A9A] hover:text-[#00C9A7] transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-xs text-[#4A5570]">© 2026 DentPath. All rights reserved.</p>
      </footer>

    </div>
  )
}
