import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KlaroLink - Feedback Collection Platform',
  description: 'Collect and analyze customer feedback with KlaroLink',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
