"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Image as ImageIcon,
  Download,
  Copy,
  Loader2,
  Sparkles,
  Key,
  Info,
  AlertCircle,
  CreditCard,
  Palette,
  FileImage,
  Link,
  Wand2,
} from "lucide-react"
import { APIKeyDialog } from "@/components/api-key-dialog"
import { apiKeyManager } from "@/lib/api-key-manager"
import type { APIKeyConfig, APIProvider } from "@/lib/api-key-manager"

interface RSSItem {
  title: string
  content: string
  markdown: string
}

interface ImageGenerationDialogProps {
  open: boolean
  onClose: () => void
  selectedItem?: RSSItem | null
  aiProvider?: string
  selectedKeyId?: string
}

interface ImageProvider {
  id: string
  name: string
  requiresKey: boolean
  icon: React.ReactNode
  description: string
  models: { id: string; label: string }[]
  sizes: { id: string; label: string; width: number; height: number }[]
  defaultModel: string
}

const IMAGE_PROVIDERS: Record<string, ImageProvider> = {
  pollinations_free: {
    id: "pollinations_free",
    name: "AI Image Generator (Free)",
    requiresKey: false,
    icon: <Sparkles className="w-4 h-4" />,
    description: "Free AI-powered image generation, no API key required",
    models: [
      { id: "turbo", label: "Turbo (Fast Generation)" },
      { id: "sdxl", label: "Higher Quality (SDXL, Slower)" },
    ],
    defaultModel: "turbo",
    sizes: [
      { id: "square_small", label: "Square (512x512)", width: 512, height: 512 },
      { id: "square_medium", label: "Square (768x768)", width: 768, height: 768 },
      { id: "square_large", label: "Square (1024x1024)", width: 1024, height: 1024 },
      { id: "best_square", label: "Best Square (1536x1536)", width: 1536, height: 1536 },
      { id: "portrait", label: "Portrait (512x768)", width: 512, height: 768 },
      { id: "landscape", label: "Landscape (768x512)", width: 768, height: 512 },
      { id: "landscape_wide", label: "Wide (1024x576)", width: 1024, height: 576 },
      { id: "hd_landscape", label: "HD Landscape (1536x864)", width: 1536, height: 864 },
      { id: "dev_to_cover_image", label: "dev.to Cover Image (1000x420)", width: 1000, height: 420 },
    ],
  },
  openai: {
    id: "openai",
    name: "OpenAI DALL-E",
    requiresKey: true,
    icon: <ImageIcon className="w-4 h-4" />,
    description: "Premium image generation with DALL-E 3",
    models: [
      { id: "dall-e-3", label: "DALL-E 3 (Best Quality)" },
    ],
    defaultModel: "dall-e-3",
    sizes: [
      { id: "square_small", label: "Square (1024x1024)", width: 1024, height: 1024 },
      { id: "square_large", label: "Square HD (1024x1024)", width: 1024, height: 1024 },
      { id: "portrait", label: "Portrait (1024x1792)", width: 1024, height: 1792 },
      { id: "landscape", label: "Landscape (1792x1024)", width: 1792, height: 1024 },
      { id: "dev_to_cover_image", label: "dev.to Cover Image (1000x420)", width: 1000, height: 420 },
      { id: "highest_resolution", label: "Highest Resolution (1792x1024)", width: 1792, height: 1024 },
    ],
  },
  huggingface: {
    id: "huggingface",
    name: "Hugging Face Models",
    requiresKey: true,
    icon: <Wand2 className="w-4 h-4" />,
    description: "Open-source models including FLUX, SDXL, and Stable Diffusion",
    models: [
      { id: "black-forest-labs/FLUX.1-schnell", label: "FLUX.1 Schnell (Fast)" },
      { id: "stabilityai/stable-diffusion-xl-base-1.0", label: "SDXL Base 1.0" },
      { id: "stable-diffusion-v1-5/stable-diffusion-v1-5", label: "Stable Diffusion 1.5" },
      { id: "CompVis/stable-diffusion-v1-4", label: "Stable Diffusion 1.4" },
    ],
    defaultModel: "black-forest-labs/FLUX.1-schnell",
    sizes: [
      { id: "square", label: "Square (512x512)", width: 512, height: 512 },
      { id: "portrait", label: "Portrait (512x768)", width: 512, height: 768 },
      { id: "landscape", label: "Landscape (768x512)", width: 768, height: 512 },
      { id: "hd_square", label: "HD Square (1024x1024)", width: 1024, height: 1024 },
      { id: "best_square", label: "Best Square (1536x1536)", width: 1536, height: 1536 },
      { id: "hd_landscape", label: "HD Landscape (1536x864)", width: 1536, height: 864 },
      { id: "dev_to_cover_image", label: "dev.to Cover Image (1000x420)", width: 1000, height: 420 },
    ],
  },
}

