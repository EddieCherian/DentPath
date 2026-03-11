'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react'

interface NavbarProps {
  fullName: string
  email: string
}

export default function Navbar({ fullName, email }: NavbarProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 z-40 h-16 bg-[#05080F]/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6">

      {/* LEFT — Logo on mobile */}
      <div className="md:hidden font-display text-xl font-bold">
        Dent<span className="text-[#00C9A7]">Path</span>
      </div>
      <div className="hidden md:block" />

      {/* RIGHT */}
      <div className="flex items-center gap-3">

        {/* Notifications */}
        <button className="relative w-9 h-9 rounded-xl bg-[#0D1525] border border-white/5 flex items-center justify-center text-[#6B7A9A] hover:text-white hover:border-white/10 transition-all">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00C9A7] rounded-full" />
        </button>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 bg-[#0D1525] border border-white/5 rounded-xl px-3 py-2 hover:border-white/10 transition-all"
          >
            <div className="w-7 h-7 rounded-lg bg-[rgba(0,201,167,0.15)] flex items-center justify-center text-[#00C9A7] text-xs font-bold">
              {initials || '?'}
            </div>
            <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
              {fullName || email}
            </span>
            <ChevronDown size={14} className={`text-[#6B7A9A] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-[#0D1525] border border-white/5 rounded-2xl py-2 z-20 shadow-2xl">
                <div className="px-4 py-3 border-b border-white/5">
                  <div className="text-sm font-semibold truncate">{fullName}</div>
                  <div className="text-xs text-[#6B7A9A] truncate mt-0.5">{email}</div>
                </div>
                <button
                  onClick={() => { router.push('/dashboard/profile'); setDropdownOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#6B7A9A] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <User size={15} /> My Profile
                </button>
                <button
                  onClick={() => { router.push('/dashboard/settings'); setDropdownOpen(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#6B7A9A] hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Settings size={15} /> Settings
                </button>
                <div className="border-t border-white/5 mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#FF6B8A] hover:bg-[rgba(255,107,138,0.08)] transition-colors"
                  >
                    <LogOut size={15} /> Log Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
