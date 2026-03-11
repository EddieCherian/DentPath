'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  FileText,
  Stethoscope,
  Brain,
  Users,
  Target,
  GraduationCap,
  Menu,
  X,
  Microscope,
  Award,
} from 'lucide-react'
import clsx from 'clsx'

interface SidebarProps {
  userType: string
}

const preDentalLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/dat', icon: BookOpen, label: 'DAT Prep' },
  { href: '/dashboard/apply', icon: ClipboardList, label: 'Application Tracker' },
  { href: '/dashboard/essay', icon: FileText, label: 'Essay Coach' },
  { href: '/dashboard/interview', icon: GraduationCap, label: 'Interview Prep' },
  { href: '/dashboard/ai', icon: Brain, label: 'AI Tutor' },
  { href: '/dashboard/community', icon: Users, label: 'Community' },
  { href: '/dashboard/career', icon: Target, label: 'Career Planner' },
]

const dentalStudentLinks = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/clinical', icon: Stethoscope, label: 'Clinical Tracker' },
  { href: '/dashboard/boards', icon: BookOpen, label: 'Board Prep' },
  { href: '/dashboard/anatomy', icon: Microscope, label: 'Anatomy Tools' },
  { href: '/dashboard/ai', icon: Brain, label: 'AI Tutor' },
  { href: '/dashboard/community', icon: Users, label: 'Community' },
  { href: '/dashboard/career', icon: Target, label: 'Career Planner' },
  { href: '/dashboard/residency', icon: Award, label: 'Residency' },
]

export default function Sidebar({ userType }: SidebarProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const links = userType === 'dental-student' ? dentalStudentLinks : preDentalLinks

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* LOGO */}
      <div className="px-6 py-5 border-b border-white/5">
        <Link href="/dashboard" className="font-display text-2xl font-bold">
          Dent<span className="text-[#00C9A7]">Path</span>
        </Link>
        <div className="mt-1 text-xs text-[#6B7A9A] font-medium">
          {userType === 'dental-student' ? '🦷 Dental Student' : '🎓 Pre-Dental'}
        </div>
      </div>

      {/* NAV LINKS */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-[rgba(0,201,167,0.1)] text-[#00C9A7] border border-[rgba(0,201,167,0.15)]'
                  : 'text-[#6B7A9A] hover:text-white hover:bg-white/5'
              )}
            >
              <link.icon size={17} />
              {link.label}
            </Link>
          )
        })}
      </nav>

      {/* UPGRADE BANNER */}
      <div className="px-3 pb-4">
        <div className="bg-[rgba(0,201,167,0.06)] border border-[rgba(0,201,167,0.15)] rounded-2xl p-4">
          <div className="text-sm font-bold mb-1">Upgrade to Pro</div>
          <div className="text-xs text-[#6B7A9A] leading-relaxed mb-3">
            Unlock all AI features, full question banks, and more.
          </div>
          <Link
            href="/pricing"
            className="block w-full bg-[#00C9A7] text-black text-xs font-bold py-2 rounded-xl text-center hover:bg-[#00A88B] transition-colors"
          >
            Upgrade — $19/mo
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-[#0D1525] border-r border-white/5 flex-col z-50">
        <SidebarContent />
      </aside>

      {/* MOBILE TOGGLE */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 w-9 h-9 bg-[#0D1525] border border-white/5 rounded-xl flex items-center justify-center text-[#6B7A9A]"
      >
        <Menu size={18} />
      </button>

      {/* MOBILE SIDEBAR */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-72 bg-[#0D1525] border-r border-white/5 z-50 flex flex-col">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#6B7A9A] hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  )
}
