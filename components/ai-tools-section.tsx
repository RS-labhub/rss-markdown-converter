"use client"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Key, Sparkles, Share2, BookOpen, Zap, Brain, MessageSquare, Instagram, Facebook, Youtube, Hash, Workflow, Edit3, Code, Music2, Linkedin, Twitter } from 'lucide-react'
import { APIKeyDialog } from "@/components/api-key-dialog"
import { ModelSelector } from "@/components/model-selector"
import { type APIProvider } from "@/lib/api-key-manager"

type AIProvider = "groq" | "gemini" | "openai" | "anthropic"

interface AIToolsSectionProps {
  postType: string
  setPostType: (type: string) => void
  customPostType: string
  setCustomPostType: (type: string) => void
  keywords: string
  setKeywords: (keywords: string) => void
  aiProvider: AIProvider
  setAiProvider: (provider: AIProvider) => void
  selectedKeyId: string
  selectedModel: string
  setSelectedModel: (model: string) => void
  showAPIKeyDialog: boolean
  setShowAPIKeyDialog: (show: boolean) => void
  generateAIContent: (type: string) => void
  aiLoading: boolean
  generatedContent: string
  currentGenerationType: string
  copyToClipboard: (text: string) => void
  handleKeyAdded: (provider: string, keyId: string) => void
  aiProviders: Record<string, APIProvider>
  generatedContentRef: React.RefObject<HTMLDivElement | null>;
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
  currentGenerationType,
  copyToClipboard,
  handleKeyAdded,
  aiProviders,
  generatedContentRef,
}: AIToolsSectionProps) {
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
      tiktok: { name: "TikTok", icon: <Music2 className="w-3 h-3" />, color: "bg-black" },
      medium: { name: "Medium", icon: <Edit3 className="w-3 h-3" />, color: "bg-green-600" },
      devto: { name: "Dev.to", icon: <Code className="w-3 h-3" />, color: "bg-black" },
      hashnode: { name: "Hashnode", icon: <Hash className="w-3 h-3" />, color: "bg-blue-500" },
    }

    return platformMap[type] || { name: type, icon: <Sparkles className="w-3 h-3" />, color: "bg-gray-500" }
  }

  return (
    <>
      <ScrollArea className="h-[650px]">
        {/* AI Provider Selection */}
        <Card className="p-4 bg-muted/30">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">AI Provider</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAPIKeyDialog(true)}
                className="h-8 px-3"
              >
                <Key className="w-4 h-4 mr-2" />
                Configure Keys
              </Button>
            </div>
            
            {/* Current Provider & Model Info */}
            {aiProvider && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-primary/10 rounded">
                    {aiProviders[aiProvider].icon}
                  </div>
                  <span className="font-medium text-sm">
                    Active: {aiProviders[aiProvider].name}
                  </span>
                  {selectedKeyId && (
                    <Badge variant="secondary" className="text-xs">
                      Custom Key
                    </Badge>
                  )}
                </div>
                
                {/* Show current model */}
                <div className="text-xs text-muted-foreground">
                  {selectedModel ? (
                    <span className="flex items-center gap-1">
                      <span>Model:</span>
                      <Badge variant="outline" className="text-xs font-mono">
                        {selectedModel}
                      </Badge>
                    </span>
                  ) : (
                    <span>Model: {aiProviders[aiProvider].model}</span>
                  )}
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
                      setSelectedModel("")
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">{provider.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
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
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  {aiProviders[aiProvider].icon}
                  {aiProviders[aiProvider].name}
                </Badge>
                {selectedModel && (
                  <Badge variant="outline" className="text-xs font-mono">
                    {selectedModel}
                  </Badge>
                )}
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

      <APIKeyDialog
        open={showAPIKeyDialog}
        onOpenChange={setShowAPIKeyDialog}
        providers={Object.values(aiProviders)}
        onKeyAdded={handleKeyAdded}
      />
    </>
  )
}