export function ImageGenerationDialog({
  open,
  onClose,
  selectedItem,
  aiProvider,
  selectedKeyId,
}: ImageGenerationDialogProps) {
  const [provider, setProvider] = useState("pollinations_free")
  const [model, setModel] = useState("")
  const [size, setSize] = useState("")
  const [prompt, setPrompt] = useState("")
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [generatedImage, setGeneratedImage] = useState<{
    imageUrl: string
    credits: number
    model: string
    prompt: string
    provider: string
    size: string
  } | null>(null)
  const [showAPIKeyDialog, setShowAPIKeyDialog] = useState(false)
  const [apiKeys, setApiKeys] = useState<APIKeyConfig[]>([])
  const [selectedApiKeyId, setSelectedApiKeyId] = useState("")

  useEffect(() => {
    // Load API keys for providers that require them
    if (provider === "openai") {
      const keys = apiKeyManager.getConfigs("openai")
      setApiKeys(keys)
    } else if (provider === "huggingface") {
      const keys = apiKeyManager.getConfigs("huggingface")
      setApiKeys(keys)
    } else {
      setApiKeys([])
      setSelectedApiKeyId("")
    }
    // Set default values
    const currentProvider = IMAGE_PROVIDERS[provider]
    if (currentProvider) {
      setModel(currentProvider.defaultModel)
      setSize(currentProvider.sizes[0].id)
    }
    // Auto-generate prompt from selected item
    if (selectedItem && !useCustomPrompt) {
      const autoPrompt = `Professional blog cover image for \"${selectedItem.title}\". Modern tech design, clean aesthetics.`
      setPrompt(autoPrompt)
    }
  }, [provider, selectedItem, useCustomPrompt])

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider)
    const providerConfig = IMAGE_PROVIDERS[newProvider]
    if (providerConfig) {
      setModel(providerConfig.defaultModel)
      setSize(providerConfig.sizes[0].id)

      if (providerConfig.requiresKey && apiKeys.length === 0) {
        setShowAPIKeyDialog(true)
      }
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setError("")
    try {
      const currentProvider = IMAGE_PROVIDERS[provider]
      // Only require API key for OpenAI and Hugging Face
      if (currentProvider.requiresKey && !selectedApiKeyId) {
        setError(`Please select an API key for ${currentProvider.name}`)
        setLoading(false)
        return
      }
      // Get the actual API key for providers that need it
      let apiKey: string | null = null
      if (currentProvider.requiresKey && selectedApiKeyId) {
        apiKey = apiKeyManager.getAPIKey(selectedApiKeyId)
      }

      const response = await fetch("/api/image-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider,
          prompt: useCustomPrompt ? prompt : undefined,
          content: selectedItem?.content,
          title: selectedItem?.title,
          size,
          model,
          keyId: selectedApiKeyId || undefined,
          apiKey: apiKey || undefined,
        }),
      })

      // Check if response is JSON or HTML/text
      const contentType = response.headers.get("content-type") || ""
      
      if (!response.ok) {
        let errorMessage = "Failed to generate image"
        
        if (contentType.includes("application/json")) {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } else {
          // If response is HTML or plain text, it's likely an error page
          const textResponse = await response.text()
          if (textResponse.includes("<html") || textResponse.includes("<!DOCTYPE")) {
            errorMessage = "Server returned an error page instead of image data. Please check your API keys and try again."
          } else {
            errorMessage = textResponse.slice(0, 200) // Limit error message length
          }
        }
        
        throw new Error(errorMessage)
      }

      if (!contentType.includes("application/json")) {
        throw new Error("Server returned unexpected content type. Expected JSON response.")
      }

      const data = await response.json()
      
      // Validate the response data
      if (!data.imageUrl) {
        throw new Error("No image URL received from server")
      }

      if (data.imageUrl.includes("<html") || data.imageUrl.includes("<!DOCTYPE")) {
        throw new Error("Received HTML content instead of image URL. Please check your API configuration.")
      }

      setGeneratedImage(data)
    } catch (err) {
      console.error("Image generation error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to generate image"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!generatedImage || !generatedImage.imageUrl) return

    try {
      // If it's a data URL, convert to blob
      if (generatedImage.imageUrl.startsWith("data:")) {
        const response = await fetch(generatedImage.imageUrl)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `generated-image-${Date.now()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // External URL - try to fetch through proxy to avoid CORS
        try {
          const response = await fetch(generatedImage.imageUrl)
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `generated-image-${Date.now()}.png`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        } catch (corsError) {
          // If CORS fails, open in new window
          window.open(generatedImage.imageUrl, '_blank')
        }
      }
    } catch (err) {
      console.error("Download error:", err)
      setError("Failed to download image")
    }
  }

  const handleCopyUrl = () => {
    if (!generatedImage || !generatedImage.imageUrl) return
    navigator.clipboard.writeText(generatedImage.imageUrl)
  }

  const handleKeyAdded = (provider: string, keyId: string) => {
    const keys = apiKeyManager.getConfigs(provider)
    setApiKeys(keys)
    setSelectedApiKeyId(keyId)
    setShowAPIKeyDialog(false)
  }

  const currentProvider = IMAGE_PROVIDERS[provider]

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileImage className="w-5 h-5" />
              AI Image Generation
            </DialogTitle>
            <DialogDescription>
              Generate blog cover images using AI. Choose between free and premium providers.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Configuration */}
            <div className="space-y-4">
              {/* Provider Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Image Provider</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {provider === "pollinations_free" && (
                    <Alert className="mb-3">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Free AI image generation. Images are generated quickly without requiring any API keys or authentication.
                      </AlertDescription>
                    </Alert>
                  )}
                  {Object.entries(IMAGE_PROVIDERS).map(([key, providerConfig]) => (
                    <div
                      key={key}
                      className={`cursor-pointer rounded-lg border p-3 transition-all ${provider === key
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                        }`}
                      onClick={() => handleProviderChange(key)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-primary/10 rounded">
                          {providerConfig.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{providerConfig.name}</h4>
                            {!providerConfig.requiresKey && (
                              <Badge variant="secondary" className="text-xs">Free</Badge>
                            )}
                            {providerConfig.requiresKey && (
                              <Badge variant="outline" className="text-xs">
                                <Key className="w-3 h-3 mr-1" />
                                API Key
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {providerConfig.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* API Key Selection for OpenAI */}
              {currentProvider?.requiresKey && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">API Key</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {apiKeys.length > 0 ? (
                      <Select value={selectedApiKeyId} onValueChange={setSelectedApiKeyId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select API key" />
                        </SelectTrigger>
                        <SelectContent>
                          {apiKeys.map((key) => (
                            <SelectItem key={key.id} value={key.id}>
                              {key.name} ({key.keyPreview})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No API key found. Add one to use {currentProvider.name}.
                        </AlertDescription>
                      </Alert>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAPIKeyDialog(true)}
                      className="w-full"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      {apiKeys.length > 0 ? "Manage API Keys" : "Add API Key"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Model & Size Selection */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-sm">Model</Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentProvider?.models.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm">Image Size</Label>
                    <Select value={size} onValueChange={setSize}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currentProvider?.sizes.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Prompt */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Prompt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Tabs defaultValue="auto" onValueChange={(v) => setUseCustomPrompt(v === "custom")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="auto">
                        <Wand2 className="w-4 h-4 mr-2" />
                        Auto
                      </TabsTrigger>
                      <TabsTrigger value="custom">
                        <Palette className="w-4 h-4 mr-2" />
                        Custom
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="auto" className="mt-3">
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Prompt will be automatically generated from your blog content
                        </AlertDescription>
                      </Alert>
                    </TabsContent>
                    <TabsContent value="custom" className="mt-3">
                      <Textarea
                        placeholder="Describe the image you want to generate..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={4}
                      />
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Button
                onClick={handleGenerate}
                disabled={loading || (currentProvider?.requiresKey && !selectedApiKeyId)}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-base">Preview</CardTitle>
                  <CardDescription>
                    Generated images will appear here
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedImage ? (
                    <div className="space-y-4">
                      <div className="relative group">
                        <img
                          src={generatedImage.imageUrl}
                          alt="Generated image"
                          className="w-full rounded-lg shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleDownload}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          {generatedImage.imageUrl && typeof generatedImage.imageUrl === "string" && !generatedImage.imageUrl.startsWith("data:") && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={handleCopyUrl}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy URL
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Image Info */}
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Provider:</span>
                          <span className="font-medium">{generatedImage.provider}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Model:</span>
                          <span className="font-medium">{generatedImage.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span className="font-medium">{generatedImage.size}</span>
                        </div>
                        {generatedImage.credits > 0 && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Credits Used:</span>
                            <Badge variant="outline">
                              <CreditCard className="w-3 h-3 mr-1" />
                              ${generatedImage.credits.toFixed(3)}
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Prompt Used */}
                      <div>
                        <Label className="text-sm">Prompt Used:</Label>
                        <div className="mt-1 p-3 bg-muted rounded-lg text-sm">
                          {generatedImage.prompt}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          className="flex-1"
                          onClick={handleDownload}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Image
                        </Button>
                        {generatedImage.imageUrl && typeof generatedImage.imageUrl === "string" && !generatedImage.imageUrl.startsWith("data:") && (
                          <Button
                            variant="outline"
                            onClick={handleCopyUrl}
                          >
                            <Link className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                      <ImageIcon className="w-12 h-12 mb-4" />
                      <p className="text-sm">No image generated yet</p>
                      <p className="text-xs mt-1">Configure and click generate to create an image</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <APIKeyDialog
        open={showAPIKeyDialog}
        onOpenChange={setShowAPIKeyDialog}
        onKeyAdded={handleKeyAdded}
        providers={[
          {
            id: "openai",
            name: "OpenAI",
            description: "Access DALL-E image generation",
            icon: <ImageIcon className="w-4 h-4" />,
            model: "dall-e-3",
            requiresKey: true,
            keyPlaceholder: "sk-...",
            keyValidation: (key: string) => key.startsWith("sk-") && key.length > 20,
            defaultModels: ["dall-e-3"],
            supportsCustomModels: false,
          },
          {
            id: "huggingface",
            name: "Hugging Face",
            description: "Access open-source models like FLUX, SDXL, and Stable Diffusion",
            icon: <Wand2 className="w-4 h-4" />,
            model: "black-forest-labs/FLUX.1-schnell",
            requiresKey: true,
            keyPlaceholder: "hf_...",
            keyValidation: (key: string) => key.startsWith("hf_") && key.length > 20,
            defaultModels: [
              "black-forest-labs/FLUX.1-schnell",
              "stabilityai/stable-diffusion-xl-base-1.0",
              "runwayml/stable-diffusion-v1-5",
              "CompVis/stable-diffusion-v1-4"
            ],
            supportsCustomModels: true,
          },
        ]}
      />
    </>
  )
}
