"use client"

import { Dispatch, SetStateAction, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Copy,
  Key,
  Sparkles,
  Share2,
  BookOpen,
  MessageSquare,
  Instagram,
  Facebook,
  Youtube,
  Hash,
  Workflow,
  Edit3,
  Code,
  Music2,
  Linkedin,
  Twitter,
  Brain,
  ExternalLink,
  Link,
  MessageCircle,
  Image
} from "lucide-react"
import { APIKeyDialog } from "@/components/api-key-dialog"
import { PersonaTrainingDialog } from "@/components/persona-training-dialog"
import { ModelSelector } from "@/components/model-selector"
import { ImageGenerationDialog } from "@/components/image-generation-dialog"
import type { APIProvider } from "@/lib/api-key-manager"
import type React from "react"
import { ErrorState } from "@/components/error-state"

type AIProvider = "groq" | "gemini" | "openai" | "anthropic" | "huggingface"

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

interface AIToolsSectionProps {
  postType: string
  setPostType: (type: string) => void
  customPostType: string
  setCustomPostType: (type: string) => void
  keywords: string
  setKeywords: (keywords: string) => void
  aiProvider: AIProvider
  setAiProvider: Dispatch<SetStateAction<AIProvider>>
  selectedKeyId: string
  selectedModel: string
  setSelectedModel: (model: string) => void
  showAPIKeyDialog: boolean
  setShowAPIKeyDialog: (show: boolean) => void
  generateAIContent: (type: string) => void
  aiLoading: boolean
  generatedContent: string
  setGeneratedContent: (content: string) => void
  currentGenerationType: string
  copyToClipboard: (text: string) => void
  handleKeyAdded: (provider: string, keyId: string) => void
  aiProviders: Record<string, APIProvider>
  generatedContentRef: React.RefObject<HTMLDivElement>
  lastError?: string
  lastErrorDetails?: string
  onRetryGeneration?: () => void
  selectedItem?: RSSItem | null
  generateComments?: (personaName?: string) => void
  generatedComments?: string[]
  commentLoading?: boolean
}

