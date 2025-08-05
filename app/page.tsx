"use client"

import type React from "react"

import { useState, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Copy,
  RefreshCw,
  Rss,
  Sparkles,
  MessageSquare,
  Share2,
  Filter,
  Search,
  Calendar,
  User,
  FileText,
  X,
  Zap,
  Brain,
  Instagram,
  Facebook,
  Youtube,
  Hash,
  Camera,
  Video,
  Workflow,
  BookOpen,
  Code,
  Edit3,
  Heart,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Clock,
  Trash2,
  Music2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Analytics } from "@vercel/analytics/react"

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

interface FilterState {
  search: string
  author: string
  dateFrom: string
  dateTo: string
  selectedAuthors: string[]
}

interface RecentFeed {
  url: string
  title: string
  lastUsed: string
  articleCount: number
}

type AIProvider = "groq" | "gemini"

export default function RSSMarkdownPlatform() {
  const [rssUrl, setRssUrl] = useState("")
  const [rssItems, setRssItems] = useState<RSSItem[]>([])
  const [selectedItem, setSelectedItem] = useState<RSSItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [postType, setPostType] = useState("devrel")
  const [customPostType, setCustomPostType] = useState("")
  const [keywords, setKeywords] = useState("")
  const [aiProvider, setAiProvider] = useState<AIProvider>("groq")
  const [showFilters, setShowFilters] = useState(false)
  const [recentFeeds, setRecentFeeds] = useState<RecentFeed[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    author: "all",
    dateFrom: "",
    dateTo: "",
    selectedAuthors: [],
  })
  const { toast } = useToast()
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const [currentGenerationType, setCurrentGenerationType] = useState<string>("")
  const generatedContentRef = useRef<HTMLDivElement>(null)

  // Load recent feeds from localStorage on component mount
  useEffect(() => {
    const savedFeeds = localStorage.getItem("rss-recent-feeds")
    if (savedFeeds) {
      try {
        setRecentFeeds(JSON.parse(savedFeeds))
      } catch (error) {
        console.error("Error loading recent feeds:", error)
      }
    }
  }, [])

  // Save recent feeds to localStorage whenever recentFeeds changes
  useEffect(() => {
    localStorage.setItem("rss-recent-feeds", JSON.stringify(recentFeeds))
  }, [recentFeeds])

  // Handle clicks outside suggestions to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Get unique authors for filter dropdown
  const uniqueAuthors = useMemo(() => {
    return Array.from(new Set(rssItems.map((item) => item.author).filter(Boolean)))
  }, [rssItems])

  // Filter RSS items based on current filters
  const filteredItems = useMemo(() => {
    return rssItems.filter((item) => {
      const matchesSearch =
        !filters.search ||
        item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.content.toLowerCase().includes(filters.search.toLowerCase())

      const matchesAuthor = filters.author === "all" || !filters.author || item.author === filters.author

      const itemDate = new Date(item.date)
      const matchesDateFrom = !filters.dateFrom || itemDate >= new Date(filters.dateFrom)
      const matchesDateTo = !filters.dateTo || itemDate <= new Date(filters.dateTo)

      return matchesSearch && matchesAuthor && matchesDateFrom && matchesDateTo
    })
  }, [rssItems, filters])

  // Filter suggestions based on input
  const filteredSuggestions = useMemo(() => {
    if (!rssUrl.trim()) return recentFeeds.slice(0, 5)
    return recentFeeds
      .filter(
        (feed) =>
          feed.url.toLowerCase().includes(rssUrl.toLowerCase()) ||
          feed.title.toLowerCase().includes(rssUrl.toLowerCase()),
      )
      .slice(0, 5)
  }, [rssUrl, recentFeeds])

  const saveRecentFeed = (url: string, title: string, articleCount: number) => {
    const newFeed: RecentFeed = {
      url,
      title,
      lastUsed: new Date().toISOString(),
      articleCount,
    }

    setRecentFeeds((prev) => {
      // Remove existing entry if it exists
      const filtered = prev.filter((feed) => feed.url !== url)
      // Add new entry at the beginning and limit to 10 recent feeds
      return [newFeed, ...filtered].slice(0, 10)
    })
  }

  const removeRecentFeed = (urlToRemove: string) => {
    setRecentFeeds((prev) => prev.filter((feed) => feed.url !== urlToRemove))
  }

  const fetchRSSFeed = async (url?: string) => {
    const feedUrl = url || rssUrl
    if (!feedUrl) return

    setLoading(true)
    try {
      const response = await fetch("/api/rss-parser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: feedUrl }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setRssItems(data.items)
      setRssUrl(feedUrl)
      setShowSuggestions(false)

      // Save to recent feeds
      saveRecentFeed(feedUrl, data.feedTitle, data.items.length)

      toast({
        title: "RSS Feed Loaded",
        description: `Found ${data.items.length} articles from ${data.feedTitle}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch RSS feed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy content",
        variant: "destructive",
      })
    }
  }

  const generateAIContent = async (type: string) => {
    if (!selectedItem) return

    const finalPostType = postType === "custom" ? customPostType : postType
    setAiLoading(true)
    setCurrentGenerationType(type)

    try {
      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: selectedItem.content,
          title: selectedItem.title,
          type,
          keywords,
          postType: finalPostType,
          provider: aiProvider,
        }),
      })

      const data = await response.json()
      setGeneratedContent(data.content)

      // Scroll to generated content after a short delay to ensure it's rendered
      setTimeout(() => {
        generatedContentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI content",
        variant: "destructive",
      })
    } finally {
      setAiLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      author: "all",
      dateFrom: "",
      dateTo: "",
      selectedAuthors: [],
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRssUrl(e.target.value)
    setShowSuggestions(true)
  }

  const handleInputFocus = () => {
    if (recentFeeds.length > 0) {
      setShowSuggestions(true)
    }
  }

  const selectSuggestion = (feed: RecentFeed) => {
    setRssUrl(feed.url)
    setShowSuggestions(false)
    fetchRSSFeed(feed.url)
  }

  const aiProviders = {
    groq: {
      name: "Groq",
      icon: <Zap className="w-4 h-4" />,
      description: "Ultra-fast inference with excellent performance for creative content generation",
      model: "llama-3.3-70b-versatile",
    },
    gemini: {
      name: "Gemini",
      icon: <Brain className="w-4 h-4" />,
      description: "Google's advanced AI with strong reasoning capabilities and multimodal understanding",
      model: "gemini-2.0-flash",
    },
  }

  const contentTools = [
    { id: "summary", name: "Summary", icon: <Sparkles className="w-4 h-4" />, color: "bg-blue-500" },
    { id: "mermaid", name: "Workflow Diagram", icon: <Workflow className="w-4 h-4" />, color: "bg-purple-600" },
  ]

  const socialPlatforms = [
    { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="w-4 h-4" />, color: "bg-blue-600" },
    { id: "twitter", name: "X/Twitter", icon: <Twitter className="w-4 h-4" />, color: "bg-black" },
    { id: "instagram", name: "Instagram", icon: <Instagram className="w-4 h-4" />, color: "bg-pink-500" },
    { id: "facebook", name: "Facebook", icon: <Facebook className="w-4 h-4" />, color: "bg-blue-700" },
    { id: "reddit", name: "Reddit", icon: <MessageSquare className="w-4 h-4" />, color: "bg-orange-500" },
    { id: "youtube", name: "YouTube", icon: <Youtube className="w-4 h-4" />, color: "bg-red-600" },
    { id: "tiktok", name: "TikTok", icon: <Music2 className="w-4 h-4" />, color: "bg-black" },
  ]

  const blogPlatforms = [
    { id: "medium", name: "Medium", icon: <Edit3 className="w-4 h-4" />, color: "bg-green-600" },
    { id: "devto", name: "Dev.to", icon: <Code className="w-4 h-4" />, color: "bg-black" },
    { id: "hashnode", name: "Hashnode", icon: <Hash className="w-4 h-4" />, color: "bg-blue-500" },
  ]

  const getPlatformInfo = (type: string) => {
    const platformMap: Record<string, { name: string; icon: React.ReactNode; color: string }> = {
      summary: { name: "Summary", icon: <Sparkles className="w-3 h-3" />, color: "bg-blue-500" },
      mermaid: { name: "Workflow Diagram", icon: <Workflow className="w-3 h-3" />, color: "bg-purple-600" },
      linkedin: { name: "LinkedIn", icon: <MessageSquare className="w-3 h-3" />, color: "bg-blue-600" },
      twitter: { name: "X/Twitter", icon: <Share2 className="w-3 h-3" />, color: "bg-black" },
      instagram: { name: "Instagram", icon: <Instagram className="w-3 h-3" />, color: "bg-pink-500" },
      facebook: { name: "Facebook", icon: <Facebook className="w-3 h-3" />, color: "bg-blue-700" },
      reddit: { name: "Reddit", icon: <MessageSquare className="w-3 h-3" />, color: "bg-orange-500" },
      youtube: { name: "YouTube", icon: <Youtube className="w-3 h-3" />, color: "bg-red-600" },
      tiktok: { name: "TikTok", icon: <Video className="w-3 h-3" />, color: "bg-black" },
      medium: { name: "Medium", icon: <Edit3 className="w-3 h-3" />, color: "bg-green-600" },
      devto: { name: "Dev.to", icon: <Code className="w-3 h-3" />, color: "bg-black" },
      hashnode: { name: "Hashnode", icon: <Hash className="w-3 h-3" />, color: "bg-blue-500" },
    }

    return platformMap[type] || { name: type, icon: <FileText className="w-3 h-3" />, color: "bg-gray-500" }
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
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

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* RSS Feed Input & Articles */}
          <Card className="xl:col-span-1 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Rss className="w-5 h-5 text-primary" />
                RSS Feed
              </CardTitle>
              <CardDescription>Enter RSS feed URL to fetch all articles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* RSS URL Input with Suggestions */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        ref={inputRef}
                        placeholder="https://example.com/rss"
                        value={rssUrl}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        className="flex-1"
                      />

                      {/* Suggestions Dropdown */}
                      {showSuggestions && filteredSuggestions.length > 0 && (
                        <div
                          ref={suggestionsRef}
                          className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
                        >
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-medium text-muted-foreground">Recent Feeds</span>
                              {recentFeeds.length > 0 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => {
                                    setRecentFeeds([])
                                    setShowSuggestions(false)
                                  }}
                                >
                                  Clear All
                                </Button>
                              )}
                            </div>
                            {filteredSuggestions.map((feed, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 hover:bg-accent rounded-sm cursor-pointer group"
                                onClick={() => selectSuggestion(feed)}
                              >
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Rss className="w-3 h-3 text-primary flex-shrink-0" />
                                    <span className="text-sm font-medium truncate">{feed.title}</span>
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">{feed.url}</div>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      {feed.articleCount} articles
                                    </span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {new Date(feed.lastUsed).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeRecentFeed(feed.url)
                                  }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button onClick={() => fetchRSSFeed()} disabled={loading} size="sm">
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Fetch"}
                    </Button>
                  </div>
                </div>

                {rssItems.length > 0 && (
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {filteredItems.length} of {rssItems.length} articles
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-8 px-2">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Filters */}
              {showFilters && rssItems.length > 0 && (
                <Card className="p-4 bg-muted/50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Filters</Label>
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                        <X className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search title or content..."
                          value={filters.search}
                          onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                          className="pl-9 h-8"
                        />
                      </div>

                      <Select
                        value={filters.author}
                        onValueChange={(value) =>
                          setFilters((prev) => ({ ...prev, author: value === "all" ? "" : value }))
                        }
                      >
                        <SelectTrigger className="h-8">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <SelectValue placeholder="Filter by author" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All authors</SelectItem>
                          {uniqueAuthors.map((author) => (
                            <SelectItem key={author} value={author}>
                              {author}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">From</Label>
                          <Input
                            type="date"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">To</Label>
                          <Input
                            type="date"
                            value={filters.dateTo}
                            onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Articles List */}
              <ScrollArea className="h-[600px]">
                <div className="space-y-3 px-1">
                  {filteredItems.map((item, index) => (
                    <Card
                      key={index}
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedItem === item ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/30"
                        }`}
                      onClick={() => setSelectedItem(item)}
                    >
                      <CardContent className="p-4">
                        {item.coverImage && (
                          <div className="mb-3 rounded-lg overflow-hidden">
                            <img
                              src={item.coverImage || "/placeholder.svg"}
                              alt={item.title}
                              className="w-full h-24 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          </div>
                        )}
                        <h4 className="font-medium text-sm line-clamp-2 mb-2 text-center sm:text-left">{item.title}</h4>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(item.date).toLocaleDateString()}
                            </Badge>
                            {item.images.length > 0 && (
                              <Badge variant="outline" className="text-xs px-2 py-0">
                                <Camera className="w-3 h-3 mr-1" />
                                {item.images.length}
                              </Badge>
                            )}
                          </div>
                          <span
                            className="text-xs text-muted-foreground truncate max-w-24 text-center sm:text-right"
                            title={item.author}
                          >
                            {item.author}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredItems.length === 0 && rssItems.length > 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No articles match your filters</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Content Display */}
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
                {selectedItem && (
                  <Badge variant="secondary" className="px-3 py-1">
                    {selectedItem.author} • {new Date(selectedItem.date).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {selectedItem ? (
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
                    {/* AI Provider Selection */}
                    <ScrollArea className="h-[650px]">
                      <Card className="p-4 bg-muted/30">
                        <div className="space-y-3">
                          <Label className="text-sm font-medium">AI Provider</Label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {Object.entries(aiProviders).map(([key, provider]) => (
                              <Card
                                key={key}
                                className={`cursor-pointer transition-all p-3 ${aiProvider === key ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                                  }`}
                                onClick={() => setAiProvider(key as AIProvider)}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">{provider.icon}</div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-medium text-sm">{provider.name}</h4>
                                      <Badge variant="outline" className="text-xs">
                                        {provider.model}
                                      </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{provider.description}</p>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      </Card>

                      <Card className="p-6 bg-muted/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Post Type</Label>
                            <Select value={postType} onValueChange={setPostType}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select post type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="devrel">DevRel</SelectItem>
                                <SelectItem value="story">Story-based</SelectItem>
                                <SelectItem value="technical">Technical</SelectItem>
                                <SelectItem value="tutorial">Tutorial</SelectItem>
                                <SelectItem value="opinion">Opinion</SelectItem>
                                <SelectItem value="news">News</SelectItem>
                                <SelectItem value="custom">Custom</SelectItem>
                              </SelectContent>
                            </Select>
                            {postType === "custom" && (
                              <Input
                                placeholder="Enter custom post type..."
                                value={customPostType}
                                onChange={(e) => setCustomPostType(e.target.value)}
                                className="mt-2"
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Keywords (Optional)</Label>
                            <Input
                              placeholder="e.g., react, javascript, web dev"
                              value={keywords}
                              onChange={(e) => setKeywords(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">Separate multiple keywords with commas</p>
                          </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Content Tools */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <Label className="text-sm font-medium">Content Tools</Label>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {contentTools.map((tool) => (
                              <Button
                                key={tool.id}
                                variant="outline"
                                onClick={() => generateAIContent(tool.id)}
                                disabled={aiLoading}
                                className="flex items-center gap-2 h-auto p-4 flex-col"
                              >
                                <div className={`p-2 rounded-lg text-white ${tool.color}`}>{tool.icon}</div>
                                <span className="text-xs font-medium">{tool.name}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Social Media Platforms */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <Share2 className="w-4 h-4 text-primary" />
                            <Label className="text-sm font-medium">Social Media</Label>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {socialPlatforms.map((platform) => (
                              <Button
                                key={platform.id}
                                variant="outline"
                                onClick={() => generateAIContent(platform.id)}
                                disabled={aiLoading}
                                className="flex items-center gap-2 h-auto p-3 flex-col"
                              >
                                <div className={`p-2 rounded-lg text-white ${platform.color}`}>{platform.icon}</div>
                                <span className="text-xs font-medium">{platform.name}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Separator className="my-6" />

                        {/* Blogging Platforms */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-primary" />
                            <Label className="text-sm font-medium">Blogging Platforms</Label>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {blogPlatforms.map((platform) => (
                              <Button
                                key={platform.id}
                                variant="outline"
                                onClick={() => generateAIContent(platform.id)}
                                disabled={aiLoading}
                                className="flex items-center gap-2 h-auto p-3 flex-col"
                              >
                                <div className={`p-2 rounded-lg text-white ${platform.color}`}>{platform.icon}</div>
                                <span className="text-xs font-medium">{platform.name}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </Card>

                      {generatedContent && (
                        <Card className="p-6" ref={generatedContentRef}>
                          <div className="flex justify-between items-center mb-4">
                            <div className="flex items-center gap-2">
                              <Label className="text-lg font-medium">Generated Content</Label>
                              {currentGenerationType && (
                                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                                  <div
                                    className={`p-1 rounded text-white ${getPlatformInfo(currentGenerationType).color}`}
                                  >
                                    {getPlatformInfo(currentGenerationType).icon}
                                  </div>
                                  {getPlatformInfo(currentGenerationType).name}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {aiProviders[aiProvider].name}
                              </Badge>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedContent)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Content
                            </Button>
                          </div>
                          <Textarea
                            value={generatedContent}
                            readOnly
                            className="h-auto min-h-[400px] resize-none font-mono text-sm"
                          />
                        </Card>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 bg-white/50 backdrop-blur-sm rounded-lg">
          <div className="px-4 py-6 sm:px-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Made with love by</span>
                <span className="font-semibold text-gray-900">Rohan Sharma</span>
                <Heart className="h-4 w-4 text-red-500" />
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-gray-600 hover:text-gray-900"
                  onClick={() => window.open("https://github.com/RS-labhub", "_blank")}
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-gray-600 hover:text-gray-900"
                  onClick={() => window.open("https://www.linkedin.com/in/rohan-sharma-9386rs/", "_blank")}
                >
                  <Linkedin className="mr-2 h-4 w-4" />
                  LinkedIn
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-gray-600 hover:text-gray-900"
                  onClick={() => window.open("https://twitter.com/rrs00179", "_blank")}
                >
                  <Twitter className="mr-2 h-4 w-4" />X (Twitter)
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-gray-600 hover:text-gray-900"
                  onClick={() => window.open("https://rohan-sharma-portfolio.vercel.app", "_blank")}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Portfolio
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center">
                <p className="mt-1">
                  Must check the{" "}
                  <a
                    href="https://content-generator.vercel.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    Content Generation Platform
                  </a>
                </p>
                <p className="mt-1">© 2025 RSS to Markdown Converter.</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
    <Analytics />
    </>
  )
}
