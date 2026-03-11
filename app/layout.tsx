import type { Metadata } from 'next'
import { Outfit, Cormorant_Garamond, DM_Mono } from 'next/font/google'
import './globals.css'

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DentPath — Your Dental Career, Perfected',
  description: 'The complete platform for dental students.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${cormorant.variable} ${dmMono.variable}`}
    >
      <body
        style={{ backgroundColor: '#05080F', color: '#EEF2FF' }}
        className="font-sans antialiased min-h-screen"
      >
        {children}
      </body>
    </html>
  )
}
