"use client"

interface PersonaData {
  name: string
  rawContent: string
  instructions?: string
  createdAt: string
  isBuiltIn?: boolean
  contentType?: "posts" | "blogs" | "mixed"
}

const STORAGE_KEY = "rss-platform-persona-training"

// Function to load built-in persona data from text files
export async function loadBuiltInPersonaData(name: string): Promise<string | null> {
  try {
    const response = await fetch(`/training-data/${name}-posts.txt`)
    if (response.ok) {
      return await response.text()
    }
  } catch (error) {
    console.error(`Error loading ${name} training data:`, error)
  }
  return null
}

// Add a new function to load built-in persona data with content type
export async function loadBuiltInPersonaDataWithType(
  name: string,
  contentType: "posts" | "blogs",
): Promise<string | null> {
  try {
    const suffix = contentType === "blogs" ? "blogs" : "posts"
    const response = await fetch(`/training-data/${name}-${suffix}.txt`)
    if (response.ok) {
      return await response.text()
    }
  } catch (error) {
    console.error(`Error loading ${name} ${contentType} training data:`, error)
  }
  return null
}

export function savePersonaTrainingData(name: string, rawContent: string): void {
  if (typeof window === "undefined") return

  try {
    const existingData = getStoredPersonaData()
    const newPersona: PersonaData = {
      name: name.toLowerCase(),
      rawContent,
      createdAt: new Date().toISOString(),
      isBuiltIn: false,
    }

    // Remove existing persona with same name
    const filteredData = existingData.filter((p) => p.name !== name.toLowerCase())
    const updatedData = [...filteredData, newPersona]

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
  } catch (error) {
    console.error("Error saving persona training data:", error)
    throw new Error("Failed to save persona training data")
  }
}

// Update savePersonaTrainingData to include content type and instructions
export function savePersonaTrainingDataWithType(
  name: string,
  rawContent: string,
  contentType: "posts" | "blogs" | "mixed" = "mixed",
  instructions?: string,
): void {
  if (typeof window === "undefined") return

  try {
    const existingData = getStoredPersonaData()
    const newPersona: PersonaData = {
      name: name.toLowerCase(),
      rawContent,
      instructions: instructions?.trim() || undefined,
      createdAt: new Date().toISOString(),
      isBuiltIn: false,
      contentType,
    }

    // Remove existing persona with same name (regardless of content type)
    const filteredData = existingData.filter((p) => p.name !== name.toLowerCase())
    const updatedData = [...filteredData, newPersona]

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
  } catch (error) {
    console.error("Error saving persona training data:", error)
    throw new Error("Failed to save persona training data")
  }
}

export function getPersonaTrainingData(name: string): PersonaData | null {
  if (typeof window === "undefined") return null

  try {
    const allPersonas = getAllPersonaData()
    return allPersonas.find((p) => p.name === name.toLowerCase()) || null
  } catch (error) {
    console.error("Error getting persona training data:", error)
    return null
  }
}

// Update the getPersonaTrainingData function to support content type
export function getPersonaTrainingDataWithType(
  name: string,
  contentType?: "posts" | "blogs" | "mixed",
): PersonaData | null {
  if (typeof window === "undefined") return null

  try {
    const allPersonas = getAllPersonaData()
    // Always return the persona with the given name, regardless of content type if not specified
    return allPersonas.find((p) => p.name === name.toLowerCase()) || null
  } catch (error) {
    console.error("Error getting persona training data:", error)
    return null
  }
}

// Only return stored personas (no built-in ones)
export function getAllPersonaData(): PersonaData[] {
  if (typeof window === "undefined") return []

  try {
    const stored = getStoredPersonaData()
    return stored.filter((p) => !p.isBuiltIn)
  } catch (error) {
    console.error("Error getting all persona data:", error)
    return []
  }
}

export function removePersonaTrainingData(name: string): boolean {
  if (typeof window === "undefined") return false

  try {
    const existingData = getStoredPersonaData()
    const filteredData = existingData.filter((p) => p.name !== name.toLowerCase())
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData))
    return true
  } catch (error) {
    console.error("Error removing persona training data:", error)
    return false
  }
}

