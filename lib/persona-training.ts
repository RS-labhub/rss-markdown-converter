"use client"

interface WritingPatterns {
  tone: string[]          // e.g., ["professional", "casual", "enthusiastic"]
  structure: string[]     // e.g., ["bullet points", "numbered lists", "paragraphs"]
  vocabulary: string[]    // characteristic words/phrases
  sentenceLength: "short" | "medium" | "long" | "mixed"
  engagement: string[]    // e.g., ["questions", "call-to-action", "personal anecdotes"]
}

interface PersonaAnalytics {
  wordCount: number
  avgPostLength: number
  commonTopics: string[]
  keyPhrases: string[]
  writingComplexity: "simple" | "moderate" | "complex"
  lastAnalyzed: string
}

interface PersonaData {
  name: string
  rawContent: string
  instructions?: string
  createdAt: string
  isBuiltIn?: boolean
  contentType?: "posts" | "blogs" | "mixed"
  // New enhanced fields
  description?: string
  author?: string
  domain?: string[]       // areas of expertise
  writingPatterns?: WritingPatterns
  analytics?: PersonaAnalytics
  tags?: string[]
  version?: string
  lastUpdated?: string
}

const STORAGE_KEY = "rss-platform-persona-training"

// Enhanced persona analysis functions
export function analyzePersonaContent(content: string): PersonaAnalytics {
  const words = content.split(/\s+/).filter(word => word.length > 0)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  
  // Extract common topics and phrases
  const commonWords = extractCommonWords(content)
  const keyPhrases = extractKeyPhrases(content)
  
  // Calculate complexity
  const avgWordsPerSentence = words.length / sentences.length
  let complexity: "simple" | "moderate" | "complex" = "simple"
  if (avgWordsPerSentence > 20) complexity = "complex"
  else if (avgWordsPerSentence > 12) complexity = "moderate"
  
  return {
    wordCount: words.length,
    avgPostLength: words.length / Math.max(paragraphs.length, 1),
    commonTopics: extractTopics(content),
    keyPhrases,
    writingComplexity: complexity,
    lastAnalyzed: new Date().toISOString()
  }
}

export function extractWritingPatterns(content: string): WritingPatterns {
  const tone = analyzeTone(content)
  const structure = analyzeStructure(content)
  const vocabulary = extractVocabulary(content)
  const sentenceLength = analyzeSentenceLength(content)
  const engagement = analyzeEngagement(content)
  
  return {
    tone,
    structure,
    vocabulary,
    sentenceLength,
    engagement
  }
}

function extractCommonWords(content: string): string[] {
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3)
  
  const wordCount = new Map<string, number>()
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1)
  })
  
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(entry => entry[0])
}