export function AIToolsSection({
  postType,
  setPostType,
  customPostType,
  setCustomPostType,
  keywords,
  setKeywords,
  aiProvider,
  setAiProvider,
  selectedKeyId,
  selectedModel,
  setSelectedModel,
  showAPIKeyDialog,
  setShowAPIKeyDialog,
  generateAIContent,
  aiLoading,
  generatedContent,
  setGeneratedContent,
  currentGenerationType,
  copyToClipboard,
  handleKeyAdded,
  aiProviders,
  generatedContentRef,
  lastError,
  lastErrorDetails,
  onRetryGeneration,
  selectedItem,
  generateComments,
  generatedComments = [],
  commentLoading = false,
}: AIToolsSectionProps) {
  const [showPersonaTrainingDialog, setShowPersonaTrainingDialog] = useState(false)
  const [trainedPersonas, setTrainedPersonas] = useState<string[]>([])
  const [showImageGenerationDialog, setShowImageGenerationDialog] = useState(false)

  useEffect(() => {
    const loadPersonas = async () => {
      const { getAllPersonaData } = await import("@/lib/persona-training")
      const personas = getAllPersonaData()
      // Filter out bap, simon, and rohan sharma from custom personas list
      const customPersonas = personas.filter((p) => p.name !== "bap" && p.name !== "simon" && p.name !== "rohan-sharma").map((p) => p.name)
      setTrainedPersonas(customPersonas)
    }
    loadPersonas()
  }, [showPersonaTrainingDialog]) // Reload when dialog closes

  const contentTools = [
    { id: "summary", name: "Summary", icon: <Sparkles className="w-4 h-4" />, color: "bg-blue-500" },
    { id: "mermaid", name: "Workflow Diagram", icon: <Workflow className="w-4 h-4" />, color: "bg-purple-600" },
    { id: "image", name: "AI Image", icon: <Image className="w-4 h-4" />, color: "bg-green-600" },
  ]

  const socialPlatforms = [
    { id: "linkedin", name: "LinkedIn", icon: <Linkedin className="w-4 h-4" />, color: "bg-blue-600" },
    { id: "twitter", name: "X/Twitter", icon: <Twitter className="w-4 h-4" />, color: "bg-black" },
    { id: "discord", name: "Discord", icon: <MessageCircle className="w-4 h-4" />, color: "bg-blue-400" },
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
      image: { name: "AI Image", icon: <Image className="w-3 h-3" />, color: "bg-green-600" },
      linkedin: { name: "LinkedIn", icon: <MessageSquare className="w-3 h-3" />, color: "bg-blue-600" },
      twitter: { name: "X/Twitter", icon: <Share2 className="w-3 h-3" />, color: "bg-black" },
      instagram: { name: "Instagram", icon: <Instagram className="w-3 h-3" />, color: "bg-pink-500" },
      facebook: { name: "Facebook", icon: <Facebook className="w-3 h-3" />, color: "bg-blue-700" },
      reddit: { name: "Reddit", icon: <MessageSquare className="w-3 h-3" />, color: "bg-orange-500" },
      youtube: { name: "YouTube", icon: <Youtube className="w-3 h-3" />, color: "bg-red-600" },
      tiktok: { name: "TikTok", icon: <Music2 className="w-3 h-3" />, color: "bg-black" },
      medium: { name: "Medium", icon: <Edit3 className="w-3 h-3" />, color: "bg-green-600" },
      devto: { name: "Dev.to", icon: <Code className="w-3 h-3" />, color: "bg-black" },
      hashnode: { name: "Hashnode", icon: <Hash className="w-3 h-3" />, color: "bg-blue-500" },
    }

    return platformMap[type] || { name: type, icon: <Sparkles className="w-3 h-3" />, color: "bg-gray-500" }
  }

  const handlePersonaAdded = (personaName: string) => {
    setPostType(personaName.toLowerCase())
    setShowPersonaTrainingDialog(false)
  }

  // Check if current postType is a trained persona (including bap/simon)
  const isTrainedPersona = (type: string) => {
    return type === "bap" || type === "simon" || type === "rohan-sharma" || trainedPersonas.includes(type)
  }

  return (
    <>
      {/* Make scroll constrained only on md+ for better mobile UX */}
      <ScrollArea className="md:h-[650px] h-auto">
        <div className="space-y-4">
          {/* AI Provider Selection */}
          <Card className="p-4 bg-muted/30">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <Label className="text-sm font-medium">AI Provider</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAPIKeyDialog(true)} className="h-9">
                    <Key className="w-4 h-4 mr-2" />
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

              {/* Current Provider & Model Info */}
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

                  {/* Show current model */}
                  <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                    <span>Model:</span>
                    <Badge variant="outline" className="text-xs font-mono">
                      {selectedModel || aiProviders[aiProvider].model}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(aiProviders).map(([key, provider]) => (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all p-3 ${
                      aiProvider === key ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      if (provider.requiresKey) {
                        setShowAPIKeyDialog(true)
                      } else {
                        setAiProvider(key as AIProvider)
                        // reset custom selection if switching to keyless provider
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore - these setters exist in parent
                        if (typeof (setSelectedModel as any) === "function") setSelectedModel("")
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">{provider.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{provider.name}</h4>
                          <Badge variant="outline" className="text-xs">
                            {provider.model}
                          </Badge>
                          {provider.requiresKey && (
                            <Badge variant="secondary" className="text-xs">
                              <Key className="w-3 h-3 mr-1" />
                              API Key
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{provider.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

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

          {/* Config Panel */}
          <Card className="p-4 md:p-6 bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 md:mb-6">
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

                    {/* Built-in Personas */}
                    <SelectItem value="builtInPersona" disabled>
                      — Built-in Personas —
                    </SelectItem>
                    <SelectItem value="bap">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Bap Style
                      </div>
                    </SelectItem>
                    <SelectItem value="simon">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Simon Style
                      </div>
                    </SelectItem>
                    <SelectItem value="rohan-sharma">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Rohan Sharma Style
                      </div>
                    </SelectItem>

                    {/* Custom Trained Personas */}
                    {trainedPersonas.length > 0 && (
                      <>
                        <SelectItem value="customPersona" disabled>
                          — Custom Personas —
                        </SelectItem>
                        {trainedPersonas.map((persona) => (
                          <SelectItem key={persona} value={persona}>
                            <div className="flex items-center gap-2">
                              <Brain className="w-4 h-4" />
                              {persona.charAt(0).toUpperCase() + persona.slice(1)} Style
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}

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

            <Separator className="my-4 md:my-6" />

            {/* Content Tools */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <Label className="text-sm font-medium">Content Tools</Label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {contentTools.map((tool) => (
                  <Button
                    key={tool.id}
                    variant="outline"
                    onClick={() => {
                      if (tool.id === "image") {
                        setShowImageGenerationDialog(true)
                      } else {
                        generateAIContent(tool.id)
                      }
                    }}
                    disabled={aiLoading}
                    className="flex items-center gap-2 h-auto p-3 sm:p-4 flex-col"
                  >
                    <div className={`p-2 rounded-lg text-white ${tool.color}`}>{tool.icon}</div>
                    <span className="text-xs font-medium">{tool.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="my-4 md:my-6" />

            {/* Social Media Platforms */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-primary" />
                <Label className="text-sm font-medium">Social Media</Label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
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

            <Separator className="my-4 md:my-6" />

            {/* Comment Generation */}
            {selectedItem && (
              <>
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-medium">Comment Generation</Label>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Generate 5-10 engaging comments for the selected article using your chosen persona style.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {/* General Comments */}
                      <Button
                        variant="outline"
                        onClick={() => generateComments?.()}
                        disabled={commentLoading || !selectedItem}
                        className="flex items-center gap-2 h-auto p-3 flex-col"
                      >
                        <div className="p-2 rounded-lg text-white bg-primary">
                          <MessageCircle className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-medium">General Style</span>
                      </Button>

                      {/* Persona-based Comments */}
                      {isTrainedPersona(postType) && (
                        <Button
                          variant="outline"
                          onClick={() => generateComments?.(postType)}
                          disabled={commentLoading || !selectedItem}
                          className="flex items-center gap-2 h-auto p-3 flex-col border-primary/50"
                        >
                          <div className="p-2 rounded-lg text-white bg-primary">
                            <Brain className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-medium">
                            {postType.charAt(0).toUpperCase() + postType.slice(1)} Style
                          </span>
                        </Button>
                      )}

                      {/* Show available personas */}
                      {["bap", "simon", "rohan-sharma"].filter(p => p !== postType).map((persona) => (
                        <Button
                          key={persona}
                          variant="outline"
                          onClick={() => generateComments?.(persona)}
                          disabled={commentLoading || !selectedItem}
                          className="flex items-center gap-2 h-auto p-3 flex-col"
                        >
                          <div className="p-2 rounded-lg text-white bg-blue-600">
                            <Brain className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-medium">
                            {persona.charAt(0).toUpperCase() + persona.slice(1)} Style
                          </span>
                        </Button>
                      ))}
                    </div>

                    {/* Generated Comments Display */}
                    {generatedComments.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Generated Comments ({generatedComments.length})</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(generatedComments.join('\n\n'))}
                            className="h-8"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy All
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {generatedComments.map((comment, index) => (
                            <div key={index} className="p-3 bg-muted/50 rounded-lg border">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm flex-1">{comment}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(comment)}
                                  className="h-8 w-8 p-0 flex-shrink-0"
                                >
                                  <Copy className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {commentLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        Generating comments...
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-4 md:my-6" />
              </>
            )}

            {/* Blogging Platforms */}
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <Label className="text-sm font-medium">Blogging Platforms</Label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
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

          {/* Article Link Section - Show above generated content */}
          {selectedItem && (
            <Card className="p-4 md:p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Link className="w-5 h-5 text-blue-600" />
                  <Label className="text-base font-medium text-blue-900 dark:text-blue-100">Source Article</Label>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(selectedItem.link)}
                  className="w-full sm:w-auto border-blue-200 hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900/50"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
              </div>
              <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                <div className="flex items-start gap-3">
                  <ExternalLink className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
                      {selectedItem.title}
                    </p>
                    <a
                      href={selectedItem.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 break-all hover:underline"
                    >
                      {selectedItem.link}
                    </a>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>By {selectedItem.author}</span>
                      <span>{new Date(selectedItem.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Generated Content */}
          {generatedContent && (
            <Card className="p-4 md:p-6" ref={generatedContentRef}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Label className="text-base sm:text-lg font-medium">Generated Content</Label>
                  {currentGenerationType && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <div className={`p-1 rounded text-white ${getPlatformInfo(currentGenerationType).color}`}>
                        {getPlatformInfo(currentGenerationType).icon}
                      </div>
                      {getPlatformInfo(currentGenerationType).name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    {aiProviders[aiProvider].icon}
                    {aiProviders[aiProvider].name}
                  </Badge>
                  {(selectedModel || aiProviders[aiProvider].model) && (
                    <Badge variant="outline" className="text-xs font-mono">
                      {selectedModel || aiProviders[aiProvider].model}
                    </Badge>
                  )}
                  {isTrainedPersona(postType) && (
                    <Badge variant="secondary" className="text-xs flex items-center gap-1">
                      <Brain className="w-3 h-3" />
                      {postType.charAt(0).toUpperCase() + postType.slice(1)} Style
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedContent)}
                  className="w-full sm:w-auto"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Content
                </Button>
              </div>
              {/* Smaller font and responsive min-height on mobile for better fit */}
              <Textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                className="h-auto min-h-48 sm:min-h-60 md:min-h-[400px] resize-y font-mono text-xs sm:text-sm"
              />
            </Card>
          )}

          {/* Error State */}
          {lastError && (
            <ErrorState
              title={lastError}
              description={lastErrorDetails || "Please try again or switch to a different AI provider."}
              onRetry={onRetryGeneration}
              onConfigure={() => setShowAPIKeyDialog(true)}
              showConfigure={
                lastError.includes("API key") || lastError.includes("quota") || lastError.includes("credit")
              }
            />
          )}
        </div>
      </ScrollArea>

      <APIKeyDialog
        open={showAPIKeyDialog}
        onOpenChange={setShowAPIKeyDialog}
        providers={Object.values(aiProviders)}
        onKeyAdded={handleKeyAdded}
      />

      <PersonaTrainingDialog
        open={showPersonaTrainingDialog}
        onOpenChange={setShowPersonaTrainingDialog}
        onPersonaAdded={handlePersonaAdded}
        currentPersona={isTrainedPersona(postType) ? postType : undefined}
      />

      <ImageGenerationDialog
        open={showImageGenerationDialog}
        onClose={() => setShowImageGenerationDialog(false)}
        selectedItem={selectedItem}
        aiProvider={aiProvider}
        selectedKeyId={selectedKeyId}
      />
    </>
  )
}
