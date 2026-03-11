'use client'

import Link from 'next/link'
import { LucideIcon, ArrowRight, Lock } from 'lucide-react'
import clsx from 'clsx'

interface ModuleCardProps {
  icon: LucideIcon
  title: string
  desc: string
  href: string
  status: 'active' | 'coming-soon'
  color: 'teal' | 'gold' | 'blue' | 'rose'
}

const colorMap = {
  teal: {
    icon: 'bg-[rgba(0,201,167,0.08)] text-[#00C9A7]',
    tag: 'bg-[rgba(0,201,167,0.1)] text-[#00C9A7]',
    hover: 'hover:border-[rgba(0,201,167,0.25)]',
    arrow: 'text-[#00C9A7]',
  },
  gold: {
    icon: 'bg-[rgba(240,192,96,0.08)] text-[#F0C060]',
    tag: 'bg-[rgba(240,192,96,0.1)] text-[#F0C060]',
    hover: 'hover:border-[rgba(240,192,96,0.25)]',
    arrow: 'text-[#F0C060]',
  },
  blue: {
    icon: 'bg-[rgba(74,158,255,0.08)] text-[#4A9EFF]',
    tag: 'bg-[rgba(74,158,255,0.1)] text-[#4A9EFF]',
    hover: 'hover:border-[rgba(74,158,255,0.25)]',
    arrow: 'text-[#4A9EFF]',
  },
  rose: {
    icon: 'bg-[rgba(255,107,138,0.08)] text-[#FF6B8A]',
    tag: 'bg-[rgba(255,107,138,0.1)] text-[#FF6B8A]',
    hover: 'hover:border-[rgba(255,107,138,0.25)]',
    arrow: 'text-[#FF6B8A]',
  },
}

export default function ModuleCard({
  icon: Icon,
  title,
  desc,
  href,
  status,
  color,
}: ModuleCardProps) {
  const colors = colorMap[color]
  const isActive = status === 'active'

  const cardContent = (
    <div
      className={clsx(
        'group relative bg-[#0D1525] border border-white/5 rounded-2xl p-6 transition-all duration-300',
        isActive
          ? `cursor-pointer hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(0,0,0,0.3)] ${colors.hover}`
          : 'opacity-60 cursor-not-allowed'
      )}
    >
      {/* Coming Soon Overlay */}
      {!isActive && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-full px-2.5 py-1">
          <Lock size={10} className="text-[#6B7A9A]" />
          <span className="text-xs text-[#6B7A9A] font-semibold">Soon</span>
        </div>
      )}

      {/* Icon */}
      <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center mb-4', colors.icon)}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <h3 className="font-bold text-base mb-1.5">{title}</h3>
      <p className="text-sm text-[#6B7A9A] leading-relaxed mb-4">{desc}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        {isActive ? (
          <>
            <span className={clsx('text-xs font-bold px-3 py-1 rounded-full', colors.tag)}>
              Active
            </span>
            <ArrowRight
              size={16}
              className={clsx('transition-transform group-hover:translate-x-1', colors.arrow)}
            />
          </>
        ) : (
          <span className="text-xs font-semibold text-[#4A5570]">Coming in next phase</span>
        )}
      </div>
    </div>
  )

  if (!isActive) return cardContent

  return <Link href={href}>{cardContent}</Link>
}
