import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import ModuleCard from '@/components/ModuleCard'
import { BookOpen, ClipboardList, FileText, Stethoscope, Brain, Users, Flame, Target, Clock, School } from 'lucide-react'

const preDentalModules = [
  { icon: BookOpen, title: 'DAT Prep', desc: '3,000+ questions, mock exams, PAT visualizer', href: '/dashboard/dat', status: 'active' as const, color: 'teal' as const },
  { icon: ClipboardList, title: 'Application Tracker', desc: 'Track schools, deadlines, and LORs', href: '/dashboard/apply', status: 'active' as const, color: 'gold' as const },
  { icon: FileText, title: 'Essay Coach', desc: 'AI-powered personal statement review', href: '/dashboard/essay', status: 'coming-soon' as const, color: 'blue' as const },
  { icon: Brain, title: 'AI Tutor', desc: 'Ask anything dental — powered by Gemini', href: '/dashboard/ai', status: 'coming-soon' as const, color: 'rose' as const },
  { icon: Users, title: 'Community', desc: 'Forums, mentors, and study partners', href: '/dashboard/community', status: 'coming-soon' as const, color: 'teal' as const },
  { icon: Target, title: 'Career Planner', desc: 'Specialties, residency, salary explorer', href: '/dashboard/career', status: 'coming-soon' as const, color: 'gold' as const },
]

const dentalStudentModules = [
  { icon: Stethoscope, title: 'Clinical Tracker', desc: 'Log procedures, track graduation requirements', href: '/dashboard/clinical', status: 'active' as const, color: 'teal' as const },
  { icon: BookOpen, title: 'Board Prep (INBDE)', desc: '2,000+ board questions with explanations', href: '/dashboard/boards', status: 'active' as const, color: 'gold' as const },
  { icon: Brain, title: 'AI Tutor', desc: 'Pharmacology, oral path, perio, and more', href: '/dashboard/ai', status: 'coming-soon' as const, color: 'blue' as const },
  { icon: FileText, title: 'Anatomy Tools', desc: '3D tooth viewer, numbering quiz, radiographs', href: '/dashboard/anatomy', status: 'coming-soon' as const, color: 'rose' as const },
  { icon: Users, title: 'Community', desc: 'Forums, mentors, and study partners', href: '/dashboard/community', status: 'coming-soon' as const, color: 'teal' as const },
  { icon: Target, title: 'Career Planner', desc: 'Specialties, residency, salary explorer', href: '/dashboard/career', status: 'coming-soon' as const, color: 'gold' as const },
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

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const isPreDental = profile?.user_type === 'pre-dental'
  const modules = isPreDental ? preDentalModules : dentalStudentModules

  const quickStats = isPreDental
    ? [
        { icon: Target, label: 'DAT Target', value: profile?.dat_target_score || 20, unit: 'AA', color: 'teal' },
        { icon: Clock, label: 'Shadowing Hours', value: profile?.shadowing_hours || 0, unit: 'hrs', color: 'gold' },
        { icon: School, label: 'Schools on List', value: profile?.schools_count || 0, unit: '', color: 'blue' },
      ]
    : [
        { icon: Stethoscope, label: 'Procedures Logged', value: 47, unit: '', color: 'teal' },
        { icon: Target, label: 'Requirements Met', value: 68, unit: '%', color: 'gold' },
        { icon: BookOpen, label: 'Board Questions', value: 340, unit: ' done', color: 'blue' },
      ]

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-2xl">👋</div>
          <p className="text-[#6B7A9A] text-sm font-medium">Welcome back</p>
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold">
          Hey, <span className="text-[#00C9A7]">{firstName}</span>
        </h1>
        <p className="text-[#6B7A9A] mt-2 text-sm">
          {isPreDental ? 'Pre-Dental Student' : 'Dental Student'} · Keep up the great work 🦷
        </p>
      </div>

      {/* STREAK + STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="col-span-2 md:col-span-1 bg-[#0D1525] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[rgba(240,192,96,0.1)] flex items-center justify-center">
            <Flame size={22} className="text-[#F0C060]" />
          </div>
          <div>
            <div className="font-display text-3xl font-bold text-[#F0C060]">{profile?.streak_count || 0}</div>
            <div className="text-xs text-[#6B7A9A] font-medium">Day Streak 🔥</div>
          </div>
        </div>
        {quickStats.map((stat) => (
          <div key={stat.label} className="bg-[#0D1525] border border-white/5 rounded-2xl p-5">
            <div className="font-display text-3xl font-bold text-[#00C9A7]">{stat.value}{stat.unit}</div>
            <div className="text-xs text-[#6B7A9A] font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* MODULES */}
      <div className="mb-6">
        <h2 className="font-bold text-lg mb-1">Your Modules</h2>
        <p className="text-sm text-[#6B7A9A]">
          {isPreDental ? 'Tools for getting into dental school' : 'Tools for thriving in dental school'}
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((mod) => (
          <ModuleCard key={mod.title} {...mod} />
        ))}
      </div>

    </div>
  )
}