function extractKeyPhrases(content: string): string[] {
  // Simple bigram and trigram extraction
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
  
  const phrases: string[] = []
  
  // Extract 2-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = `${words[i]} ${words[i + 1]}`
    if (!phrases.includes(phrase)) {
      phrases.push(phrase)
    }
  }
  
  // Extract 3-word phrases
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`
    if (!phrases.includes(phrase)) {
      phrases.push(phrase)
    }
  }
  
  return phrases.slice(0, 15)
}

function extractTopics(content: string): string[] {
  const topicKeywords = {
    "technology": ["ai", "artificial intelligence", "machine learning", "software", "development", "coding", "programming", "tech", "digital", "automation"],
    "business": ["business", "startup", "entrepreneur", "marketing", "sales", "revenue", "growth", "strategy", "leadership"],
    "cybersecurity": ["security", "cybersecurity", "encryption", "vulnerability", "threat", "protection", "attack", "defense"],
    "devops": ["devops", "deployment", "docker", "kubernetes", "ci/cd", "infrastructure", "cloud", "aws", "azure"],
    "web development": ["web", "frontend", "backend", "javascript", "react", "node", "html", "css", "api", "framework"],
    "data science": ["data", "analytics", "science", "analysis", "visualization", "statistics", "insights", "model"]
  }
  
  const contentLower = content.toLowerCase()
  const detectedTopics: string[] = []
  
  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    const matches = keywords.filter(keyword => contentLower.includes(keyword))
    if (matches.length >= 2) {
      detectedTopics.push(topic)
    }
  }
  
  return detectedTopics
}

function analyzeTone(content: string): string[] {
  const tones = []
  const contentLower = content.toLowerCase()
  
  // Professional indicators
  if (/\b(professional|enterprise|industry|standards|best practices|methodology)\b/.test(contentLower)) {
    tones.push("professional")
  }
  
  // Casual indicators
  if (/\b(hey|folks|guys|awesome|cool|amazing)\b/.test(contentLower)) {
    tones.push("casual")
  }
  
  // Enthusiastic indicators
  if (/\b(exciting|thrilled|fantastic|incredible|game-changing|revolutionary)\b/.test(contentLower) || /!{2,}/.test(content)) {
    tones.push("enthusiastic")
  }
  
  // Technical indicators
  if (/\b(implementation|configuration|architecture|framework|algorithm|optimization)\b/.test(contentLower)) {
    tones.push("technical")
  }
  
  // Educational indicators
  if (/\b(learn|tutorial|guide|step|example|explanation|understand)\b/.test(contentLower)) {
    tones.push("educational")
  }
  
  return tones.length > 0 ? tones : ["neutral"]
}

function analyzeStructure(content: string): string[] {
  const structures = []
  
  if (/^[•\-\*]\s/m.test(content)) {
    structures.push("bullet points")
  }
  
  if (/^\d+\.\s/m.test(content)) {
    structures.push("numbered lists")
  }
  
  if (/#{1,6}\s/.test(content)) {
    structures.push("headings")
  }
  
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  if (paragraphs.length > 2) {
    structures.push("paragraphs")
  }
  
  if (/```|`[^`]+`/.test(content)) {
    structures.push("code blocks")
  }
  
  return structures.length > 0 ? structures : ["plain text"]
}

function extractVocabulary(content: string): string[] {
  const vocabulary = []
  const contentLower = content.toLowerCase()
  
  // Technical vocabulary
  if (/\b(api|sdk|framework|library|database|server|client|protocol)\b/.test(contentLower)) {
    vocabulary.push("technical jargon")
  }
  
  // Business vocabulary
  if (/\b(roi|kpi|metrics|optimization|efficiency|scalability|growth)\b/.test(contentLower)) {
    vocabulary.push("business terms")
  }
  
  // Casual vocabulary
  if (/\b(totally|basically|pretty much|kind of|sort of)\b/.test(contentLower)) {
    vocabulary.push("casual language")
  }
  
  // Academic vocabulary
  if (/\b(methodology|analysis|research|study|investigation|hypothesis)\b/.test(contentLower)) {
    vocabulary.push("academic language")
  }
  
  return vocabulary
}

function analyzeSentenceLength(content: string): "short" | "medium" | "long" | "mixed" {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const lengths = sentences.map(s => s.split(/\s+/).length)
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
  
  if (avgLength < 10) return "short"
  if (avgLength > 20) return "long"
  
  // Check for variation
  const variance = lengths.reduce((acc, len) => acc + Math.pow(len - avgLength, 2), 0) / lengths.length
  return variance > 50 ? "mixed" : "medium"
}

function analyzeEngagement(content: string): string[] {
  const engagement = []
  
  if (/\?/.test(content)) {
    engagement.push("questions")
  }
  
  if (/\b(check out|visit|try|download|subscribe|follow|share)\b/i.test(content)) {
    engagement.push("call-to-action")
  }
  
  if (/\b(I|my|me|personally|in my experience)\b/i.test(content)) {
    engagement.push("personal anecdotes")
  }
  
  if (/@\w+|#\w+/.test(content)) {
    engagement.push("social mentions")
  }
  
  if (/\b(you|your|we|us|let's)\b/i.test(content)) {
    engagement.push("direct address")
  }
  
  return engagement
}

// Get detailed insights about a persona
export function getPersonaInsights(name: string): {
  persona: PersonaData | null
  insights: {
    strengths: string[]
    suggestions: string[]
    styleCharacteristics: string[]
    contentQuality: "excellent" | "good" | "fair" | "needs-improvement"
  }
} | null {
  const persona = getPersonaTrainingData(name)
  if (!persona) return null
  
  const insights = {
    strengths: [] as string[],
    suggestions: [] as string[],
    styleCharacteristics: [] as string[],
    contentQuality: "fair" as "excellent" | "good" | "fair" | "needs-improvement"
  }
  
  if (persona.analytics) {
    const { wordCount, avgPostLength, commonTopics, writingComplexity } = persona.analytics
    
    // Analyze content quality
    if (wordCount > 2000 && commonTopics.length > 3) {
      insights.contentQuality = "excellent"
    } else if (wordCount > 1000 && commonTopics.length > 2) {
      insights.contentQuality = "good"
    } else if (wordCount < 500) {
      insights.contentQuality = "needs-improvement"
    }
    
    // Add strengths
    if (avgPostLength > 100) {
      insights.strengths.push("Detailed content with good depth")
    }
    if (commonTopics.length > 2) {
      insights.strengths.push("Covers diverse topics")
    }
    if (writingComplexity === "moderate") {
      insights.strengths.push("Well-balanced writing complexity")
    }
    
    // Add suggestions
    if (wordCount < 1000) {
      insights.suggestions.push("Add more training content for better accuracy")
    }
    if (commonTopics.length < 2) {
      insights.suggestions.push("Include content from more topic areas")
    }
    if (writingComplexity === "simple") {
      insights.suggestions.push("Consider adding more varied sentence structures")
    }
  }
  
  if (persona.writingPatterns) {
    const { tone, structure, engagement } = persona.writingPatterns
    
    // Style characteristics
    if (tone.includes("professional")) {
      insights.styleCharacteristics.push("Professional and business-oriented")
    }
    if (tone.includes("technical")) {
      insights.styleCharacteristics.push("Technical and detail-focused")
    }
    if (structure.includes("bullet points")) {
      insights.styleCharacteristics.push("Uses structured formatting")
    }
    if (engagement.includes("questions")) {
      insights.styleCharacteristics.push("Engages readers with questions")
    }
    if (engagement.includes("personal anecdotes")) {
      insights.styleCharacteristics.push("Shares personal experiences")
    }
  }
  
  return { persona, insights }
}

// Compare two personas
export function comparePersonas(name1: string, name2: string): {
  similarities: string[]
  differences: string[]
  recommendations: string[]
} | null {
  const persona1 = getPersonaTrainingData(name1)
  const persona2 = getPersonaTrainingData(name2)
  
  if (!persona1 || !persona2) return null
  
  const similarities: string[] = []
  const differences: string[] = []
  const recommendations: string[] = []
  
  // Compare analytics
  if (persona1.analytics && persona2.analytics) {
    if (persona1.analytics.writingComplexity === persona2.analytics.writingComplexity) {
      similarities.push(`Both have ${persona1.analytics.writingComplexity} writing complexity`)
    } else {
      differences.push(`${name1}: ${persona1.analytics.writingComplexity} vs ${name2}: ${persona2.analytics.writingComplexity} complexity`)
    }
    
    const commonTopics = persona1.analytics.commonTopics.filter(topic => 
      persona2.analytics!.commonTopics.includes(topic)
    )
    if (commonTopics.length > 0) {
      similarities.push(`Shared topics: ${commonTopics.join(", ")}`)
    }
  }
  
  // Compare writing patterns
  if (persona1.writingPatterns && persona2.writingPatterns) {
    const commonTones = persona1.writingPatterns.tone.filter(tone => 
      persona2.writingPatterns!.tone.includes(tone)
    )
    if (commonTones.length > 0) {
      similarities.push(`Similar tones: ${commonTones.join(", ")}`)
    }
    
    if (persona1.writingPatterns.sentenceLength === persona2.writingPatterns.sentenceLength) {
      similarities.push(`Both prefer ${persona1.writingPatterns.sentenceLength} sentences`)
    } else {
      differences.push(`${name1}: ${persona1.writingPatterns.sentenceLength} sentences vs ${name2}: ${persona2.writingPatterns.sentenceLength} sentences`)
    }
  }
  
  // Generate recommendations
  if (similarities.length > 2) {
    recommendations.push("These personas are quite similar - consider merging or specializing them")
  }
  if (differences.length > similarities.length) {
    recommendations.push("These personas have distinct styles - good for targeting different audiences")
  }
  
  return { similarities, differences, recommendations }
}

// Test persona effectiveness
export async function testPersonaEffectiveness(
  personaName: string,
  generatedContent: string,
  testPrompt?: string
): Promise<any> {
  const persona = getPersonaTrainingData(personaName)
  if (!persona) {
    throw new Error("Persona not found")
  }

  try {
    const response = await fetch("/api/persona-test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personaName,
        originalContent: persona.rawContent,
        generatedContent,
        testPrompt,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to test persona effectiveness")
    }

    return await response.json()
  } catch (error) {
    console.error("Error testing persona effectiveness:", error)
    throw error
  }
}

// Generate test content for persona validation
export function generateTestScenarios(persona: any): Array<{
  scenario: string
  expectedCharacteristics: string[]
  testPrompt: string
}> {
  const scenarios = []

  // Basic tone test
  scenarios.push({
    scenario: "Basic Tone Matching",
    expectedCharacteristics: persona.writingPatterns?.tone || ["consistent tone"],
    testPrompt: "Generate content about a new technology announcement and ensure the tone matches the persona's typical writing style."
  })

  // Structure test
  scenarios.push({
    scenario: "Content Structure",
    expectedCharacteristics: persona.writingPatterns?.structure || ["clear structure"],
    testPrompt: "Create a post about a complex topic and use the same structural elements the persona typically employs."
  })

  // Domain expertise test
  if (persona.domain && persona.domain.length > 0) {
    scenarios.push({
      scenario: "Domain Expertise",
      expectedCharacteristics: persona.domain,
      testPrompt: `Write about a topic in ${persona.domain[0]} demonstrating the same level of expertise and insight as the persona.`
    })
  }

  // Engagement style test
  if (persona.writingPatterns?.engagement) {
    scenarios.push({
      scenario: "Engagement Style",
      expectedCharacteristics: persona.writingPatterns.engagement,
      testPrompt: "Create content that engages the audience using the same patterns and techniques as the persona."
    })
  }

  return scenarios
}

// Batch test persona with multiple scenarios
export async function batchTestPersona(personaName: string): Promise<{
  overallScore: number
  tests: Array<{
    scenario: string
    score: number
    analysis: any
  }>
  recommendations: string[]
}> {
  const persona = getPersonaTrainingData(personaName)
  if (!persona) {
    throw new Error("Persona not found")
  }

  const scenarios = generateTestScenarios(persona)
  const results = []
  let totalScore = 0

  for (const scenario of scenarios) {
    try {
      // For this example, we'll use a sample generated content
      // In a real implementation, you'd generate content for each scenario
      const sampleContent = `This is a sample generated content for testing the ${scenario.scenario} scenario with persona ${personaName}.`
      
      const testResult = await testPersonaEffectiveness(personaName, sampleContent, scenario.testPrompt)
      
      results.push({
        scenario: scenario.scenario,
        score: testResult.analysis?.overallScore || 0,
        analysis: testResult.analysis
      })
      
      totalScore += testResult.analysis?.overallScore || 0
    } catch (error) {
      console.error(`Error testing scenario ${scenario.scenario}:`, error)
      results.push({
        scenario: scenario.scenario,
        score: 0,
        analysis: { error: "Test failed" }
      })
    }
  }

  const overallScore = results.length > 0 ? totalScore / results.length : 0

  // Generate recommendations based on test results
  const recommendations = []
  const lowScoreTests = results.filter(r => r.score < 70)
  
  if (lowScoreTests.length > 0) {
    recommendations.push("Consider adding more diverse training examples to improve consistency")
  }
  
  if (results.some(r => r.analysis?.improvements?.length > 0)) {
    recommendations.push("Review specific improvement suggestions from individual test analyses")
  }
  
  if (overallScore < 80) {
    recommendations.push("Add more training content to better capture the persona's style")
  }

  return {
    overallScore,
    tests: results,
    recommendations
  }
}

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
  description?: string,
  author?: string,
  domain?: string[],
  tags?: string[],
): void {
  if (typeof window === "undefined") return

  try {
    const existingData = getStoredPersonaData()
    
    // Analyze the content automatically
    const analytics = analyzePersonaContent(rawContent)
    const writingPatterns = extractWritingPatterns(rawContent)
    
    const newPersona: PersonaData = {
      name: name.toLowerCase(),
      rawContent,
      instructions: instructions?.trim() || undefined,
      createdAt: new Date().toISOString(),
      isBuiltIn: false,
      contentType,
      description: description?.trim() || undefined,
      author: author?.trim() || undefined,
      domain: domain || [],
      writingPatterns,
      analytics,
      tags: tags || [],
      version: "2.0",
      lastUpdated: new Date().toISOString(),
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
