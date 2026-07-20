import '@/styles/globals.css'

import type { Metadata } from 'next'
import { Geist, Inter } from 'next/font/google'
import { Toaster } from 'sonner'

import { Header } from '@/components/header'
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
  title: '',
  description: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={cn('font-sans', geist.variable)}>
      <body className={`${inter.variable} ${interTight.variable} h-full antialiased`}>
        <Header />
        <main className="">
          {children}
          <Toaster position="top-right" />
        </main>
      </body>
    </html>
  )
}