export function downloadPersonaData(name: string): void {
  const persona = getPersonaTrainingData(name)
  if (!persona) return

  const dataToDownload = {
    name: persona.name,
    rawContent: persona.rawContent,
    instructions: persona.instructions,
    createdAt: persona.createdAt,
    contentType: persona.contentType,
    exportedAt: new Date().toISOString(),
    version: "1.1",
  }

  const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], {
    type: "application/json",
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${name}-persona-backup.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function uploadPersonaData(file: File): Promise<PersonaData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        
        // Check if file is JSON or TXT
        const isJson = file.name.toLowerCase().endsWith('.json')
        const isTxt = file.name.toLowerCase().endsWith('.txt')
        
        if (!isJson && !isTxt) {
          throw new Error("Only .json and .txt files are supported")
        }
        
        let persona: PersonaData
        
        if (isJson) {
          // Parse JSON file
          const data = JSON.parse(content)
          
          if (!data.name || !data.rawContent) {
            throw new Error("Invalid persona backup file format")
          }
          
          persona = {
            name: data.name.toLowerCase(),
            rawContent: data.rawContent,
            instructions: data.instructions,
            createdAt: data.createdAt || new Date().toISOString(),
            isBuiltIn: false,
            contentType: data.contentType || "mixed",
          }
        } else {
          // Handle text file
          // Extract name from filename (remove .txt extension)
          const nameFromFile = file.name.replace(/\.txt$/i, '')
          
          // Try to detect content type from filename
          let detectedContentType: "posts" | "blogs" | "mixed" = "mixed"
          if (nameFromFile.toLowerCase().includes('-posts')) {
            detectedContentType = "posts"
          } else if (nameFromFile.toLowerCase().includes('-blogs')) {
            detectedContentType = "blogs"
          }
          
          // Clean up the name (remove -posts/-blogs suffixes if present)
          const cleanName = nameFromFile
            .toLowerCase()
            .replace(/-posts$/i, '')
            .replace(/-blogs$/i, '')
          
          persona = {
            name: cleanName,
            rawContent: content,
            instructions: "", // No instructions in plain text files
            createdAt: new Date().toISOString(),
            isBuiltIn: false,
            contentType: detectedContentType,
          }
        }

        // Save the persona
        savePersonaTrainingDataWithType(persona.name, persona.rawContent, persona.contentType, persona.instructions)
        resolve(persona)
      } catch (error) {
        reject(new Error(error instanceof Error ? error.message : "Failed to parse persona file"))
      }
    }
    reader.onerror = () => reject(new Error("Failed to read file"))
    reader.readAsText(file)
  })
}

function getStoredPersonaData(): PersonaData[] {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error parsing stored persona data:", error)
    return []
  }
}

// Save custom instructions for built-in personas
export function saveBuiltInPersonaInstructions(
  name: string,
  instructions: string,
  contentType: "posts" | "blogs" | "mixed" = "mixed",
): void {
  if (typeof window === "undefined") return

  try {
    const existingData = getStoredPersonaData()
    const instructionsPersona: PersonaData = {
      name: `${name.toLowerCase()}-instructions`,
      rawContent: "", // Empty for instructions-only personas
      instructions: instructions.trim(),
      createdAt: new Date().toISOString(),
      isBuiltIn: true,
      contentType,
    }

    // Remove existing instructions for this built-in persona
    const filteredData = existingData.filter((p) => p.name !== `${name.toLowerCase()}-instructions`)
    const updatedData = [...filteredData, instructionsPersona]

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))
  } catch (error) {
    console.error("Error saving built-in persona instructions:", error)
    throw new Error("Failed to save built-in persona instructions")
  }
}

// Get custom instructions for built-in personas
export function getBuiltInPersonaInstructions(name: string): string | null {
  if (typeof window === "undefined") return null

  try {
    const stored = getStoredPersonaData()
    const instructionsPersona = stored.find((p) => p.name === `${name.toLowerCase()}-instructions` && p.isBuiltIn)
    return instructionsPersona?.instructions || null
  } catch (error) {
    console.error("Error getting built-in persona instructions:", error)
    return null
  }
}

// Remove custom instructions for built-in personas
export function removeBuiltInPersonaInstructions(name: string): boolean {
  if (typeof window === "undefined") return false

  try {
    const existingData = getStoredPersonaData()
    const filteredData = existingData.filter((p) => p.name !== `${name.toLowerCase()}-instructions`)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredData))
    return true
  } catch (error) {
    console.error("Error removing built-in persona instructions:", error)
    return false
  }
}
