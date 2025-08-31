"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Copy,
  Users,
  Sparkles,
  Brain,
  User,
  Plus,
  Minus,
  Shuffle,
  BookOpen,
  MessageSquare,
  Wand2,
  Save,
  FileText,
  Lightbulb,
  ChevronDown,
} from "lucide-react"
import { PersonaTrainingDialog } from "@/components/persona-training-dialog"
import { APIKeyDialog } from "@/components/api-key-dialog"
import { ModelSelector } from "@/components/model-selector"
import type { APIProvider } from "@/lib/api-key-manager"
import { ErrorState } from "@/components/error-state"
import { useToast } from "@/hooks/use-toast"

type AIProvider = "groq" | "gemini" | "openai" | "anthropic"

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

interface AuthorStats {
  author: string
  articleCount: number
  latestDate: string
  articles: RSSItem[]
}

interface SelectedPersona {
  id: string
  name: string
  type: "rss-author" | "trained-persona" | "built-in"
  weight: number
}

interface SavedContent {
  id: string
  content: string
  personas: SelectedPersona[]
  contentType: "blog" | "post"
  platform: string
  topic: string
  keywords: string
  context: string
  createdAt: string
}

interface AuthorContentGeneratorProps {
  rssItems: RSSItem[]
  aiProvider: AIProvider
  setAiProvider: (provider: AIProvider) => void
  selectedKeyId: string
  selectedModel: string
  setSelectedModel: (model: string) => void
  showAPIKeyDialog: boolean
  setShowAPIKeyDialog: (show: boolean) => void
  handleKeyAdded: (provider: string, keyId: string) => void
  aiProviders: Record<string, APIProvider>
  copyToClipboard: (text: string) => void
}

