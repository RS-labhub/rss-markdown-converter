"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { Analytics } from "@vercel/analytics/react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RSSFeedSection } from "@/components/rss-feed-section"
import { ContentPreview } from "@/components/content-preview"
import { AIToolsSection } from "@/components/ai-tools-section"
import { AuthorContentGenerator } from "@/components/author-content-generator"
import { apiKeyManager, type APIProvider } from "@/lib/api-key-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Brain, MessageSquare, FileText, Users, Wand2 } from "lucide-react"

interface RSSItem {
  title: string
  content: string
  author: string
  date: string
  link: string
  markdown: string
  coverImage?: string
  images: string[]
  extractedLinks?: Array<{ url: string; text: string }>
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

interface CachedFeedEntry {
  feedTitle: string
  items: RSSItem[]
  timestamp: number
  selectedItemLink?: string
}

const RSS_CACHE_KEY = "rss-feed-cache-v1"
const RSS_LAST_URL_KEY = "rss-last-feed-url"
const RSS_CACHE_TTL_MS = 1000 * 60 * 15

type AIProvider = "groq" | "gemini" | "openai" | "anthropic" | "huggingface"

export default function RSSMarkdownPlatform() {
  // RSS State
  const [rssUrl, setRssUrl] = useState("")
  const [rssItems, setRssItems] = useState<RSSItem[]>([])
  const [selectedItem, setSelectedItem] = useState<RSSItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [recentFeeds, setRecentFeeds] = useState<RecentFeed[]>([])

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    author: "all",
    dateFrom: "",
    dateTo: "",
    selectedAuthors: [],
  })
  const [showFilters, setShowFilters] = useState(false)

  // AI State
  const [aiLoading, setAiLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [postType, setPostType] = useState("devrel")
  const [customPostType, setCustomPostType] = useState("")
  const [keywords, setKeywords] = useState("")
  const [aiProvider, setAiProvider] = useState<AIProvider>("groq")
  const [selectedKeyId, setSelectedKeyId] = useState<string>("")
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false)
  const [currentGenerationType, setCurrentGenerationType] = useState<string>("")
  const [lastError, setLastError] = useState<string>("")
  const [lastErrorDetails, setLastErrorDetails] = useState<string>("")

  // New state for includeSourceLink
  const [includeSourceLink, setIncludeSourceLink] = useState(false)

  // Comment Generation State
  const [generatedComments, setGeneratedComments] = useState<string[]>([])
  const [commentLoading, setCommentLoading] = useState(false)

  const { toast } = useToast()
  const generatedContentRef = useRef<HTMLDivElement>(null!)

  const readCacheMap = (): Record<string, CachedFeedEntry> => {
    if (typeof window === "undefined") {
      return {}
    }

    try {
      const raw = localStorage.getItem(RSS_CACHE_KEY)
      if (!raw) {
        return {}
      }
      return JSON.parse(raw) as Record<string, CachedFeedEntry>
    } catch (error) {
      console.error("Error reading RSS cache:", error)
      return {}
    }
  }

  const writeCacheMap = (cache: Record<string, CachedFeedEntry>) => {
    if (typeof window === "undefined") {
      return
    }

    try {
      localStorage.setItem(RSS_CACHE_KEY, JSON.stringify(cache))
    } catch (error) {
      console.error("Error writing RSS cache:", error)
    }
  }

  const readCachedFeed = (url: string): CachedFeedEntry | null => {
    if (!url) {
      return null
    }

    const cache = readCacheMap()
    const entry = cache[url]
    if (!entry) {
      return null
    }

    if (!Array.isArray(entry.items) || typeof entry.timestamp !== "number") {
      delete cache[url]
      writeCacheMap(cache)
      return null
    }

    if (Date.now() - entry.timestamp > RSS_CACHE_TTL_MS) {
      delete cache[url]
      writeCacheMap(cache)
      return null
    }

    return entry
  }

  const persistFeedCache = (url: string, payload: CachedFeedEntry) => {
    if (!url) {
      return
    }

    const cache = readCacheMap()
    cache[url] = payload

    const cacheEntries = Object.entries(cache)
    if (cacheEntries.length > 10) {
      cacheEntries.sort(([, a], [, b]) => b.timestamp - a.timestamp)
      const pruned = Object.fromEntries(cacheEntries.slice(0, 10)) as Record<string, CachedFeedEntry>
      writeCacheMap(pruned)
      return
    }

    writeCacheMap(cache)
  }

  const deleteCachedFeed = (url: string) => {
    if (!url) {
      return
    }

    const cache = readCacheMap()
    if (!cache[url]) {
      return
    }

    delete cache[url]
    writeCacheMap(cache)
  }

  // Update selectedKeyId when provider changes
  useEffect(() => {
    if (aiProvider === "openai" || aiProvider === "anthropic") {
      const configs = apiKeyManager.getConfigs(aiProvider)
      if (configs.length > 0) {
        setSelectedKeyId(configs[0].id)
      } else {
        setSelectedKeyId("")
      }
    }
  }, [aiProvider])

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

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const lastUrl = localStorage.getItem(RSS_LAST_URL_KEY)
    if (!lastUrl) {
      return
    }

    const cached = readCachedFeed(lastUrl)
    if (!cached) {
      localStorage.removeItem(RSS_LAST_URL_KEY)
      return
    }

    setRssUrl(lastUrl)
    setRssItems(cached.items)

    const cachedSelection = cached.selectedItemLink
      ? cached.items.find((item) => item.link === cached.selectedItemLink)
      : cached.items[0] || null
    setSelectedItem(cachedSelection || null)

    setRecentFeeds((prev) => {
      const filtered = prev.filter((feed) => feed.url !== lastUrl)
      const updated: RecentFeed = {
        url: lastUrl,
        title: cached.feedTitle || lastUrl,
        lastUsed: new Date().toISOString(),
        articleCount: cached.items.length,
      }
      return [updated, ...filtered].slice(0, 10)
    })
  }, [])

  // Save recent feeds to localStorage whenever recentFeeds changes
  useEffect(() => {
    localStorage.setItem("rss-recent-feeds", JSON.stringify(recentFeeds))
  }, [recentFeeds])

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

  useEffect(() => {
    if (!rssUrl) {
      return
    }

    const cache = readCacheMap()
    const entry = cache[rssUrl]
    if (!entry) {
      return
    }

    const nextLink = selectedItem?.link
    if (entry.selectedItemLink === nextLink) {
      return
    }

    cache[rssUrl] = {
      ...entry,
      selectedItemLink: nextLink,
    }
    writeCacheMap(cache)
  }, [rssUrl, selectedItem])

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

    if (typeof window !== "undefined") {
      deleteCachedFeed(urlToRemove)
      if (localStorage.getItem(RSS_LAST_URL_KEY) === urlToRemove) {
        localStorage.removeItem(RSS_LAST_URL_KEY)
      }
    }
  }

  const fetchRSSFeed = async (url?: string) => {
    const feedUrl = url || rssUrl
    if (!feedUrl) return

    const cachedFeed = readCachedFeed(feedUrl)
    if (cachedFeed) {
      setRssItems(cachedFeed.items)
      setRssUrl(feedUrl)

      const cachedSelection = cachedFeed.selectedItemLink
        ? cachedFeed.items.find((item) => item.link === cachedFeed.selectedItemLink)
        : cachedFeed.items[0] || null
      setSelectedItem(cachedSelection || null)

      saveRecentFeed(feedUrl, cachedFeed.feedTitle || feedUrl, cachedFeed.items.length)

      if (typeof window !== "undefined") {
        localStorage.setItem(RSS_LAST_URL_KEY, feedUrl)
      }

      toast({
        title: "Using cached feed",
        description: `Loaded ${cachedFeed.items.length} article${cachedFeed.items.length === 1 ? "" : "s"} from browser cache`,
        duration: 2500,
      })

      setLoading(false)
      return
    }

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

      const nextSelected = data.items[0] || null
      setSelectedItem(nextSelected)

      const feedTitle = data.feedTitle || feedUrl

      // Save to recent feeds
      saveRecentFeed(feedUrl, feedTitle, data.items.length)

      if (typeof window !== "undefined") {
        localStorage.setItem(RSS_LAST_URL_KEY, feedUrl)
      }

      persistFeedCache(feedUrl, {
        feedTitle,
        items: data.items,
        timestamp: Date.now(),
        selectedItemLink: nextSelected?.link,
      })

      toast({
        title: "RSS Feed Loaded",
        description: `Found ${data.items.length} articles from ${feedTitle}`,
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
    setLastError("") // Clear previous errors
    setLastErrorDetails("")

    try {
      const requestBody: any = {
        content: selectedItem.content,
        title: selectedItem.title,
        link: selectedItem.link, // Include the article link
        type,
        keywords,
        postType: finalPostType,
        provider: aiProvider,
        extractedLinks: selectedItem.extractedLinks || [],
        includeSourceLink,
      }

      // Check if the selected postType is a persona and get its training data
      const standardPostTypes = ["devrel", "technical", "tutorial", "opinion", "news", "story", "custom"]
      const isPersona = finalPostType && !standardPostTypes.includes(finalPostType)
      
      if (isPersona) {
        // Import required functions at the top of the file if not already imported
        const { getPersonaTrainingDataWithType, getBuiltInPersonaInstructions } = await import("@/lib/persona-training")
        
        // Get persona training data
        const personaData = getPersonaTrainingDataWithType(finalPostType)
        if (personaData) {
          // For custom personas, include both training data and instructions
          requestBody.personaTrainingData = personaData.rawContent
          if (personaData.instructions) {
            requestBody.personaTrainingData += `\n\nCUSTOM INSTRUCTIONS:\n${personaData.instructions}`
          }
        } else {
          // Check if it's a built-in persona with custom instructions
          const builtInInstructions = getBuiltInPersonaInstructions(finalPostType)
          if (builtInInstructions) {
            requestBody.personaTrainingData = `CUSTOM INSTRUCTIONS:\n${builtInInstructions}`
          }
        }
      }

      // Add custom model and API key for custom providers
      if ((aiProvider === "openai" || aiProvider === "anthropic") && selectedKeyId) {
        const apiKey = apiKeyManager.getAPIKey(selectedKeyId)
        if (!apiKey) {
          throw new Error("API key not found")
        }
        requestBody.apiKey = apiKey
        requestBody.model = selectedModel
      }

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        setLastError(data.error || "Generation Failed")
        setLastErrorDetails(data.details || "Please try again or switch providers.")
        throw new Error(data.details || data.error || "Failed to generate content")
      }

      setGeneratedContent(data.content)

      // Scroll to generated content after a short delay to ensure it's rendered
      setTimeout(() => {
        generatedContentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    } catch (error) {
      console.error("AI generation error:", error)

      if (!lastError) {
        // Only set if not already set from API response
        setLastError("AI Generation Failed")
        setLastErrorDetails("Please check your connection and try again.")
      }

      toast({
        title: lastError || "AI Generation Failed",
        description: lastErrorDetails || "Please try again or switch to a different provider.",
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setAiLoading(false)
    }
  }

  const generateComments = async (personaName?: string) => {
    if (!selectedItem) return

    setCommentLoading(true)
    setGeneratedComments([]) // Clear previous comments

    try {
      const requestBody: any = {
        title: selectedItem.title,
        content: selectedItem.content,
        link: selectedItem.link,
        provider: aiProvider,
        keywords,
        personaName: personaName || "general",
      }

      // Add custom model and API key for custom providers
      if ((aiProvider === "openai" || aiProvider === "anthropic") && selectedKeyId) {
        const apiKey = apiKeyManager.getAPIKey(selectedKeyId)
        if (!apiKey) {
          throw new Error("API key not found")
        }
        requestBody.apiKey = apiKey
        requestBody.model = selectedModel
      }

      // Check if using a custom persona and get its training data
      if (personaName && personaName !== "general") {
        const standardPersonas = ["bap", "simon", "rohan-sharma"]
        if (!standardPersonas.includes(personaName)) {
          // Import persona training functions
          const { getPersonaTrainingDataWithType } = await import("@/lib/persona-training")
          const personaData = getPersonaTrainingDataWithType(personaName)
          if (personaData) {
            requestBody.clientPersonaTrainingData = personaData.rawContent
          }
        }
      }

      const response = await fetch("/api/comment-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate comments")
      }

      setGeneratedComments(data.comments || [])

      toast({
        title: "Comments Generated!",
        description: `Generated ${data.count} comments${personaName && personaName !== "general" ? ` in ${personaName} style` : ""}.`,
        duration: 3000,
      })

    } catch (error) {
      console.error("Comment generation error:", error)
      toast({
        title: "Comment Generation Failed",
        description: error instanceof Error ? error.message : "Please try again or switch to a different provider.",
        variant: "destructive",
        duration: 6000,
      })
    } finally {
      setCommentLoading(false)
    }
  }

  const handleKeyAdded = (provider: string, keyId: string) => {
    setAiProvider(provider as AIProvider)
    setSelectedKeyId(keyId)

    // Set default model for the provider
    const providerInfo = aiProviders[provider]
    if (providerInfo?.defaultModels && providerInfo.defaultModels.length > 0) {
      setSelectedModel(providerInfo.defaultModels[0])
    }
  }

  const aiProviders: Record<string, APIProvider> = {
    groq: {
      id: "groq",
      name: "Groq",
      icon: <Zap className="w-4 h-4" />,
      description: "Ultra-fast inference with excellent performance for creative content generation",
      model: "llama-3.3-70b-versatile",
      requiresKey: false,
      keyPlaceholder: "",
      keyValidation: () => true,
    },
    gemini: {
      id: "gemini",
      name: "Gemini",
      icon: <Brain className="w-4 h-4" />,
      description: "Google's advanced AI with strong reasoning capabilities and multimodal understanding",
      model: "gemini-2.0-flash",
      requiresKey: false,
      keyPlaceholder: "",
      keyValidation: () => true,
    },
    openai: {
      id: "openai",
      name: "OpenAI",
      icon: <Brain className="w-4 h-4" />,
      description: "GPT-5 Codex (Preview) for cutting-edge coding content, plus GPT-5 and GPT-4o families",
      model: "gpt-5-codex-preview",
      requiresKey: true,
      keyPlaceholder: "sk-...",
      keyValidation: (key: string) => key.startsWith("sk-") && key.length > 20,
      defaultModels: ["gpt-5-codex-preview", "gpt-5", "gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
      supportsCustomModels: true,
    },
    anthropic: {
      id: "anthropic",
      name: "Anthropic",
      icon: <MessageSquare className="w-4 h-4" />,
      description: "Claude 3 Opus for best blog quality, Sonnet for balanced performance",
      model: "Claude 3 Opus",
      requiresKey: true,
      keyPlaceholder: "sk-ant-...",
      keyValidation: (key: string) => key.startsWith("sk-ant-") && key.length > 20,
      defaultModels: ["claude-3-opus-20240229", "claude-3-5-sonnet-20241022", "claude-opus-4-1-20250805", "claude-3-5-haiku-20241022", "claude-3-haiku-20240307"],
      supportsCustomModels: true,
    },
    huggingface: {
      id: "huggingface",
      name: "Hugging Face",
      icon: <Wand2 className="w-4 h-4" />,
      description: "Access open-source models for image generation including FLUX, SDXL, and Stable Diffusion",
      model: "FLUX.1 Schnell",
      requiresKey: true,
      keyPlaceholder: "hf_...",
      keyValidation: (key: string) => key.startsWith("hf_") && key.length > 20,
      defaultModels: [
        "black-forest-labs/FLUX.1-schnell",
        "stabilityai/stable-diffusion-xl-base-1.0",
      ],
      supportsCustomModels: true,
    },
  }

  const retryGeneration = () => {
    if (currentGenerationType) {
      generateAIContent(currentGenerationType)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto p-6 max-w-7xl">
          <Header />

          <Tabs defaultValue="content-tools" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="content-tools" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Content Tools
              </TabsTrigger>
              <TabsTrigger value="author-generator" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Author-Based Generator
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content-tools">
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <RSSFeedSection
                  rssUrl={rssUrl}
                  setRssUrl={setRssUrl}
                  rssItems={rssItems}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  loading={loading}
                  filters={filters}
                  setFilters={setFilters}
                  showFilters={showFilters}
                  setShowFilters={setShowFilters}
                  recentFeeds={recentFeeds}
                  removeRecentFeed={removeRecentFeed}
                  fetchRSSFeed={fetchRSSFeed}
                  filteredItems={filteredItems}
                  uniqueAuthors={uniqueAuthors}
                />

                <ContentPreview selectedItem={selectedItem} rssItems={rssItems} copyToClipboard={copyToClipboard}>
                  <AIToolsSection
                    postType={postType}
                    setPostType={setPostType}
                    customPostType={customPostType}
                    setCustomPostType={setCustomPostType}
                    keywords={keywords}
                    setKeywords={setKeywords}
                    aiProvider={aiProvider}
                    setAiProvider={setAiProvider}
                    selectedKeyId={selectedKeyId}
                    selectedModel={selectedModel}
                    setSelectedModel={setSelectedModel}
                    showAPIKeyDialog={showAPIKeyDialog}
                    setShowAPIKeyDialog={setShowAPIKeyDialog}
                    generateAIContent={generateAIContent}
                    aiLoading={aiLoading}
                    generatedContent={generatedContent}
                    setGeneratedContent={setGeneratedContent}
                    currentGenerationType={currentGenerationType}
                    copyToClipboard={copyToClipboard}
                    handleKeyAdded={handleKeyAdded}
                    aiProviders={aiProviders}
                    generatedContentRef={generatedContentRef}
                    lastError={lastError}
                    lastErrorDetails={lastErrorDetails}
                    onRetryGeneration={retryGeneration}
                    selectedItem={selectedItem}
                    generateComments={generateComments}
                    generatedComments={generatedComments}
                    commentLoading={commentLoading}
                  />
                </ContentPreview>
              </div>
            </TabsContent>

            <TabsContent value="author-generator">
              <div className="grid grid-cols-1 gap-6">
                <AuthorContentGenerator
                  rssItems={rssItems}
                  aiProvider={aiProvider}
                  setAiProvider={setAiProvider}
                  selectedKeyId={selectedKeyId}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                  showAPIKeyDialog={showAPIKeyDialog}
                  setShowAPIKeyDialog={setShowAPIKeyDialog}
                  handleKeyAdded={handleKeyAdded}
                  aiProviders={aiProviders}
                  copyToClipboard={copyToClipboard}
                />
              </div>
            </TabsContent>
          </Tabs>

          <Footer />
        </div>
      </div>
      <Analytics />
    </>
  )
}
