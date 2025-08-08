"use client"

import { Rss } from "lucide-react"

export function Header() {
  return (
    <div className="mb-8 text-center px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-4">
        <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
          <Rss className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent leading-tight">
          RSS to Markdown Converter
        </h1>
      </div>
      <p className="text-base sm:text-lg text-muted-foreground max-w-xl sm:max-w-2xl mx-auto">
        Transform RSS feeds into clean markdown and repurpose content with AI-powered tools for multiple platforms
      </p>
    </div>
  )
}
