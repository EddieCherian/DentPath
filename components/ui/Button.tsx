import { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'
import clsx from 'clsx'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const variantStyles = {
  primary: 'bg-[#00C9A7] text-black font-bold hover:bg-[#00A88B] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,201,167,0.3)] disabled:opacity-50',
  secondary: 'bg-[#0D1525] text-white border border-white/10 font-semibold hover:border-[rgba(0,201,167,0.3)] hover:text-[#00C9A7] disabled:opacity-50',
  ghost: 'bg-transparent text-[#6B7A9A] font-medium hover:text-white hover:bg-white/5 disabled:opacity-50',
  danger: 'bg-[rgba(255,107,138,0.1)] text-[#FF6B8A] border border-[rgba(255,107,138,0.2)] font-semibold hover:bg-[rgba(255,107,138,0.2)] disabled:opacity-50',
}

const sizeStyles = {
  sm: 'text-xs px-3.5 py-2 rounded-lg',
  md: 'text-sm px-5 py-2.5 rounded-xl',
  lg: 'text-base px-7 py-3.5 rounded-xl',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon: Icon,
  iconPosition = 'right',
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 transition-all duration-200',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 13 : size === 'lg' ? 18 : 15} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 13 : size === 'lg' ? 18 : 15} />}
        </>
      )}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
