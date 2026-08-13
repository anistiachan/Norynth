import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Hermes — OS',
  description: 'Personal AI Infrastructure',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden select-none">
        {children}
      </body>
    </html>
  )
}
