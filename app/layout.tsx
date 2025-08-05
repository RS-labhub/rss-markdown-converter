import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "RSS to Markdown Converter",
  description: "Convert RSS feeds to clean markdown with AI-powered content transformation",
  generator: 'Rohan Sharma',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'RSS to Markdown Converter',
    siteName: 'rss-to-markdown',
    url: 'https://rss-markdown-converter.vercel.app/',
    description:
      'Convert RSS feeds to clean markdown with AI-powered content transformation',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RSS to Markdown Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RSS to Markdown Converter',
    description:
      'Convert RSS feeds to clean markdown with AI-powered content transformation',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
