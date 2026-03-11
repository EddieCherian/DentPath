import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#05080F',
        surface: '#0D1525',
        surface2: '#111B2E',
        border: 'rgba(255,255,255,0.07)',
        teal: {
          DEFAULT: '#00C9A7',
          dark: '#00A88B',
        },
        gold: {
          DEFAULT: '#F0C060',
          dark: '#D4A030',
        },
        rose: '#FF6B8A',
        blue: '#4A9EFF',
        muted: '#6B7A9A',
        muted2: '#4A5570',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        display: ['Cormorant Garamond', 'serif'],
        mono: ['DM Mono', 'monospace'],
      },
      backgroundImage: {
        'glow-teal': 'radial-gradient(ellipse, rgba(0,201,167,0.10) 0%, transparent 65%)',
        'glow-gold': 'radial-gradient(ellipse, rgba(240,192,96,0.05) 0%, transparent 65%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease both',
        'pulse-slow': 'pulse 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
