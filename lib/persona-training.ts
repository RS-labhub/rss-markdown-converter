"use client"

interface PersonaData {
  name: string
  rawContent: string
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

// Update savePersonaTrainingData to include content type
export function savePersonaTrainingDataWithType(
  name: string,
  rawContent: string,
  contentType: "posts" | "blogs" | "mixed" = "mixed",
): void {
  if (typeof window === "undefined") return

  try {
    const existingData = getStoredPersonaData()
    const newPersona: PersonaData = {
      name: name.toLowerCase(),
      rawContent,
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
    createdAt: persona.createdAt,
    exportedAt: new Date().toISOString(),
    version: "1.0",
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
        const data = JSON.parse(content)

        if (!data.name || !data.rawContent) {
          throw new Error("Invalid persona backup file format")
        }

        const persona: PersonaData = {
          name: data.name.toLowerCase(),
          rawContent: data.rawContent,
          createdAt: data.createdAt || new Date().toISOString(),
          isBuiltIn: false,
          contentType: data.contentType || "mixed",
        }

        // Save the persona
        savePersonaTrainingData(persona.name, persona.rawContent)
        resolve(persona)
      } catch (error) {
        reject(new Error("Failed to parse persona backup file"))
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
