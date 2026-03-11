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
          <Link href="/signup​​​​​​​​​​​​​​​​
