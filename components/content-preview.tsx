"use client"

import React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Search, Sparkles, Copy, Calendar, User, ExternalLink } from "lucide-react"

interface RSSItem {
  title: string
  content: string
  author: string
  date: string
  link: string
  markdown: string
  coverImage?: string
  images: string[]
  category?: string
  categories?: string[]
}

interface ContentPreviewProps {
  selectedItem: RSSItem | null
  rssItems: RSSItem[]
  copyToClipboard: (text: string) => void
  children?: React.ReactElement<{ selectedItem: RSSItem | null }>
}

export function ContentPreview({ selectedItem, rssItems, copyToClipboard, children }: ContentPreviewProps) {
  if (!selectedItem) {
    return (
      <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
            {rssItems.length === 0 ? "Start by loading a feed" : "Select an article"}
          </h3>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {rssItems.length === 0
              ? "Enter an RSS feed URL on the left and click Fetch to load articles."
              : "Click any article from the list on the left to view its content here."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Tabs
      defaultValue="markdown"
      className="w-full"
      onValueChange={() => {
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "auto" })
        }
      }}
    >
      {/* Full-width sticky sub-header: tab switcher first, then title row */}
      <div className="sticky top-14 z-20 -mx-4 mb-4 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 lg:-mx-10">
        {/* Row 1: Tabs (full width segmented control) */}
        <div className="px-4 pt-2 sm:px-6 lg:px-10">
          <TabsList className="grid h-11 w-full grid-cols-3 rounded-lg bg-muted/60 p-1">
            <TabsTrigger
              value="markdown"
              className="flex h-full items-center justify-center gap-2 rounded-md text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <FileText className="h-4 w-4" />
              Markdown
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="flex h-full items-center justify-center gap-2 rounded-md text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Search className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger
              value="ai"
              className="flex h-full items-center justify-center gap-2 rounded-md text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              AI Tools
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Row 2: Title + meta + copy button */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-2 sm:px-6 lg:px-10">
          <div className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-lg font-semibold leading-snug sm:text-xl md:text-2xl">
              {selectedItem.title}
            </h2>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <User className="h-3 w-3" />
                {selectedItem.author}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(selectedItem.date).toLocaleDateString()}
              </span>
              {selectedItem.category && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
                  {selectedItem.category}
                </Badge>
              )}
              {selectedItem.link && selectedItem.link !== "#" && (
                <a
                  href={selectedItem.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Source
                </a>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(selectedItem.markdown)}
            className="h-9 gap-1.5"
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy markdown</span>
            <span className="sm:hidden">Copy</span>
          </Button>
        </div>
      </div>

      <div className="min-w-0">
        <TabsContent value="markdown" className="mt-0">
          <pre className="w-full max-w-full whitespace-pre-wrap rounded-lg border border-border/60 bg-card p-5 font-mono text-sm leading-7 text-foreground [overflow-wrap:anywhere] sm:p-6 sm:text-[15px] sm:leading-7">
            {selectedItem.markdown}
          </pre>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <div className="mx-auto w-full max-w-4xl py-6 sm:py-8">
                {/* Cover Image */}
                {selectedItem.coverImage && (
                  <div className="mb-8 text-center">
                    <img
                      src={selectedItem.coverImage || "/placeholder.svg"}
                      alt={selectedItem.title}
                      className="max-w-full h-auto rounded-lg shadow-lg mx-auto"
                      style={{ maxHeight: "400px" }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                      }}
                    />
                  </div>
                )}

                {/* Article Content */}
                <article className="prose prose-xl max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-blockquote:text-foreground prose-code:text-foreground prose-pre:text-foreground prose-ol:text-foreground prose-ul:text-foreground prose-li:text-foreground">
                  <h1 className="mb-6 text-center text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                    {selectedItem.title}
                  </h1>

                  {/* Article Meta */}
                  <div className="not-prose mb-8 flex flex-wrap items-center justify-center gap-4 border-b pb-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {selectedItem.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(selectedItem.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Render markdown content */}
                  <div
                    className="prose-img:mx-auto prose-img:rounded-lg prose-img:shadow-md prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{
                      __html: selectedItem.content
                        .replace(/<h1[^>]*>/gi, '<h1 class="text-3xl font-bold mt-10 mb-5 text-foreground sm:text-4xl">')
                        .replace(/<h2[^>]*>/gi, '<h2 class="text-2xl font-semibold mt-8 mb-4 text-foreground sm:text-3xl">')
                        .replace(/<h3[^>]*>/gi, '<h3 class="text-xl font-semibold mt-6 mb-3 text-foreground sm:text-2xl">')
                        .replace(/<h4[^>]*>/gi, '<h4 class="text-lg font-medium mt-5 mb-2 text-foreground sm:text-xl">')
                        .replace(/<h5[^>]*>/gi, '<h5 class="text-base font-medium mt-4 mb-2 text-foreground sm:text-lg">')
                        .replace(/<h6[^>]*>/gi, '<h6 class="text-base font-medium mt-3 mb-2 text-foreground">')
                        .replace(/<p[^>]*>/gi, '<p class="mb-5 text-lg leading-8 text-foreground sm:text-xl sm:leading-9">')
                        .replace(/<a /gi, '<a class="text-primary hover:text-primary/80 underline underline-offset-2" ')
                        .replace(/<strong[^>]*>/gi, '<strong class="font-semibold text-foreground">')
                        .replace(/<em[^>]*>/gi, '<em class="italic text-foreground">')
                        .replace(
                          /<blockquote[^>]*>/gi,
                          '<blockquote class="border-l-4 border-primary pl-5 italic my-6 text-lg text-foreground sm:text-xl">',
                        )
                        .replace(
                          /<code[^>]*>/gi,
                          '<code class="bg-muted px-1.5 py-0.5 rounded text-base font-mono text-foreground">',
                        )
                        .replace(/<pre[^>]*>/gi, '<pre class="bg-muted p-5 rounded-lg overflow-x-auto my-6 text-sm">')
                        .replace(/<ul[^>]*>/gi, '<ul class="list-disc pl-6 mb-5 space-y-2 text-lg leading-8 sm:text-xl sm:leading-9">')
                        .replace(/<ol[^>]*>/gi, '<ol class="list-decimal pl-6 mb-5 space-y-2 text-lg leading-8 sm:text-xl sm:leading-9">')
                        .replace(/<li[^>]*>/gi, '<li class="text-foreground">')
                        .replace(/<img /gi, '<img class="mx-auto rounded-lg shadow-md my-6 max-w-full h-auto" ')
                        // Figure and figcaption
                        .replace(/<figure[^>]*>/gi, '<figure class="my-8 text-center">')
                        .replace(/<figcaption[^>]*>/gi, '<figcaption class="mt-2 text-sm text-muted-foreground italic">')
                        // Tables
                        .replace(/<table[^>]*>/gi, '<table class="w-full border-collapse my-6 text-sm">')
                        .replace(/<thead[^>]*>/gi, '<thead class="bg-muted">')
                        .replace(/<tbody[^>]*>/gi, '<tbody>')
                        .replace(/<tr[^>]*>/gi, '<tr class="border-b border-border">')
                        .replace(/<th[^>]*>/gi, '<th class="px-4 py-2 text-left font-semibold text-foreground border border-border">')
                        .replace(/<td[^>]*>/gi, '<td class="px-4 py-2 text-foreground border border-border">'),
                    }}
                  />
                </article>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="mt-0 space-y-6">
          {/* Pass selectedItem safely to children */}
          {children && React.cloneElement(children, { selectedItem })}
        </TabsContent>
      </div>
    </Tabs>
  )
}
