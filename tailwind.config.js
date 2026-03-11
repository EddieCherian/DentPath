/** @type {import('tailwindcss').Config} */
module.exports = {
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
    },
  },
  plugins: [],
}
