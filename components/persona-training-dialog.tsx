"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Brain, FileText, Trash2, Plus, Download, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  downloadPersonaData,
  uploadPersonaData,
  getAllPersonaData,
  removePersonaTrainingData,
} from "@/lib/persona-training"

interface PersonaTrainingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPersonaAdded: (personaName: string) => void
  currentPersona?: string
}

interface TrainedPersona {
  name: string
  createdAt: string
  postCount: number
  characterCount: number
  isBuiltIn: boolean
}

export function PersonaTrainingDialog({
  open,
  onOpenChange,
  onPersonaAdded,
  currentPersona,
}: PersonaTrainingDialogProps) {
  const [personaName, setPersonaName] = useState("")
  const [rawContent, setRawContent] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [trainedPersonas, setTrainedPersonas] = useState<TrainedPersona[]>([])
  const { toast } = useToast()

  // Load trained personas when dialog opens
  useEffect(() => {
    if (open) {
      loadTrainedPersonas()
    }
  }, [open])

  const loadTrainedPersonas = async () => {
    const allPersonas = getAllPersonaData()
    // Filter out any personas named 'bap' or 'simon' to avoid duplicates
    const filteredPersonas = allPersonas.filter((persona) => persona.name !== "bap" && persona.name !== "simon")

    const personaDetails = filteredPersonas.map((persona) => {
      const posts = persona.rawContent
        ? persona.rawContent.split(/\n\s*---\s*\n|\n\s*===\s*\n/).filter((p: string) => p.trim().length > 50)
        : []
      return {
        name: persona.name,
        createdAt: persona.createdAt,
        postCount: posts.length,
        characterCount: persona.rawContent?.length || 0,
        isBuiltIn: persona.isBuiltIn || false,
      }
    })
    setTrainedPersonas(personaDetails)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.name.endsWith(".json")) {
        // Handle persona backup file
        uploadPersonaData(file)
          .then((persona) => {
            toast({
              title: "Persona Imported",
              description: `${persona.name} has been successfully imported`,
            })
            loadTrainedPersonas()
            onPersonaAdded(persona.name)
          })
          .catch((error) => {
            toast({
              title: "Import Failed",
              description: error.message,
              variant: "destructive",
            })
          })
      } else {
        // Handle text file
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setRawContent(content)
          toast({
            title: "File Loaded",
            description: `Loaded ${content.length} characters from ${file.name}`,
          })
        }
        reader.readAsText(file)
      }
    }
  }

  const handleTrainPersona = async () => {
    if (!personaName.trim() || !rawContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both persona name and training content",
        variant: "destructive",
      })
      return
    }

    // Prevent creating personas named 'bap' or 'simon' to avoid conflicts
    if (personaName.toLowerCase() === "bap" || personaName.toLowerCase() === "simon") {
      toast({
        title: "Reserved Name",
        description: "The names 'bap' and 'simon' are reserved. Please choose a different name.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const response = await fetch("/api/persona-training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add",
          name: personaName,
          rawContent: rawContent,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Persona Trained Successfully",
          description: `${personaName} has been trained on ${rawContent.length} characters of content`,
        })

        // Save to local storage
        const { savePersonaTrainingData } = await import("@/lib/persona-training")
        savePersonaTrainingData(personaName, rawContent)

        // Notify parent component
        onPersonaAdded(personaName)

        // Reset form and reload personas
        setPersonaName("")
        setRawContent("")
        loadTrainedPersonas()
      } else {
        throw new Error(data.error || "Training failed")
      }
    } catch (error) {
      toast({
        title: "Training Failed",
        description: error instanceof Error ? error.message : "Failed to train persona. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemovePersona = (name: string) => {
    const success = removePersonaTrainingData(name)
    if (success) {
      toast({
        title: "Persona Removed",
        description: `${name} has been removed from trained personas`,
      })
      loadTrainedPersonas()
    } else {
      toast({
        title: "Cannot Remove",
        description: "Failed to remove persona",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPersona = (name: string) => {
    downloadPersonaData(name)
    toast({
      title: "Download Started",
      description: `${name} persona backup file is downloading`,
    })
  }

  const handleDownloadAllTrainingContent = () => {
    const allPersonas = getAllPersonaData()
    const allContent = allPersonas
      .map((persona) => {
        if (!persona.rawContent) return ""
        return `=== ${persona.name.toUpperCase()} POSTS ===\n\n${persona.rawContent}\n\n`
      })
      .filter((content) => content.length > 0)
      .join("\n")

    if (allContent) {
      const blob = new Blob([allContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `all-persona-training-content-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download Started",
        description: "All training content is downloading as a text file",
      })
    } else {
      toast({
        title: "No Content",
        description: "No training content available to download",
        variant: "destructive",
      })
    }
  }

  const getContentStats = () => {
    if (!rawContent) return null

    const posts = rawContent.split(/\n\s*---\s*\n|\n\s*===\s*\n/).filter((p) => p.trim().length > 50)
    const hashtags = (rawContent.match(/#[\w]+/g) || []).length
    const questions = (rawContent.match(/\?/g) || []).length

    return { posts: posts.length, hashtags, questions }
  }

  const stats = getContentStats()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Train Custom Personas
          </DialogTitle>
          <DialogDescription>
            Upload raw text files containing examples of someone's writing style to train custom personas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Training Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Persona</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Persona Name</Label>
                  <Input
                    placeholder="e.g., John Doe, Tech Expert"
                    value={personaName}
                    onChange={(e) => setPersonaName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Note: Names 'bap' and 'simon' are reserved for built-in personas
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Upload Text File</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".txt,.md,.json"
                      onChange={handleFileUpload}
                      className="file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-primary file:text-primary-foreground"
                    />
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Training Content</Label>
                <Textarea
                  placeholder="Paste raw text content here, or upload a file above. Include multiple posts separated by --- or === lines."
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Tip: Include 10-20 posts for best results. Separate posts with --- or === on new lines.
                </p>
              </div>

              {stats && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Content Analysis</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Characters:</span>
                      <span className="ml-2 font-mono">{rawContent.length.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Posts:</span>
                      <span className="ml-2 font-mono">{stats.posts}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Hashtags:</span>
                      <span className="ml-2 font-mono">{stats.hashtags}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Questions:</span>
                      <span className="ml-2 font-mono">{stats.questions}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleTrainPersona}
                disabled={isProcessing || !personaName.trim() || !rawContent.trim()}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-pulse" />
                    Training Persona...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Train Persona
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Trained Personas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Custom Trained Personas</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{trainedPersonas.length} personas</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadAllTrainingContent}
                    className="h-8 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {trainedPersonas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No custom personas trained yet</p>
                  <p className="text-sm mt-1">Train your first persona above</p>
                  <p className="text-xs mt-2 text-muted-foreground">
                    Built-in personas (Bap & Simon) are available in the post type dropdown
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trainedPersonas.map((persona) => (
                    <div key={persona.name} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Brain className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium capitalize">{persona.name}</span>
                            {currentPersona === persona.name && (
                              <Badge variant="default" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{persona.postCount} posts</span>
                            <span>{persona.characterCount.toLocaleString()} chars</span>
                            <span>{new Date(persona.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onPersonaAdded(persona.name)
                            onOpenChange(false)
                          }}
                          disabled={currentPersona === persona.name}
                        >
                          {currentPersona === persona.name ? "Active" : "Use Persona"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPersona(persona.name)}
                          title="Download persona backup"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePersona(persona.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Important: Download Your Training Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-yellow-800 dark:text-yellow-200">
                <strong>Always download your training content for safety!</strong> Your training data is stored locally
                and will be lost if you clear browser data or switch devices.
              </p>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  💾
                </div>
                <div>
                  <p className="font-medium">Backup Strategy</p>
                  <p className="text-muted-foreground">
                    Use "Download All" to get all training content in one text file, or download individual personas as
                    JSON backups.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader>
              <CardTitle className="text-lg">How to Use</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Collect Writing Samples</p>
                  <p className="text-muted-foreground">
                    Gather 10-20 posts from the person's social media (LinkedIn, Twitter, etc.)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Format the Content</p>
                  <p className="text-muted-foreground">
                    Separate each post with --- or === on new lines in a text file
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Train & Generate</p>
                  <p className="text-muted-foreground">
                    Upload the file, train the persona, then use it in the post type selector
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
