"use client"

export interface APIKeyConfig {
  id: string
  name: string
  provider: string
  keyPreview: string
  createdAt: string
  lastUsed: string
  models?: string[]
}

export interface APIProvider {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  model: string
  requiresKey: boolean
  keyPlaceholder: string
  keyValidation: (key: string) => boolean
  defaultModels?: string[]
  supportsCustomModels?: boolean
}

const STORAGE_KEY = "rss-platform-api-keys"
const ENCRYPTION_KEY = "rss-platform-secret-2025"

// Simple encryption/decryption functions
function simpleEncrypt(text: string): string {
  let result = ""
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
    result += String.fromCharCode(charCode)
  }
  return btoa(result)
}

function simpleDecrypt(encrypted: string): string {
  try {
    const decoded = atob(encrypted)
    let result = ""
    for (let i = 0; i < decoded.length; i++) {
      const charCode = decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      result += String.fromCharCode(charCode)
    }
    return result
  } catch {
    return ""
  }
}

export class APIKeyManager {
  private static instance: APIKeyManager
  private keys: Map<string, string> = new Map()
  private configs: APIKeyConfig[] = []

  private constructor() {
    this.loadFromStorage()
  }

  static getInstance(): APIKeyManager {
    if (!APIKeyManager.instance) {
      APIKeyManager.instance = new APIKeyManager()
    }
    return APIKeyManager.instance
  }

  private loadFromStorage(): void {
    if (typeof window === "undefined") return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        this.configs = data.configs || []
        
        // Decrypt and load keys
        data.keys?.forEach((item: { id: string; key: string }) => {
          const decryptedKey = simpleDecrypt(item.key)
          if (decryptedKey) {
            this.keys.set(item.id, decryptedKey)
          }
        })
      }
    } catch (error) {
      console.error("Error loading API keys:", error)
    }
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return
    
    try {
      const keysArray = Array.from(this.keys.entries()).map(([id, key]) => ({
        id,
        key: simpleEncrypt(key)
      }))
      
      const data = {
        configs: this.configs,
        keys: keysArray
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving API keys:", error)
    }
  }

  addAPIKey(provider: string, key: string, name?: string, models?: string[]): string {
    const id = `${provider}-${Date.now()}`
    const keyPreview = this.createKeyPreview(key)
    
    const config: APIKeyConfig = {
      id,
      name: name || `${provider} Key`,
      provider,
      keyPreview,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      models: models || []
    }

    this.keys.set(id, key)
    this.configs.push(config)
    this.saveToStorage()
    
    return id
  }

  getAPIKey(id: string): string | null {
    const key = this.keys.get(id)
    if (key) {
      // Update last used
      const config = this.configs.find(c => c.id === id)
      if (config) {
        config.lastUsed = new Date().toISOString()
        this.saveToStorage()
      }
    }
    return key || null
  }

  removeAPIKey(id: string): void {
    this.keys.delete(id)
    this.configs = this.configs.filter(c => c.id !== id)
    this.saveToStorage()
  }

  updateAPIKeyModels(id: string, models: string[]): void {
    const config = this.configs.find(c => c.id === id)
    if (config) {
      config.models = models
      this.saveToStorage()
    }
  }

  getConfigs(provider?: string): APIKeyConfig[] {
    const configs = provider 
      ? this.configs.filter(c => c.provider === provider)
      : this.configs
    
    return configs.sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
  }

  getAPIKeyModels(id: string): string[] {
    const config = this.configs.find(c => c.id === id)
    return config?.models || []
  }

  private createKeyPreview(key: string): string {
    if (key.length <= 8) return key
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
  }

  clearAllKeys(): void {
    this.keys.clear()
    this.configs = []
    this.saveToStorage()
  }

  validateKey(provider: string, key: string): boolean {
    switch (provider) {
      case "openai":
        return key.startsWith("sk-") && key.length > 20
      case "anthropic":
        return key.startsWith("sk-ant-") && key.length > 20
      case "groq-custom":
        return key.startsWith("gsk_") && key.length > 20
      case "gemini-custom":
        return key.length > 20 && !key.includes(" ")
      case "huggingface":
        return key.startsWith("hf_") && key.length > 20
      default:
        return key.length > 0
    }
  }
}

export const apiKeyManager = APIKeyManager.getInstance()
