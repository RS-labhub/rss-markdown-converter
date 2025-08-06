"use client"

import { Rss } from 'lucide-react'

export function Header() {
  return (
    <div className="mb-8 text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className="p-3 bg-primary/10 rounded-full">
          <Rss className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
          RSS to Markdown Converter
        </h1>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        Transform RSS feeds into clean markdown and repurpose content with AI-powered tools for multiple platforms
      </p>
    </div>
  )
}
