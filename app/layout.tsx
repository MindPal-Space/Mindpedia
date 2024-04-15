import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'
import { AI } from './action'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'Mindpedia'
const description =
  '100% FREE AI-powered answer engine, alternative to Perplexity AI'

export const metadata: Metadata = {
  title: {
    default: title + ' | 100% FREE AI-powered answer engine',
    template: `%s | ${title}`
  },
  description,
  icons: {
    icon: '/favicon.ico'
  },
  openGraph: {
    title,
    description
  },
  metadataBase: new URL('https://search.mindpal.io')
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('font-sans antialiased', fontSans.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AI>{children}</AI>
        </ThemeProvider>
      </body>
    </html>
  )
}