export function AuthorContentGenerator({
  rssItems,
  aiProvider,
  setAiProvider,
  selectedKeyId,
  selectedModel,
  setSelectedModel,
  showAPIKeyDialog,
  setShowAPIKeyDialog,
  handleKeyAdded,
  aiProviders,
  copyToClipboard,
}: AuthorContentGeneratorProps) {
  const [selectedPersonas, setSelectedPersonas] = useState<SelectedPersona[]>([])
  const [contentType, setContentType] = useState<"blog" | "post">("post")
  const [platform, setPlatform] = useState("linkedin")
  const [topic, setTopic] = useState("")
  const [keywords, setKeywords] = useState("")
  const [context, setContext] = useState("")
  const [generatedContent, setGeneratedContent] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [lastError, setLastError] = useState("")
  const [lastErrorDetails, setLastErrorDetails] = useState("")
  const [showPersonaTrainingDialog, setShowPersonaTrainingDialog] = useState(false)
  const [trainedPersonas, setTrainedPersonas] = useState<string[]>([])
  const [savedContents, setSavedContents] = useState<SavedContent[]>([])
  const [selectedSavedContent, setSelectedSavedContent] = useState<string | null>(null)
  const [builtInInstructions, setBuiltInInstructions] = useState<Record<string, string>>({})
  const [referenceInfo, setReferenceInfo] = useState<string>("")

  const { toast } = useToast()
  const generatedContentRef = useRef<HTMLDivElement>(null)

  // Load trained personas and built-in instructions
  useEffect(() => {
    const loadPersonas = async () => {
      const { getAllPersonaData, getBuiltInPersonaInstructions } = await import("@/lib/persona-training")
      const personas = getAllPersonaData()
      const customPersonas = personas.filter((p) => p.name !== "bap" && p.name !== "simon"  && p.name !== "rohan-sharma").map((p) => p.name)
      setTrainedPersonas(customPersonas)

      // Load built-in persona instructions
      const bapInstructions = getBuiltInPersonaInstructions("bap")
      const simonInstructions = getBuiltInPersonaInstructions("simon")
      const rohanSharmaInstructions = getBuiltInPersonaInstructions("rohan-sharma")
      setBuiltInInstructions({
        bap: bapInstructions || "",
        simon: simonInstructions || "",
        "rohan-sharma": rohanSharmaInstructions || "",
      })
    }
    loadPersonas()
  }, [showPersonaTrainingDialog])

  // Load saved contents from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("author-generated-contents")
    if (saved) {
      try {
        setSavedContents(JSON.parse(saved))
      } catch (error) {
        console.error("Error loading saved contents:", error)
      }
    }
  }, [])

  // Save contents to localStorage whenever savedContents changes
  useEffect(() => {
    localStorage.setItem("author-generated-contents", JSON.stringify(savedContents))
  }, [savedContents])

  // Get author statistics from RSS items
  const authorStats = useMemo(() => {
    const stats: Record<string, AuthorStats> = {}

    rssItems.forEach((item) => {
      if (!stats[item.author]) {
        stats[item.author] = {
          author: item.author,
          articleCount: 0,
          latestDate: item.date,
          articles: [],
        }
      }

      stats[item.author].articleCount++
      stats[item.author].articles.push(item)

      if (new Date(item.date) > new Date(stats[item.author].latestDate)) {
        stats[item.author].latestDate = item.date
      }
    })

    // Sort articles by date (newest first) and limit to last 10
    Object.values(stats).forEach((stat) => {
      stat.articles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      stat.articles = stat.articles.slice(0, 10)
    })

    return Object.values(stats).sort((a, b) => b.articleCount - a.articleCount)
  }, [rssItems])

  const platforms = [
    { id: "linkedin", name: "LinkedIn", type: "post" },
    { id: "twitter", name: "X/Twitter", type: "post" },
    { id: "discord", name: "Discord", type: "post" },
    { id: "instagram", name: "Instagram", type: "post" },
    { id: "facebook", name: "Facebook", type: "post" },
    { id: "reddit", name: "Reddit", type: "post" },
    { id: "medium", name: "Medium", type: "blog" },
    { id: "devto", name: "Dev.to", type: "blog" },
    { id: "hashnode", name: "Hashnode", type: "blog" },
  ]

  const addPersona = (persona: SelectedPersona) => {
    if (!selectedPersonas.find((p) => p.id === persona.id)) {
      setSelectedPersonas([...selectedPersonas, { ...persona, weight: 1 }])
    }
  }

  const removePersona = (id: string) => {
    setSelectedPersonas(selectedPersonas.filter((p) => p.id !== id))
  }

  const updatePersonaWeight = (id: string, weight: number) => {
    setSelectedPersonas(selectedPersonas.map((p) => (p.id === id ? { ...p, weight: Math.max(0.1, weight) } : p)))
  }

  const normalizeWeights = () => {
    const totalWeight = selectedPersonas.reduce((sum, p) => sum + p.weight, 0)
    if (totalWeight === 0) return

    setSelectedPersonas(
      selectedPersonas.map((p) => ({
        ...p,
        weight: Math.round((p.weight / totalWeight) * 100) / 100,
      })),
    )
  }

  const saveGeneratedContent = () => {
    if (!generatedContent.trim()) return

    const newContent: SavedContent = {
      id: Date.now().toString(),
      content: generatedContent,
      personas: selectedPersonas,
      contentType,
      platform,
      topic,
      keywords,
      context,
      createdAt: new Date().toISOString(),
    }

    setSavedContents((prev) => [newContent, ...prev].slice(0, 50)) // Keep last 50 contents

    toast({
      title: "Content Saved",
      description: "Generated content has been saved successfully",
    })
  }

  const loadSavedContent = (savedContent: SavedContent) => {
    setGeneratedContent(savedContent.content)
    setSelectedPersonas(savedContent.personas)
    setContentType(savedContent.contentType)
    setPlatform(savedContent.platform)
    setTopic(savedContent.topic)
    setKeywords(savedContent.keywords)
    setContext(savedContent.context)
    setSelectedSavedContent(savedContent.id)

    // Scroll to generated content
    setTimeout(() => {
      generatedContentRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 100)
  }

  const deleteSavedContent = (contentId: string) => {
    setSavedContents((prev) => prev.filter((c) => c.id !== contentId))
    if (selectedSavedContent === contentId) {
      setSelectedSavedContent(null)
    }
    toast({
      title: "Content Deleted",
      description: "Saved content has been removed",
    })
  }

  const generateMixedContent = async () => {
    if (selectedPersonas.length === 0 || !topic.trim()) return

    setAiLoading(true)
    setLastError("")
    setLastErrorDetails("")

    try {
      // Load all persona data including custom personas and built-in instructions
      const { getAllPersonaData } = await import("@/lib/persona-training")
      const allPersonaData = getAllPersonaData()

      // Add built-in persona instructions to the data
      const builtInInstructionsData = [
        {
          name: "bap-instructions",
          instructions: builtInInstructions.bap,
          isBuiltIn: true,
        },
        {
          name: "simon-instructions",
          instructions: builtInInstructions.simon,
          isBuiltIn: true,
        },
        {
          name: "rohan-sharma-instructions",
          instructions: builtInInstructions["rohan-sharma"],
          isBuiltIn: true,
        },
      ].filter((p) => p.instructions) // Only include if instructions exist

      const requestBody: any = {
        selectedPersonas,
        contentType,
        platform,
        topic: topic.trim(),
        keywords: keywords.trim(),
        context: context.trim(),
        provider: aiProvider,
        rssItems: rssItems.filter((item) =>
          selectedPersonas.some((p) => p.type === "rss-author" && p.name === item.author),
        ),
        customPersonas: [...allPersonaData, ...builtInInstructionsData],
      }

      // Add custom model and API key for custom providers
      if ((aiProvider === "openai" || aiProvider === "anthropic") && selectedKeyId) {
        const { apiKeyManager } = await import("@/lib/api-key-manager")
        const apiKey = apiKeyManager.getAPIKey(selectedKeyId)
        if (!apiKey) {
          console.error("API key not found for selectedKeyId:", selectedKeyId)
          throw new Error("API key not found")
        }
        console.log("Adding API key to request for provider:", aiProvider)
        requestBody.apiKey = apiKey
        if (selectedModel) {
          requestBody.model = selectedModel
        }
      } else if (aiProvider === "openai" || aiProvider === "anthropic") {
        console.error("No API key selected for provider:", aiProvider)
        setLastError(`${aiProvider === "openai" ? "OpenAI" : "Anthropic"} API key required`)
        setLastErrorDetails("Please configure your API key to use this provider.")
        setAiLoading(false)
        return
      }

      const response = await fetch("/api/author-generate", {
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
      setSelectedSavedContent(null) // Clear selected saved content when generating new

      // Create reference info
      const refInfo = selectedPersonas.map(persona => {
        if (persona.type === "rss-author") {
          const articles = rssItems.filter(item => item.author === persona.name)
          return `${persona.name}: Using ${Math.min(articles.length, 10)} articles`
        } else if (persona.type === "trained-persona") {
          return `${persona.name}: Using trained writing samples`
        } else if (persona.type === "built-in") {
          return `${persona.name}: Using built-in persona data`
        }
        return ""
      }).filter(Boolean).join(" • ")
      
      setReferenceInfo(refInfo)

      // Scroll to generated content after a short delay
      setTimeout(() => {
        generatedContentRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }, 100)
    } catch (error) {
      console.error("Author content generation error:", error)

      if (!lastError) {
        setLastError("AI Generation Failed")
        setLastErrorDetails("Please check your connection and try again.")
      }
    } finally {
      setAiLoading(false)
    }
  }

  const handlePersonaAdded = (personaName: string) => {
    addPersona({
      id: `trained-${personaName}`,
      name: personaName,
      type: "trained-persona",
      weight: 1,
    })
    setShowPersonaTrainingDialog(false)
  }

  return (
    <>
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Saved Contents Sidebar */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Saved Contents
            </CardTitle>
            <CardDescription>Previously generated content</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              {savedContents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground text-sm">No saved content yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedContents.map((content) => (
                    <Card
                      key={content.id}
                      className={`cursor-pointer transition-colors ${
                        selectedSavedContent === content.id ? "ring-2 ring-primary" : "hover:bg-muted/50"
                      }`}
                      onClick={() => loadSavedContent(content)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{content.topic}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {content.contentType === "blog" ? "Blog" : "Post"}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {content.platform}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteSavedContent(content.id)
                            }}
                            className="text-destructive hover:text-destructive ml-2"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {content.personas.length} persona{content.personas.length !== 1 ? "s" : ""} •{" "}
                          {new Date(content.createdAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Main Content Generator */}
        <div className="xl:col-span-3">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Author-Based Content Generator
              </CardTitle>
              <CardDescription>
                Generate content by mixing writing styles from RSS authors or trained personas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-6">
                  {/* AI Provider Selection */}
                  <Card className="p-4 bg-muted/30">
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <Label className="text-sm font-medium">AI Provider</Label>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowAPIKeyDialog(true)} className="h-9">
                            <Wand2 className="w-4 h-4 mr-2" />
                            Configure Keys
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowPersonaTrainingDialog(true)}
                            className="h-9"
                          >
                            <Brain className="w-4 h-4 mr-2" />
                            Train Personas
                          </Button>
                        </div>
                      </div>

                      {/* Current Provider Info */}
                      {aiProvider && (
                        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <div className="p-1 bg-primary/10 rounded">{aiProviders[aiProvider].icon}</div>
                            <span className="font-medium text-sm">Active: {aiProviders[aiProvider].name}</span>
                            {selectedKeyId && (
                              <Badge variant="secondary" className="text-xs">
                                Custom Key
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                            <span>Model:</span>
                            <Badge variant="outline" className="text-xs font-mono">
                              {selectedModel || aiProviders[aiProvider].model}
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Model Selector for custom providers */}
                      {(aiProvider === "openai" || aiProvider === "anthropic") && selectedKeyId && (
                        <ModelSelector
                          provider={aiProvider}
                          keyId={selectedKeyId}
                          selectedModel={selectedModel}
                          onModelChange={setSelectedModel}
                          defaultModels={aiProviders[aiProvider]?.defaultModels}
                        />
                      )}
                    </div>
                  </Card>

                  {/* Content Configuration */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Content Type</Label>
                      <Select value={contentType} onValueChange={(value: "blog" | "post") => setContentType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="post">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Social Media Post
                            </div>
                          </SelectItem>
                          <SelectItem value="blog">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Blog Article
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Target Platform</Label>
                      <Select value={platform} onValueChange={setPlatform}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {platforms
                            .filter((p) => p.type === contentType)
                            .map((platform) => (
                              <SelectItem key={platform.id} value={platform.id}>
                                {platform.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Topic, Keywords, and Context */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Topic *</Label>
                      <Input
                        placeholder="e.g., The future of web development, Building accessible apps..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Keywords (Optional)</Label>
                      <Input
                        placeholder="e.g., react, javascript, accessibility"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Context (Optional)</Label>
                      <Textarea
                        placeholder="Describe the context for your content. Is this for organized data analysis, unorganized brainstorming, technical documentation, casual discussion, etc.?"
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        className="min-h-[80px] resize-y"
                      />
                      <p className="text-xs text-muted-foreground">
                        Provide additional context about the content structure, audience, or specific requirements
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Persona Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-medium">Select Writing Styles to Mix</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={normalizeWeights}
                        disabled={selectedPersonas.length === 0}
                      >
                        <Shuffle className="w-4 h-4 mr-2" />
                        Normalize Weights
                      </Button>
                    </div>

                    {/* RSS Authors */}
                    {authorStats.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">RSS Feed Authors</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {authorStats.map((author) => (
                            <Card
                              key={author.author}
                              className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() =>
                                addPersona({
                                  id: `rss-${author.author}`,
                                  name: author.author,
                                  type: "rss-author",
                                  weight: 1,
                                })
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span className="font-medium text-sm">{author.author}</span>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {author.articleCount} articles
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Latest: {new Date(author.latestDate).toLocaleDateString()}
                              </p>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Built-in Personas */}
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-muted-foreground">Built-in Personas</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {["bap", "simon", "rohan-sharma"].map((persona) => {
                          const hasInstructions = builtInInstructions[persona]
                          return (
                            <Card
                              key={persona}
                              className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() =>
                                addPersona({
                                  id: `built-in-${persona}`,
                                  name: persona,
                                  type: "built-in",
                                  weight: 1,
                                })
                              }
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Brain className="w-4 h-4 text-primary" />
                                  <span className="font-medium text-sm capitalize">{persona} Style</span>
                                  {hasInstructions && (
                                    <Lightbulb className="w-3 h-3 text-amber-500" aria-label="Has custom instructions" />
                                  )}
                                </div>
                              </div>
                            </Card>
                          )
                        })}
                      </div>
                    </div>

                    {/* Custom Trained Personas */}
                    {trainedPersonas.length > 0 && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Custom Trained Personas</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {trainedPersonas.map((persona) => (
                            <Card
                              key={persona}
                              className="p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                              onClick={() =>
                                addPersona({
                                  id: `trained-${persona}`,
                                  name: persona,
                                  type: "trained-persona",
                                  weight: 1,
                                })
                              }
                            >
                              <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-sm capitalize">{persona} Style</span>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Selected Personas */}
                  {selectedPersonas.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-base font-medium">
                        Selected Writing Styles ({selectedPersonas.length})
                      </Label>
                      <div className="space-y-2">
                        {selectedPersonas.map((persona) => {
                          const authorArticles = persona.type === "rss-author" 
                            ? rssItems.filter(item => item.author === persona.name)
                            : []
                          
                          return (
                            <Card key={persona.id} className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {persona.type === "rss-author" && <User className="w-4 h-4" />}
                                    {persona.type === "built-in" && <Brain className="w-4 h-4 text-primary" />}
                                    {persona.type === "trained-persona" && <Brain className="w-4 h-4 text-green-600" />}
                                    <span className="font-medium text-sm capitalize">{persona.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {persona.type === "rss-author" ? "RSS Author" : "Persona"}
                                    </Badge>
                                    {persona.type === "built-in" && builtInInstructions[persona.name] && (
                                      <Lightbulb className="w-3 h-3 text-amber-500" aria-label="Has custom instructions" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updatePersonaWeight(persona.id, persona.weight - 0.1)}
                                        disabled={persona.weight <= 0.1}
                                      >
                                        <Minus className="w-3 h-3" />
                                      </Button>
                                      <span className="text-sm font-mono w-12 text-center">
                                        {(persona.weight * 100).toFixed(0)}%
                                      </span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => updatePersonaWeight(persona.id, persona.weight + 0.1)}
                                      >
                                        <Plus className="w-3 h-3" />
                                      </Button>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => removePersona(persona.id)}>
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                                {persona.type === "rss-author" && authorArticles.length > 0 && (
                                  <div className="pl-6 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <BookOpen className="w-3 h-3" />
                                      Using {Math.min(authorArticles.length, 10)} recent articles for reference
                                    </span>
                                  </div>
                                )}
                                {persona.type === "trained-persona" && (
                                  <div className="pl-6 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <FileText className="w-3 h-3" />
                                      Using trained writing samples
                                    </span>
                                  </div>
                                )}
                              </div>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reference Content Preview */}
                  {selectedPersonas.some(p => p.type === "rss-author") && (
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between p-2 h-auto">
                          <span className="text-sm font-medium flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            Reference Articles Preview
                          </span>
                          <ChevronDown className="w-4 h-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-2 space-y-3 max-h-64 overflow-y-auto">
                          {selectedPersonas
                            .filter(p => p.type === "rss-author")
                            .map(persona => {
                              const articles = rssItems
                                .filter(item => item.author === persona.name)
                                .slice(0, 5)
                              
                              if (articles.length === 0) return null
                              
                              return (
                                <div key={persona.id} className="space-y-2">
                                  <p className="text-sm font-medium text-muted-foreground">
                                    {persona.name}'s Recent Articles:
                                  </p>
                                  <div className="space-y-1 pl-4">
                                    {articles.map((article, idx) => (
                                      <div key={idx} className="text-xs">
                                        <span className="font-medium">{idx + 1}.</span> {article.title}
                                        <span className="text-muted-foreground ml-2">
                                          ({new Date(article.date).toLocaleDateString()})
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Generate Button */}
                  <Button
                    onClick={generateMixedContent}
                    disabled={aiLoading || selectedPersonas.length === 0 || !topic.trim()}
                    className="w-full"
                    size="lg"
                  >
                    {aiLoading ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating Mixed Content...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Mixed Content
                      </>
                    )}
                  </Button>

                  {/* Generated Content */}
                  {generatedContent && (
                    <Card className="p-4" ref={generatedContentRef}>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Label className="text-base font-medium">Generated Content</Label>
                            <Badge variant="secondary" className="text-xs">
                              {contentType === "blog" ? "Blog Article" : "Social Post"}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              {aiProviders[aiProvider].icon}
                              {aiProviders[aiProvider].name}
                            </Badge>
                          </div>
                          {referenceInfo && (
                            <p className="text-xs text-muted-foreground">
                              References: {referenceInfo}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={saveGeneratedContent}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Content
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => copyToClipboard(generatedContent)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Content
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={generatedContent}
                        onChange={(e) => setGeneratedContent(e.target.value)}
                        className="min-h-[400px] resize-y font-mono text-sm"
                      />
                    </Card>
                  )}

                  {/* Error State */}
                  {lastError && (
                    <ErrorState
                      title={lastError}
                      description={lastErrorDetails || "Please try again or switch to a different AI provider."}
                      onRetry={generateMixedContent}
                      onConfigure={() => setShowAPIKeyDialog(true)}
                      showConfigure={
                        lastError.includes("API key") || lastError.includes("quota") || lastError.includes("credit")
                      }
                    />
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <PersonaTrainingDialog
        open={showPersonaTrainingDialog}
        onOpenChange={setShowPersonaTrainingDialog}
        onPersonaAdded={handlePersonaAdded}
      />

      <APIKeyDialog
        open={showAPIKeyDialog}
        onOpenChange={setShowAPIKeyDialog}
        providers={Object.values(aiProviders)}
        onKeyAdded={handleKeyAdded}
      />
    </>
  )
}
