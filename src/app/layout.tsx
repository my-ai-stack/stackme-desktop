import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Stackme - Memory Brain',
  description: 'Memory layer for AI applications',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}