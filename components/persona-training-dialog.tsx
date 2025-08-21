"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Brain,
  Upload,
  Download,
  Trash2,
  Plus,
  FileText,
  MessageSquare,
  BookOpen,
  AlertCircle,
  Lightbulb,
} from "lucide-react"
import {
  savePersonaTrainingDataWithType,
  getPersonaTrainingDataWithType,
  getAllPersonaData,
  removePersonaTrainingData,
  downloadPersonaData,
  uploadPersonaData,
  saveBuiltInPersonaInstructions,
  getBuiltInPersonaInstructions,
  removeBuiltInPersonaInstructions,
} from "@/lib/persona-training"
import { useToast } from "@/hooks/use-toast"

interface PersonaTrainingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPersonaAdded?: (personaName: string) => void
  currentPersona?: string
}

export function PersonaTrainingDialog({
  open,
  onOpenChange,
  onPersonaAdded,
  currentPersona,
}: PersonaTrainingDialogProps) {
  const [personaName, setPersonaName] = useState("")
  const [contentType, setContentType] = useState<"posts" | "blogs" | "mixed">("mixed")
  const [trainingContent, setTrainingContent] = useState("")
  const [instructions, setInstructions] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [existingPersonas, setExistingPersonas] = useState<any[]>([])
  const [selectedPersona, setSelectedPersona] = useState<string>("")
  const [mode, setMode] = useState<"create" | "edit" | "view">("create")
  const [isBuiltInInstructionsMode, setIsBuiltInInstructionsMode] = useState(false)

  const { toast } = useToast()

  // Load existing personas when dialog opens
  useEffect(() => {
    if (open) {
      loadExistingPersonas()
      if (currentPersona) {
        setSelectedPersona(currentPersona)
        setMode("edit")
        loadPersonaData(currentPersona)
      }
    }
  }, [open, currentPersona])

  const loadExistingPersonas = () => {
    try {
      const personas = getAllPersonaData()

      // Add built-in personas with their instructions if they exist
      const builtInPersonas = [
        {
          name: "bap",
          rawContent: "Built-in BAP persona",
          instructions: getBuiltInPersonaInstructions("bap"),
          createdAt: new Date().toISOString(),
          isBuiltIn: true,
          contentType: "mixed",
        },
        {
          name: "simon",
          rawContent: "Built-in Simon persona",
          instructions: getBuiltInPersonaInstructions("simon"),
          createdAt: new Date().toISOString(),
          isBuiltIn: true,
          contentType: "mixed",
        },
      ]

      setExistingPersonas([...builtInPersonas, ...personas])
    } catch (error) {
      console.error("Error loading personas:", error)
    }
  }

  const loadPersonaData = (name: string) => {
    try {
      // Check if it's a built-in persona
      if (name === "bap" || name === "simon") {
        setPersonaName(name)
        setTrainingContent("") // Built-in personas don't have editable training content
        setInstructions(getBuiltInPersonaInstructions(name) || "")
        setContentType("mixed")
        setIsBuiltInInstructionsMode(true)
      } else {
        const persona = getPersonaTrainingDataWithType(name)
        if (persona) {
          setPersonaName(persona.name)
          setTrainingContent(persona.rawContent)
          setInstructions(persona.instructions || "")
          setContentType(persona.contentType || "mixed")
          setIsBuiltInInstructionsMode(false)
        }
      }
    } catch (error) {
      console.error("Error loading persona data:", error)
    }
  }

  const handleSave = async () => {
    if (!personaName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a persona name.",
        variant: "destructive",
      })
      return
    }

    if (!isBuiltInInstructionsMode && !trainingContent.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide training content.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      if (isBuiltInInstructionsMode) {
        // Save instructions for built-in persona
        if (instructions.trim()) {
          saveBuiltInPersonaInstructions(personaName.trim().toLowerCase(), instructions.trim(), contentType)
        } else {
          // Remove instructions if empty
          removeBuiltInPersonaInstructions(personaName.trim().toLowerCase())
        }

        toast({
          title: "Instructions Saved",
          description: `Custom instructions for ${personaName} have been saved.`,
        })
      } else {
        // Save custom persona
        savePersonaTrainingDataWithType(
          personaName.trim().toLowerCase(),
          trainingContent.trim(),
          contentType,
          instructions.trim() || undefined,
        )

        toast({
          title: "Persona Saved",
          description: `${personaName} persona has been saved successfully.`,
        })
      }

      if (onPersonaAdded) {
        onPersonaAdded(personaName.trim().toLowerCase())
      }

      // Reset form
      setPersonaName("")
      setTrainingContent("")
      setInstructions("")
      setContentType("mixed")
      setMode("create")
      setIsBuiltInInstructionsMode(false)
      loadExistingPersonas()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (name: string) => {
    try {
      removePersonaTrainingData(name)
      toast({
        title: "Persona Deleted",
        description: `${name} persona has been deleted.`,
      })
      loadExistingPersonas()
      if (selectedPersona === name) {
        setSelectedPersona("")
        setPersonaName("")
        setTrainingContent("")
        setInstructions("")
        setMode("create")
        setIsBuiltInInstructionsMode(false)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete persona.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = (name: string) => {
    try {
      downloadPersonaData(name)
      toast({
        title: "Download Started",
        description: `${name} persona backup is being downloaded.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download persona data.",
        variant: "destructive",
      })
    }
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const persona = await uploadPersonaData(file)
      toast({
        title: "Persona Imported",
        description: `${persona.name} persona has been imported successfully.`,
      })
      loadExistingPersonas()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import persona data.",
        variant: "destructive",
      })
    }

    // Reset file input
    event.target.value = ""
  }

  const resetForm = () => {
    setPersonaName("")
    setTrainingContent("")
    setInstructions("")
    setContentType("mixed")
    setSelectedPersona("")
    setMode("create")
    setIsBuiltInInstructionsMode(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Persona Training Manager
          </DialogTitle>
          <DialogDescription>
            Train AI personas with writing samples to generate content in specific styles. You can create personas for
            different content types (posts vs blogs) or mixed content.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            {/* Existing Personas Sidebar */}
            <div className="lg:col-span-1 h-full">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <CardTitle className="text-base">Existing Personas</CardTitle>
                  <CardDescription className="text-sm">Manage your trained personas</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                  <ScrollArea className="h-full px-4">
                    <div className="space-y-2 pb-4">
                      {existingPersonas.length === 0 ? (
                        <div className="text-center text-muted-foreground py-8">
                          <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No personas created yet</p>
                        </div>
                      ) : (
                        existingPersonas.map((persona) => (
                          <Card
                            key={persona.name}
                            className={`p-3 cursor-pointer transition-colors ${
                              selectedPersona === persona.name
                                ? "ring-2 ring-primary bg-primary/5"
                                : "hover:bg-muted/50"
                            }`}
                            onClick={() => {
                              setSelectedPersona(persona.name)
                              loadPersonaData(persona.name)
                              setMode("edit")
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm capitalize">{persona.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {persona.contentType || "mixed"}
                                  </Badge>
                                  {persona.instructions && (
                                    <Lightbulb className="w-3 h-3 text-amber-500" aria-label="Has custom instructions" />
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  Created: {new Date(persona.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-muted-foreground">{persona.rawContent.length} characters</p>
                                {persona.instructions && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    Instructions: {persona.instructions.substring(0, 50)}...
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDownload(persona.name)
                                  }}
                                  className="h-6 w-6 p-0"
                                >
                                  <Download className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(persona.name)
                                  }}
                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Training Form */}
            <div className="lg:col-span-2 h-full" style={{ overflowY: "auto" }}>
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {mode === "create" ? "Create New Persona" : `Edit ${personaName}`}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {mode === "create"
                          ? "Add writing samples to train a new persona"
                          : "Modify the selected persona's training data"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={resetForm}>
                        <Plus className="w-4 h-4 mr-2" />
                        New
                      </Button>
                      <div className="relative">
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Import
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col space-y-4 overflow-y">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-shrink-0">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Persona Name</Label>
                      <Input
                        placeholder="e.g., tech-blogger, casual-writer"
                        value={personaName}
                        onChange={(e) => setPersonaName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Content Type</Label>
                      <Select
                        value={contentType}
                        onValueChange={(value: "posts" | "blogs" | "mixed") => setContentType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mixed">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              Mixed (Posts & Blogs)
                            </div>
                          </SelectItem>
                          <SelectItem value="posts">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Social Media Posts
                            </div>
                          </SelectItem>
                          <SelectItem value="blogs">
                            <div className="flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Blog Articles
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Custom Instructions */}
                  <div className="space-y-2 flex-shrink-0">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Custom Instructions (Optional)
                    </Label>
                    <Textarea
                      placeholder="Provide specific instructions on how you want the AI to write. For example: 'Write in a conversational tone, use emojis sparingly, focus on actionable tips, keep sentences short and punchy...'"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                    <p className="text-xs text-muted-foreground">
                      These instructions will guide the AI on your preferred writing style and approach.
                    </p>
                  </div>

                  {!isBuiltInInstructionsMode && (
                    <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
                      <Label className="text-sm font-medium">Training Content</Label>
                      <Textarea
                        placeholder="Paste writing samples here. Include multiple examples separated by --- or === to help the AI learn the writing style..."
                        value={trainingContent}
                        onChange={(e) => setTrainingContent(e.target.value)}
                        className="flex-1 font-mono text-sm resize-none"
                      />
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-shrink-0">
                        <AlertCircle className="w-5 h-5" />
                        <span>
                          Include 3-5 writing samples. Separate different pieces with "---" or "===". More samples =
                          better style learning.
                        </span>
                      </div>
                    </div>
                  )}

                  {isBuiltInInstructionsMode && (
                    <div className="space-y-2 flex-shrink-0">
                      <Label className="text-sm font-medium">Built-in Persona</Label>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          This is a built-in persona with pre-trained writing samples. You can only add custom
                          instructions to modify how it writes.
                        </p>
                      </div>
                    </div>
                  )}

                  <Separator className="flex-shrink-0" />

                  <div className="flex justify-between items-center flex-shrink-0">
                    <div className="text-sm text-muted-foreground">
                      {trainingContent.length} characters • {trainingContent.split(/---+|===+/).length} samples detected
                      {instructions && ` • Custom instructions added`}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={
                          isLoading ||
                          (!isBuiltInInstructionsMode && !personaName.trim()) ||
                          (!isBuiltInInstructionsMode && !trainingContent.trim())
                        }
                      >
                        {isLoading ? "Saving..." : mode === "create" ? "Create Persona" : "Update Persona"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
