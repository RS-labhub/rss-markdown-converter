"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Trash2, Eye, EyeOff, Plus, Clock, Key, Settings, Edit3 } from 'lucide-react'
import { apiKeyManager, type APIKeyConfig, type APIProvider } from "@/lib/api-key-manager"
import { useToast } from "@/hooks/use-toast"

interface APIKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  providers: APIProvider[]
  onKeyAdded: (provider: string, keyId: string) => void
}

export function APIKeyDialog({ open, onOpenChange, providers, onKeyAdded }: APIKeyDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [apiKey, setApiKey] = useState("")
  const [keyName, setKeyName] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [savedKeys, setSavedKeys] = useState<APIKeyConfig[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingModels, setEditingModels] = useState<string | null>(null)
  const [customModels, setCustomModels] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      loadSavedKeys()
    }
  }, [open])

  const loadSavedKeys = () => {
    const keys = apiKeyManager.getConfigs()
    setSavedKeys(keys)
  }

  const handleAddKey = () => {
    if (!selectedProvider || !apiKey.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a provider and enter an API key",
        variant: "destructive",
      })
      return
    }

    const provider = providers.find(p => p.id === selectedProvider)
    if (!provider) return

    if (!apiKeyManager.validateKey(selectedProvider, apiKey)) {
      toast({
        title: "Invalid API Key",
        description: `Please enter a valid ${provider.name} API key`,
        variant: "destructive",
      })
      return
    }

    // Parse custom models if provided
    const models = customModels
      .split('\n')
      .map(m => m.trim())
      .filter(m => m.length > 0)

    const keyId = apiKeyManager.addAPIKey(
      selectedProvider,
      apiKey,
      keyName.trim() || `${provider.name} Key`,
      models.length > 0 ? models : provider.defaultModels
    )

    toast({
      title: "API Key Added",
      description: `${provider.name} API key has been saved securely`,
    })

    // Reset form
    setApiKey("")
    setKeyName("")
    setSelectedProvider("")
    setCustomModels("")
    setIsAdding(false)
    loadSavedKeys()

    // Notify parent component
    onKeyAdded(selectedProvider, keyId)
  }

  const handleRemoveKey = (keyId: string) => {
    apiKeyManager.removeAPIKey(keyId)
    loadSavedKeys()
    toast({
      title: "API Key Removed",
      description: "The API key has been deleted",
    })
  }

  const handleUseKey = (config: APIKeyConfig) => {
    onKeyAdded(config.provider, config.id)
    onOpenChange(false)
    toast({
      title: "API Key Selected",
      description: `Now using ${config.name}`,
    })
  }

  const handleUpdateModels = (keyId: string) => {
    const models = customModels
      .split('\n')
      .map(m => m.trim())
      .filter(m => m.length > 0)

    apiKeyManager.updateAPIKeyModels(keyId, models)
    setEditingModels(null)
    setCustomModels("")
    loadSavedKeys()
    
    toast({
      title: "Models Updated",
      description: "Custom models have been saved",
    })
  }

  const startEditingModels = (config: APIKeyConfig) => {
    setEditingModels(config.id)
    setCustomModels((config.models || []).join('\n'))
  }

  const getProviderInfo = (providerId: string) => {
    return providers.find(p => p.id === providerId)
  }

  const selectedProviderInfo = providers.find(p => p.id === selectedProvider)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Key Management
          </DialogTitle>
          <DialogDescription>
            Add and manage your API keys for different AI providers. Keys are encrypted and stored locally.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Key Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Add New API Key</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAdding(!isAdding)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {isAdding ? "Cancel" : "Add Key"}
                </Button>
              </div>
            </CardHeader>
            {isAdding && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {providers.filter(p => p.requiresKey).map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            <div className="flex items-center gap-2">
                              {provider.icon}
                              {provider.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Key Name (Optional)</Label>
                    <Input
                      placeholder="My API Key"
                      value={keyName}
                      onChange={(e) => setKeyName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>API Key</Label>
                  <div className="relative">
                    <Input
                      type={showKey ? "text" : "password"}
                      placeholder={selectedProviderInfo?.keyPlaceholder || "Enter your API key"}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {selectedProviderInfo && (
                    <p className="text-xs text-muted-foreground">
                      {selectedProviderInfo.description}
                    </p>
                  )}
                </div>

                {selectedProviderInfo?.supportsCustomModels && (
                  <div className="space-y-2">
                    <Label>Custom Models (Optional)</Label>
                    <Textarea
                      placeholder={`Enter model names, one per line. Default models:\n${selectedProviderInfo.defaultModels?.join('\n') || ''}`}
                      value={customModels}
                      onChange={(e) => setCustomModels(e.target.value)}
                      className="min-h-[100px] font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Leave empty to use default models. Enter one model per line.
                    </p>
                  </div>
                )}

                <Button onClick={handleAddKey} className="w-full">
                  Add API Key
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Saved Keys Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Saved API Keys</h3>
              <Badge variant="outline">{savedKeys.length} keys</Badge>
            </div>

            {savedKeys.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No API keys saved yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add your first API key to get started
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {savedKeys.map((config) => {
                  const provider = getProviderInfo(config.provider)
                  const isEditing = editingModels === config.id
                  
                  return (
                    <Card key={config.id} className="hover:bg-muted/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                {provider?.icon}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{config.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {provider?.name}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>Key: {config.keyPreview}</span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(config.lastUsed).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUseKey(config)}
                              >
                                Use Key
                              </Button>
                              {provider?.supportsCustomModels && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditingModels(config)}
                                >
                                  <Settings className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveKey(config.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Models Section */}
                          {provider?.supportsCustomModels && (config.models && config.models.length > 0) && (
                            <>
                              <Separator />
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label className="text-sm font-medium">Available Models</Label>
                                  <Badge variant="secondary" className="text-xs">
                                    {config.models.length} models
                                  </Badge>
                                </div>
                                {isEditing ? (
                                  <div className="space-y-3">
                                    <Textarea
                                      value={customModels}
                                      onChange={(e) => setCustomModels(e.target.value)}
                                      className="min-h-[100px] font-mono text-sm"
                                      placeholder="Enter model names, one per line"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() => handleUpdateModels(config.id)}
                                      >
                                        Save Models
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setEditingModels(null)
                                          setCustomModels("")
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-wrap gap-1">
                                    {config.models.map((model, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {model}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>

          {savedKeys.length > 0 && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  apiKeyManager.clearAllKeys()
                  loadSavedKeys()
                  toast({
                    title: "All Keys Cleared",
                    description: "All API keys have been removed",
                  })
                }}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Keys
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
