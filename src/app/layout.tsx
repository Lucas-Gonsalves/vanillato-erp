import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Geist, Inter } from 'next/font/google'
import { Toaster } from 'sonner'

import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
})

const interTight = Inter({
  variable: '--font-inter-tight',
  subsets: ['latin'],
  weight: ['700'],
})

export const metadata: Metadata = {
  title: 'Vanillato ERP',
  description: 'Sistema interno de gestão da Vanillato.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={cn('dark font-sans', geist.variable)}>
      <body className={`${inter.variable} ${interTight.variable} h-full antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
