import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import Providers from '@/lib/providers'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'BeSocial',
  description: 'A social feed for social people',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          <Toaster position="top-center" />
          <main className="py-4 px-8 md:py-8 md:px-12">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
