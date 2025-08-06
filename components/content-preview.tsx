"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Search, Sparkles, Copy, Calendar, User } from 'lucide-react'

interface RSSItem {
  title: string
  content: string
  author: string
  date: string
  link: string
  markdown: string
  coverImage?: string
  images: string[]
}

interface ContentPreviewProps {
  selectedItem: RSSItem | null
  rssItems: RSSItem[]
  copyToClipboard: (text: string) => void
  children?: React.ReactNode // For AI Tools tab content
}

export function ContentPreview({ selectedItem, rssItems, copyToClipboard, children }: ContentPreviewProps) {
  if (!selectedItem) {
    return (
      <Card className="xl:col-span-3 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Content Preview
          </CardTitle>
          <CardDescription>Clean markdown ready for publishing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Article Selected</h3>
              <p className="text-sm">
                {rssItems.length === 0
                  ? "Enter an RSS feed URL and click 'Fetch' to get started"
                  : "Select an article from the RSS feed to view its content"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="xl:col-span-3 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Content Preview
            </CardTitle>
            <CardDescription>Clean markdown ready for publishing</CardDescription>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {selectedItem.author} • {new Date(selectedItem.date).toLocaleDateString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="markdown" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="markdown" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Markdown
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="markdown" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold line-clamp-1">{selectedItem.title}</h3>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(selectedItem.markdown)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Markdown
              </Button>
            </div>
            <Textarea
              value={selectedItem.markdown}
              readOnly
              className="min-h-[600px] font-mono text-sm resize-none"
            />
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <ScrollArea className="h-[650px] border rounded-lg">
              <div className="max-w-4xl mx-auto p-8">
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
                <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-blockquote:text-foreground prose-code:text-foreground prose-pre:text-foreground prose-ol:text-foreground prose-ul:text-foreground prose-li:text-foreground">
                  <h1 className="text-3xl font-bold mb-6 text-center text-foreground">{selectedItem.title}</h1>

                  {/* Article Meta */}
                  <div className="flex items-center justify-center gap-4 mb-8 text-sm text-muted-foreground border-b pb-4 not-prose">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {selectedItem.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
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
                        .replace(/<h1[^>]*>/gi, '<h1 class="text-2xl font-bold mt-8 mb-4 text-foreground">')
                        .replace(/<h2[^>]*>/gi, '<h2 class="text-xl font-semibold mt-6 mb-3 text-foreground">')
                        .replace(/<h3[^>]*>/gi, '<h3 class="text-lg font-medium mt-4 mb-2 text-foreground">')
                        .replace(/<h4[^>]*>/gi, '<h4 class="text-base font-medium mt-4 mb-2 text-foreground">')
                        .replace(/<h5[^>]*>/gi, '<h5 class="text-sm font-medium mt-3 mb-2 text-foreground">')
                        .replace(/<h6[^>]*>/gi, '<h6 class="text-sm font-medium mt-3 mb-2 text-foreground">')
                        .replace(/<p[^>]*>/gi, '<p class="mb-4 leading-7 text-foreground">')
                        .replace(/<a /gi, '<a class="text-primary hover:text-primary/80 underline" ')
                        .replace(/<strong[^>]*>/gi, '<strong class="font-semibold text-foreground">')
                        .replace(/<em[^>]*>/gi, '<em class="italic text-foreground">')
                        .replace(
                          /<blockquote[^>]*>/gi,
                          '<blockquote class="border-l-4 border-primary pl-4 italic my-4 text-foreground">',
                        )
                        .replace(
                          /<code[^>]*>/gi,
                          '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground">',
                        )
                        .replace(/<pre[^>]*>/gi, '<pre class="bg-muted p-4 rounded-lg overflow-x-auto my-4">')
                        .replace(/<ul[^>]*>/gi, '<ul class="list-disc list-inside mb-4 space-y-2">')
                        .replace(/<ol[^>]*>/gi, '<ol class="list-decimal list-inside mb-4 space-y-2">')
                        .replace(/<li[^>]*>/gi, '<li class="text-foreground">')
                        .replace(
                          /<img /gi,
                          '<img class="mx-auto rounded-lg shadow-md my-6 max-w-full h-auto" ',
                        ),
                    }}
                  />
                </article>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            {children}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
