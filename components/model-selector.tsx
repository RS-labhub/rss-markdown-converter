"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { apiKeyManager } from "@/lib/api-key-manager"

interface ModelSelectorProps {
  provider: string
  keyId?: string
  selectedModel: string
  onModelChange: (model: string) => void
  defaultModels?: string[]
}

export function ModelSelector({ 
  provider, 
  keyId, 
  selectedModel, 
  onModelChange, 
  defaultModels = [] 
}: ModelSelectorProps) {
  const [availableModels, setAvailableModels] = useState<string[]>([])

  useEffect(() => {
    if (keyId) {
      const customModels = apiKeyManager.getAPIKeyModels(keyId)
      setAvailableModels(customModels.length > 0 ? customModels : defaultModels)
    } else {
      setAvailableModels(defaultModels)
    }
  }, [keyId, defaultModels])

  if (availableModels.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">Model</Label>
        <Badge variant="secondary" className="text-xs">
          {availableModels.length} available
        </Badge>
        {selectedModel && (
          <Badge variant="outline" className="text-xs font-mono">
            Active: {selectedModel}
          </Badge>
        )}
      </div>
      <Select value={selectedModel} onValueChange={onModelChange}>
        <SelectTrigger className="font-mono">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {availableModels.map((model) => (
            <SelectItem key={model} value={model} className="font-mono">
              <div className="flex items-center justify-between w-full">
                <span>{model}</span>
                {model === selectedModel && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    Active
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedModel && (
        <p className="text-xs text-muted-foreground">
          This model will be used for all AI content generation
        </p>
      )}
    </div>
  )
}
