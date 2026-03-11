import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './types/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#05080F',
        surface: '#0D1525',
        surface2: '#111B2E',
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
        sans: ['var(--font-outfit)', 'sans-serif'],
        display: ['var(--font-cormorant)', 'serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
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
