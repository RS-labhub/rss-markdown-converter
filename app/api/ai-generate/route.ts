import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createAnthropic } from "@ai-sdk/anthropic"

// Server-side persona analysis functions (duplicated from client-side lib)
function analyzePersonaContentServer(content: string) {
  const words = content.split(/\s+/).filter(word => word.length > 0)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0)
  
  // Extract common topics and phrases
  const commonWords = extractCommonWordsServer(content)
  const keyPhrases = extractKeyPhrasesServer(content)
  
  // Calculate complexity
  const avgWordsPerSentence = words.length / sentences.length
  let complexity: "simple" | "moderate" | "complex" = "simple"
  if (avgWordsPerSentence > 20) complexity = "complex"
  else if (avgWordsPerSentence > 12) complexity = "moderate"
  
  // Advanced analytics
  const semanticClusters = extractSemanticClustersServer(content)
  const stylisticFingerprint = extractStylisticFingerprintServer(content)
  const temporalPatterns = extractTemporalPatternsServer(content)
  
  return {
    wordCount: words.length,
    avgPostLength: words.length / Math.max(paragraphs.length, 1),
    commonTopics: extractTopicsServer(content),
    keyPhrases,
    writingComplexity: complexity,
    lastAnalyzed: new Date().toISOString(),
    semanticClusters,
    stylisticFingerprint,
    temporalPatterns
  }
}

function extractWritingPatternsServer(content: string) {
  const tone = analyzeToneServer(content)
  const structure = analyzeStructureServer(content)
  const vocabulary = extractVocabularyServer(content)
  const sentenceLength = analyzeSentenceLengthServer(content)
  const engagement = analyzeEngagementServer(content)
  const sentiment = analyzeSentimentServer(content)
  const readability = analyzeReadabilityServer(content)
  
  return {
    tone,
    structure,
    vocabulary,
    sentenceLength,
    engagement,
    sentiment,
    readability
  }
}

function analyzeMultiModalPreferencesServer(content: string) {
  // Analyze image preferences
  const imageReferences = (content.match(/!\[.*?\]/g) || []).length
  const totalParagraphs = content.split(/\n\s*\n/).length
  let imageFrequency: "rare" | "occasional" | "frequent" | "always" = "rare"
  
  if (imageReferences / totalParagraphs > 0.5) imageFrequency = "always"
  else if (imageReferences / totalParagraphs > 0.3) imageFrequency = "frequent"
  else if (imageReferences / totalParagraphs > 0.1) imageFrequency = "occasional"

  // Analyze formatting preferences
  const headings = content.match(/^#{1,6}\s/gm) || []
  const headingStyle: string[] = []
  
  if (headings.some(h => /^\d+\./.test(h))) headingStyle.push("numbered")
  if (headings.some(h => /\?$/.test(h))) headingStyle.push("question-based")
  if (headings.length > 0) headingStyle.push("descriptive")

  // List preferences
  const bulletLists = (content.match(/^[•\-\*]\s/gm) || []).length
  const numberedLists = (content.match(/^\d+\.\s/gm) || []).length
  let listPreference: "bullets" | "numbers" | "mixed" = "bullets"
  
  if (numberedLists > bulletLists * 2) listPreference = "numbers"
  else if (numberedLists > 0 && bulletLists > 0) listPreference = "mixed"

  // Code block usage
  const codeBlocks = (content.match(/```/g) || []).length / 2
  const inlineCode = (content.match(/`[^`]+`/g) || []).length
  let codeBlockUsage: "frequent" | "occasional" | "rare" = "rare"
  
  if (codeBlocks + inlineCode > totalParagraphs * 0.3) codeBlockUsage = "frequent"
  else if (codeBlocks + inlineCode > 0) codeBlockUsage = "occasional"

  return {
    imageStyle: {
      preferredTypes: ["screenshots"],
      frequency: imageFrequency,
      placement: imageReferences > 0 ? ["middle"] : [],
      captionStyle: "technical"
    },
    formatting: {
      headingStyle: headingStyle.length > 0 ? headingStyle : ["descriptive"],
      listPreference,
      codeBlockUsage,
      tableUsage: "occasional" as const,
      quoteUsage: "rare" as const
    },
    mediaPatterns: {
      videoFrequency: "rare" as const,
      linkingStyle: "inline" as const,
      citationPreference: "informal" as const,
      socialMediaIntegration: false
    }
  }
}

// Helper functions for server-side analysis
function extractCommonWordsServer(content: string): string[] {
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

function extractKeyPhrasesServer(content: string): string[] {
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
  
  return phrases.slice(0, 15)
}

function extractTopicsServer(content: string): string[] {
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

function analyzeToneServer(content: string): string[] {
  const tones = []
  const contentLower = content.toLowerCase()
  
  if (/\b(professional|enterprise|industry|standards|best practices|methodology)\b/.test(contentLower)) {
    tones.push("professional")
  }
  if (/\b(hey|folks|guys|awesome|cool|amazing)\b/.test(contentLower)) {
    tones.push("casual")
  }
  if (/\b(exciting|thrilled|fantastic|incredible|game-changing|revolutionary)\b/.test(contentLower) || /!{2,}/.test(content)) {
    tones.push("enthusiastic")
  }
  if (/\b(implementation|configuration|architecture|framework|algorithm|optimization)\b/.test(contentLower)) {
    tones.push("technical")
  }
  if (/\b(learn|tutorial|guide|step|example|explanation|understand)\b/.test(contentLower)) {
    tones.push("educational")
  }
  
  return tones.length > 0 ? tones : ["neutral"]
}

function analyzeStructureServer(content: string): string[] {
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

function extractVocabularyServer(content: string): string[] {
  const vocabulary = []
  const contentLower = content.toLowerCase()
  
  if (/\b(api|sdk|framework|library|database|server|client|protocol)\b/.test(contentLower)) {
    vocabulary.push("technical jargon")
  }
  if (/\b(roi|kpi|metrics|optimization|efficiency|scalability|growth)\b/.test(contentLower)) {
    vocabulary.push("business terms")
  }
  if (/\b(totally|basically|pretty much|kind of|sort of)\b/.test(contentLower)) {
    vocabulary.push("casual language")
  }
  if (/\b(methodology|analysis|research|study|investigation|hypothesis)\b/.test(contentLower)) {
    vocabulary.push("academic language")
  }
  
  return vocabulary
}

function analyzeSentenceLengthServer(content: string): "short" | "medium" | "long" | "mixed" {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const lengths = sentences.map(s => s.split(/\s+/).length)
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length
  
  if (avgLength < 10) return "short"
  if (avgLength > 20) return "long"
  
  const variance = lengths.reduce((acc, len) => acc + Math.pow(len - avgLength, 2), 0) / lengths.length
  return variance > 50 ? "mixed" : "medium"
}

function analyzeEngagementServer(content: string): string[] {
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

function analyzeSentimentServer(content: string) {
  const positiveWords = [
    "amazing", "excellent", "fantastic", "great", "awesome", "wonderful", "brilliant", 
    "outstanding", "impressive", "incredible", "powerful", "effective", "successful",
    "exciting", "innovative", "revolutionary", "breakthrough", "opportunity", "progress"
  ]
  
  const negativeWords = [
    "terrible", "awful", "horrible", "bad", "worst", "disappointing", "frustrating",
    "difficult", "challenging", "problem", "issue", "concern", "worry", "risk"
  ]
  
  const emotionalIndicators = {
    optimistic: ["future", "will", "can", "opportunity", "potential", "growth"],
    analytical: ["analysis", "data", "research", "study", "examine", "investigate"],
    cautious: ["however", "but", "careful", "consider", "might", "potential risk"]
  }
  
  const words = content.toLowerCase().split(/\s+/)
  let positiveCount = 0
  let negativeCount = 0
  
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++
  })
  
  const positivePerc = (positiveCount / words.length) * 100
  const negativePerc = (negativeCount / words.length) * 100
  const neutralPerc = 100 - positivePerc - negativePerc
  
  let dominant: "positive" | "neutral" | "negative" | "mixed" = "neutral"
  if (positivePerc > negativePerc && positivePerc > 2) {
    dominant = "positive"
  } else if (negativePerc > positivePerc && negativePerc > 2) {
    dominant = "negative"
  } else if (Math.abs(positivePerc - negativePerc) < 1 && (positivePerc > 1 || negativePerc > 1)) {
    dominant = "mixed"
  }
  
  const emotionalRange: string[] = []
  const contentLower = content.toLowerCase()
  
  for (const [emotion, indicators] of Object.entries(emotionalIndicators)) {
    const matches = indicators.filter(indicator => contentLower.includes(indicator))
    if (matches.length >= 2) {
      emotionalRange.push(emotion)
    }
  }
  
  return {
    dominant,
    distribution: {
      positive: Math.round(positivePerc * 10) / 10,
      neutral: Math.round(neutralPerc * 10) / 10,
      negative: Math.round(negativePerc * 10) / 10
    },
    emotionalRange: emotionalRange.length > 0 ? emotionalRange : ["neutral"]
  }
}

function analyzeReadabilityServer(content: string) {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = content.split(/\s+/).filter(w => w.length > 0)
  
  function countSyllables(word: string): number {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')
    
    const matches = word.match(/[aeiouy]{1,2}/g)
    return Math.max(1, matches ? matches.length : 1)
  }
  
  const totalSyllables = words.reduce((total, word) => total + countSyllables(word), 0)
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1)
  const avgSyllablesPerWord = totalSyllables / Math.max(words.length, 1)
  
  const fleschKincaid = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
  
  let complexityLevel: "elementary" | "middle" | "high-school" | "college" | "graduate" = "elementary"
  if (fleschKincaid >= 16) {
    complexityLevel = "graduate"
  } else if (fleschKincaid >= 13) {
    complexityLevel = "college"
  } else if (fleschKincaid >= 9) {
    complexityLevel = "high-school"
  } else if (fleschKincaid >= 6) {
    complexityLevel = "middle"
  }
  
  return {
    fleschKincaid: Math.round(fleschKincaid * 10) / 10,
    averageWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    averageSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
    complexityLevel
  }
}

function extractSemanticClustersServer(content: string) {
  const clusters = []
  const contentLower = content.toLowerCase()
  
  const semanticGroups = {
    "AI/Machine Learning": {
      keywords: ["ai", "artificial intelligence", "machine learning", "ml", "neural", "algorithm", "model", "training", "inference"],
      sentiment: "innovative"
    },
    "Software Development": {
      keywords: ["code", "coding", "programming", "development", "software", "api", "framework", "library", "github"],
      sentiment: "technical"
    },
    "Business Strategy": {
      keywords: ["business", "strategy", "growth", "revenue", "market", "customer", "product", "solution", "value"],
      sentiment: "professional"
    }
  }
  
  for (const [topic, group] of Object.entries(semanticGroups)) {
    const matchedKeywords = group.keywords.filter(keyword => contentLower.includes(keyword))
    if (matchedKeywords.length >= 2) {
      const frequency = matchedKeywords.reduce((total, keyword) => {
        const regex = new RegExp(keyword, 'gi')
        const matches = content.match(regex)
        return total + (matches ? matches.length : 0)
      }, 0)
      
      clusters.push({
        topic,
        keywords: matchedKeywords,
        frequency,
        sentiment: group.sentiment
      })
    }
  }
  
  return clusters.sort((a, b) => b.frequency - a.frequency)
}

function extractStylisticFingerprintServer(content: string) {
  const punctuationPatterns: string[] = []
  const emphasisMarkers: string[] = []
  const transitionWords: string[] = []
  
  if ((content.match(/!/g) || []).length > 3) {
    punctuationPatterns.push("frequent exclamations")
  }
  if ((content.match(/\?/g) || []).length > 2) {
    punctuationPatterns.push("questioning style")
  }
  if (content.includes("...")) {
    punctuationPatterns.push("ellipsis usage")
  }
  
  const upperCaseWords = content.match(/\b[A-Z]{2,}\b/g) || []
  const capitalizationStyle = upperCaseWords.length > 3 ? "emphasizes with caps" : "standard capitalization"
  
  if (content.includes("**") || content.includes("__")) {
    emphasisMarkers.push("bold formatting")
  }
  if (content.includes("*") && !content.includes("**")) {
    emphasisMarkers.push("italic formatting")
  }
  if (content.includes("`")) {
    emphasisMarkers.push("code formatting")
  }
  
  const transitionWordsDict = [
    "however", "therefore", "moreover", "furthermore", "consequently", "nevertheless",
    "meanwhile", "specifically", "essentially", "ultimately", "particularly", "especially"
  ]
  
  const contentLower = content.toLowerCase()
  transitionWordsDict.forEach(word => {
    if (contentLower.includes(word)) {
      transitionWords.push(word)
    }
  })
  
  return {
    punctuationPatterns,
    capitalizationStyle,
    emphasisMarkers,
    transitionWords
  }
}

function extractTemporalPatternsServer(content: string) {
  const timeReferences: string[] = []
  const urgencyIndicators: string[] = []
  
  const timeWords = ["today", "tomorrow", "yesterday", "now", "soon", "recently", "future", "past", "current", "next", "this year", "2024", "2025"]
  const urgencyWords = ["urgent", "asap", "immediately", "critical", "quickly", "fast", "deadline", "rush", "priority"]
  const futureWords = ["will", "going to", "plan to", "expect", "predict", "anticipate", "upcoming", "future", "next"]
  
  const contentLower = content.toLowerCase()
  
  timeWords.forEach(word => {
    if (contentLower.includes(word)) {
      timeReferences.push(word)
    }
  })
  
  urgencyWords.forEach(word => {
    if (contentLower.includes(word)) {
      urgencyIndicators.push(word)
    }
  })
  
  const futureMatches = futureWords.filter(word => contentLower.includes(word)).length
  const totalWords = content.split(/\s+/).length
  const futureFocusScore = Math.round((futureMatches / totalWords) * 1000) / 10
  
  return {
    timeReferences,
    urgencyIndicators,
    futureFocusScore
  }
}

function generateMultiModalPromptServer(multiModalPreferences: any): string {
  if (!multiModalPreferences) return ""

  const { imageStyle, formatting, mediaPatterns } = multiModalPreferences
  const prompts: string[] = []

  if (imageStyle.frequency !== "rare") {
    prompts.push(`Include images ${imageStyle.frequency} with ${imageStyle.captionStyle} captions`)
  }

  if (formatting.headingStyle.length > 0) {
    prompts.push(`Use ${formatting.headingStyle.join(" and ")} heading styles`)
  }
  if (formatting.listPreference !== "bullets") {
    prompts.push(`Prefer ${formatting.listPreference} lists`)
  }
  if (formatting.codeBlockUsage === "frequent") {
    prompts.push("Include code examples frequently")
  }

  if (mediaPatterns.socialMediaIntegration) {
    prompts.push("Include social media references and hashtags where appropriate")
  }

  return prompts.length > 0 ? `Multi-modal preferences: ${prompts.join("; ")}.` : ""
}

// Initialize GROQ (OpenAI-compatible) and Gemini clients
const groqClient = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
})

const geminiClient = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

// Load persona training data with enhanced analysis
async function loadPersonaTrainingDataWithAnalysis(personaName: string, contentType?: "posts" | "blogs"): Promise<{
  content: string | null
  analysis?: {
    writingPatterns?: any
    analytics?: any
    description?: string
    domain?: string[]
    instructions?: string
    multiModalPreferences?: any
  }
}> {
  try {
    const fs = await import("fs").catch(() => null)
    const path = await import("path").catch(() => null)

    if (fs && path) {
      // Load training content from files
      let fileName = `${personaName}-posts.txt`
      if (contentType === "blogs") {
        fileName = `${personaName}-blogs.txt`
      } else if (contentType === "posts") {
        fileName = `${personaName}-posts.txt`
      }

      const filePath = path.join(process.cwd(), "training-data", fileName)
      let content: string | null = null
      
      if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, "utf-8")
      } else if (contentType === "blogs") {
        // Fallback to posts
        const fallbackPath = path.join(process.cwd(), "training-data", `${personaName}-posts.txt`)
        if (fs.existsSync(fallbackPath)) {
          content = fs.readFileSync(fallbackPath, "utf-8")
        }
      }

      if (content) {
        // Generate enhanced analysis for built-in personas
        const analytics = analyzePersonaContentServer(content)
        const writingPatterns = extractWritingPatternsServer(content)
        const multiModalPreferences = analyzeMultiModalPreferencesServer(content)

        // Enhanced persona metadata
        let analysis = {
          writingPatterns,
          analytics,
          multiModalPreferences
        }

        if (personaName === "bap") {
          analysis = {
            ...analysis,
            description: "AI-native development thought leader and DevRel Engineer at Tessl",
            domain: ["ai-development", "mcp", "developer-tools", "ai-infrastructure", "agent-orchestration"],
            instructions: "Focus on technical precision, developer experience, and practical AI implementation insights. Use structured analysis with bullet points and emphasize community discussion."
          } as any
        } else if (personaName === "simon") {
          analysis = {
            ...analysis,
            description: "AI Native Dev podcast host, developer community builder, and head of DevRel at Tessl",
            domain: ["ai-development", "developer-communities", "ai-tools", "developer-experience", "podcasting"],
            instructions: "Maintain conversational tone with thoughtful analysis. Include personal anecdotes and community examples. Encourage shared experiences and community questions."
          } as any
        } else if (personaName === "rohan-sharma") {
          analysis = {
            ...analysis,
            description: "LLMWare DevRel and open-source AI infrastructure advocate",
            domain: ["llm-infrastructure", "open-source", "ai-tools", "developer-communities", "llmware"],
            instructions: "Use friendly, enthusiastic tone with technical expertise. Focus on community building and open-source advocacy. Include product announcements and direct audience address."
          } as any
        }

        return { content, analysis }
      }
    }
  } catch (error) {
    console.error(`Error loading ${personaName} training data with enhanced analysis:`, error)
  }
  return { content: null }
}

// Load training data from text files
async function loadPersonaTrainingData(personaName: string, contentType?: "posts" | "blogs"): Promise<string | null> {
  const result = await loadPersonaTrainingDataWithAnalysis(personaName, contentType)
  return result.content
}

// Post type style definitions (for non-persona styles)
const getPostTypeStyle = (postType: string) => {
  switch (postType) {
    case "devrel":
      return {
        voice: "Developer Relations professional style",
        characteristics: [
          "Focus on developer experience and community building",
          "Balance technical depth with accessibility",
          "Include practical examples and use cases",
          "Encourage community engagement and feedback",
          "Reference developer tools and workflows",
          "Use a friendly, approachable tone",
        ],
        engagementStyle: "Ask questions that encourage developer discussion and sharing experiences",
      }

    case "technical":
      return {
        voice: "Technical expert style",
        characteristics: [
          "Focus on technical accuracy and depth",
          "Include specific implementation details",
          "Reference documentation and best practices",
          "Use precise technical terminology",
          "Provide code examples where relevant",
          "Discuss performance and scalability considerations",
        ],
        engagementStyle: "Encourage technical discussion and knowledge sharing",
      }

    case "tutorial":
      return {
        voice: "Educational tutorial style",
        characteristics: [
          "Break down complex concepts into digestible steps",
          "Use clear, instructional language",
          "Include step-by-step guidance",
          "Provide examples and practical exercises",
          "Anticipate common questions and challenges",
          "Use encouraging, supportive tone",
        ],
        engagementStyle: "Invite questions and offer additional help or resources",
      }

    case "opinion":
      return {
        voice: "Opinion leader style",
        characteristics: [
          "Express clear viewpoints and perspectives",
          "Back opinions with reasoning and evidence",
          "Acknowledge different viewpoints",
          "Use persuasive but respectful language",
          "Share personal experiences and insights",
          "Encourage thoughtful debate",
        ],
        engagementStyle: "Ask for others' opinions and experiences on the topic",
      }

    case "news":
      return {
        voice: "News reporter style",
        characteristics: [
          "Present information objectively and factually",
          "Include key details: who, what, when, where, why",
          "Use clear, concise language",
          "Provide context and background information",
          "Include relevant quotes or sources",
          "Maintain neutral, professional tone",
        ],
        engagementStyle: "Encourage sharing and discussion of the news",
      }

    case "story":
      return {
        voice: "Storytelling style",
        characteristics: [
          "Use narrative structure with beginning, middle, end",
          "Include personal anecdotes and experiences",
          "Create emotional connection with readers",
          "Use descriptive, engaging language",
          "Build tension and resolution",
          "Make complex topics relatable through stories",
        ],
        engagementStyle: "Invite readers to share their own related stories and experiences",
      }

    default:
      return null
  }
}

// Platform-specific formatting guidelines
const getPlatformGuidelines = (platform: string) => {
  switch (platform) {
    case "linkedin":
      return {
        format: "LinkedIn post",
        supportsMarkdown: false,
        guidelines: [
          "Start with a compelling hook that grabs attention",
          "Keep it professional but engaging and conversational",
          "Use line breaks for readability",
          "Include 3-5 relevant hashtags at the end",
          "Target 600-800 characters for optimal readability",
          "Maximum 1000 characters to keep it concise",
          "Add a question to encourage engagement",
          "NO EMOJIS - maintain professional tone without visual elements",
          "Use bullet points (•) for lists",
        ],
      }

    case "twitter":
      return {
        format: "Twitter/X thread (2-5 tweets)",
        supportsMarkdown: false,
        guidelines: [
          "Each tweet maximum 280 characters",
          "Start with a compelling hook in the first tweet",
          "NO EMOJIS - keep tweets clean and professional",
          "Include relevant hashtags (2-3 maximum)",
          "End with an engagement question or call-to-action",
          "Number each tweet (1/n, 2/n, etc.)",
          "Keep thread concise - 3-5 tweets maximum",
          "Use bullet points (•) for lists",
        ],
      }

    case "discord":
      return {
        format: "Discord post/message",
        supportsMarkdown: true,
        guidelines: [
          "Write in a conversational, community-friendly tone",
          "Use short paragraphs or bullet points for easy reading",
          "Emojis and GIF references are welcome, but don’t overdo them",
          "Highlight key points with **bold** or *italics* for emphasis",
          "Avoid long walls of text — split into multiple messages if needed",
          "Use @mentions only when relevant and necessary",
          "Include links as plain URLs or embedded if supported",
          "Encourage replies and community engagement with open-ended questions",
        ],
      }

    case "instagram":
      return {
        format: "Instagram post caption",
        supportsMarkdown: false,
        guidelines: [
          "Start with an attention-grabbing hook",
          "NO EMOJIS - focus on compelling text content",
          "Include relevant hashtags (20-30 hashtags at the end)",
          "Add a call-to-action",
          "Keep it engaging through words not visuals",
          "Maximum 2200 characters",
          "No external links (mention 'link in bio' only if necessary)",
        ],
      }

    case "facebook":
      return {
        format: "Facebook post",
        supportsMarkdown: false,
        guidelines: [
          "Start with an engaging hook",
          "Keep it conversational and friendly",
          "NO EMOJIS - keep content clean and professional",
          "Include a call-to-action",
          "Encourage comments and shares",
          "Maximum 500 words",
          "Only include links if they provide significant value",
        ],
      }

    case "medium":
      return {
        format: "Medium article introduction and outline",
        supportsMarkdown: true,
        guidelines: [
          "Write a compelling introduction (2-3 paragraphs)",
          "Create a detailed outline with main sections",
          "Include subheadings",
          "Suggest key points for each section",
          "Make it suitable for Medium's audience",
          "Use markdown formatting for links: [text](url)",
        ],
      }

    case "devto":
      return {
        format: "Dev.to post",
        supportsMarkdown: true,
        guidelines: [
          "Start with a developer-focused hook",
          "Use technical language appropriately",
          "NO EMOJIS - maintain technical professionalism",
          "Include relevant tags (4-5 maximum)",
          "Add code examples if applicable",
          "Encourage community discussion",
          "Only link to documentation or resources when essential",
          "Use markdown formatting for links: [text](url)",
        ],
      }

    case "hashnode":
      return {
        format: "Hashnode blog post",
        supportsMarkdown: true,
        guidelines: [
          "Technical and developer-focused",
          "Include relevant tags",
          "Start with a compelling introduction",
          "Structure with clear headings",
          "Add practical examples",
          "Encourage engagement",
          "Use markdown formatting for links: [text](url)",
        ],
      }

    case "reddit":
      return {
        format: "Reddit post",
        supportsMarkdown: true,
        guidelines: [
          "Write a catchy title",
          "Create engaging post content",
          "Be authentic and conversational",
          "Include relevant details",
          "Encourage discussion",
          "Follow Reddit etiquette",
          "Use markdown formatting for links: [text](url)",
        ],
      }

    case "youtube":
      return {
        format: "YouTube video description",
        supportsMarkdown: false,
        guidelines: [
          "Write a compelling description",
          "Include timestamps if applicable",
          "Add relevant keywords",
          "Include call-to-action",
          "Add social media links section",
          "Maximum 1000 words",
          "Include relevant links as plain URLs",
        ],
      }

    case "tiktok":
      return {
        format: "TikTok video script",
        supportsMarkdown: false,
        guidelines: [
          "Create a hook for the first 3 seconds",
          "Keep it under 60 seconds",
          "Make it engaging and visual",
          "Include trending hashtags",
          "Add a call-to-action",
          "Make it shareable",
          "Mention relevant links in the script",
        ],
      }

    default:
      return null
  }
}

// Generate content with persona or post type style
const generateStyledPlatformPrompt = async (
  platform: string,
  postType: string,
  title: string,
  content: string,
  link: string,
  keywords: string,
  extractedLinks: Array<{ url: string; text: string }> = [],
  includeSourceLink = false,
  clientPersonaTrainingData?: string | null,
) => {
  const platformGuidelines = getPlatformGuidelines(platform)
  if (!platformGuidelines) {
    return null
  }

  // Determine content type based on platform
  const blogPlatforms = ["medium", "devto", "hashnode"]
  const contentType = blogPlatforms.includes(platform) ? "blogs" : "posts"

  // Format links based on platform support
  const formatLinks = (links: Array<{ url: string; text: string }>) => {
    if (links.length === 0) return ""

    if (platformGuidelines.supportsMarkdown) {
      return links.map((link) => `[${link.text}](${link.url})`).join(", ")
    } else {
      return links.map((link) => link.url).join(", ")
    }
  }

  const formattedLinks = formatLinks(extractedLinks)
  const linksInstruction =
    extractedLinks.length > 0 ? `Include these relevant links from the article: ${formattedLinks}` : ""

  const sourceInstruction = includeSourceLink ? `Include the source article link (${link}) for proper attribution.` : ""

  // Check if it's a trained persona
  const standardPostTypes = ["devrel", "technical", "tutorial", "opinion", "news", "story", "custom"]
  const isPersona = postType && !standardPostTypes.includes(postType)

  if (isPersona) {
    let trainingData = clientPersonaTrainingData
    let personaAnalysis: any = null
    
    if (!trainingData) {
      const result = await loadPersonaTrainingDataWithAnalysis(postType, contentType)
      trainingData = result.content
      personaAnalysis = result.analysis
    }

    if (trainingData) {
      const keywordText = keywords ? `Include these keywords naturally: ${keywords}.` : ""
      const contentTypeText = contentType === "blogs" ? "blog-style" : "social media post-style"

      // Build enhanced persona context with advanced analysis
      let personaContext = ""
      if (personaAnalysis) {
        const { description, domain, writingPatterns, analytics, instructions, multiModalPreferences } = personaAnalysis
        
        personaContext = `
PERSONA PROFILE:
${description ? `- Role: ${description}` : ""}
${domain ? `- Expertise: ${domain.join(", ")}` : ""}
${instructions ? `- Special Instructions: ${instructions}` : ""}

ADVANCED WRITING STYLE ANALYSIS:
${writingPatterns?.tone ? `- Tone: ${writingPatterns.tone.join(", ")}` : ""}
${writingPatterns?.structure ? `- Structure: ${writingPatterns.structure.join(", ")}` : ""}
${writingPatterns?.vocabulary ? `- Vocabulary: ${writingPatterns.vocabulary.join(", ")}` : ""}
${writingPatterns?.engagement ? `- Engagement: ${writingPatterns.engagement.join(", ")}` : ""}
${writingPatterns?.sentiment ? `- Sentiment: ${writingPatterns.sentiment.dominant} (${writingPatterns.sentiment.emotionalRange.join(", ")})` : ""}
${writingPatterns?.readability ? `- Readability: ${writingPatterns.readability.complexityLevel} level (${writingPatterns.readability.fleschKincaid} grade)` : ""}

CONTENT FOCUS AREAS:
${analytics?.commonTopics ? `- Topics: ${analytics.commonTopics.join(", ")}` : ""}
${analytics?.keyPhrases ? `- Key Phrases: ${analytics.keyPhrases.slice(0, 10).join(", ")}` : ""}
${analytics?.writingComplexity ? `- Complexity: ${analytics.writingComplexity}` : ""}
${analytics?.semanticClusters ? `- Semantic Clusters: ${analytics.semanticClusters.map((c: any) => `${c.topic} (${c.sentiment})`).join(", ")}` : ""}

STYLISTIC PATTERNS:
${analytics?.stylisticFingerprint?.punctuationPatterns ? `- Punctuation: ${analytics.stylisticFingerprint.punctuationPatterns.join(", ")}` : ""}
${analytics?.stylisticFingerprint?.emphasisMarkers ? `- Emphasis: ${analytics.stylisticFingerprint.emphasisMarkers.join(", ")}` : ""}
${analytics?.stylisticFingerprint?.transitionWords ? `- Transitions: ${analytics.stylisticFingerprint.transitionWords.join(", ")}` : ""}

${multiModalPreferences ? generateMultiModalPromptServer(multiModalPreferences) : ""}
`
      }

      return `You are an expert content creator specializing in persona-based writing. Study the ${contentTypeText} writing examples below and learn the author's unique voice, tone, style, and language patterns. Use the persona analysis to understand the deeper characteristics of their writing style.

${personaContext}

STRICT CONTENT RULES:
- DO NOT use any emojis anywhere in the content
- Focus on professional, clean text formatting
- Match the persona's natural tone and vocabulary patterns
- Use the same structural elements they prefer (bullet points, formatting, etc.)
- Only include links when they are specifically asked in the custom instructions
- Never output links as a standalone line or as a list. Only mention a link inside a paragraph if the sentence is specifically discussing that link or resource.

WRITING EXAMPLES TO LEARN FROM (${contentType.toUpperCase()} STYLE):
${trainingData}

PLATFORM REQUIREMENTS for ${platformGuidelines.format}:
${platformGuidelines.guidelines.map((guide) => `- ${guide}`).join("\n")}

ADVANCED PERSONA WRITING INSTRUCTIONS:
- Mirror the tone patterns identified in the analysis (${personaAnalysis?.writingPatterns?.tone?.join(", ") || "maintain consistent tone"})
- Use the preferred structural elements (${personaAnalysis?.writingPatterns?.structure?.join(", ") || "clear structure"})
- Incorporate vocabulary style that matches the persona (${personaAnalysis?.writingPatterns?.vocabulary?.join(", ") || "appropriate vocabulary"})
- Apply engagement patterns naturally (${personaAnalysis?.writingPatterns?.engagement?.join(", ") || "engage readers appropriately"})
${personaAnalysis?.writingPatterns?.sentiment ? `- Maintain emotional range: ${personaAnalysis.writingPatterns.sentiment.emotionalRange.join(", ")} with ${personaAnalysis.writingPatterns.sentiment.dominant} sentiment` : ""}
${personaAnalysis?.writingPatterns?.readability ? `- Target ${personaAnalysis.writingPatterns.readability.complexityLevel} reading level with average ${Math.round(personaAnalysis.writingPatterns.readability.averageWordsPerSentence)} words per sentence` : ""}
${personaAnalysis?.analytics?.stylisticFingerprint?.punctuationPatterns ? `- Use punctuation patterns: ${personaAnalysis.analytics.stylisticFingerprint.punctuationPatterns.join(", ")}` : ""}
${personaAnalysis?.analytics?.stylisticFingerprint?.emphasisMarkers ? `- Apply emphasis methods: ${personaAnalysis.analytics.stylisticFingerprint.emphasisMarkers.join(", ")}` : ""}
${personaAnalysis?.instructions ? `- Special persona instructions: ${personaAnalysis.instructions}` : ""}

TASK:
Create a ${platformGuidelines.format} about the article below, written in the exact same ${contentTypeText} style as the examples above. The content should feel like it was written by the same person who created the training examples. ${keywordText} ${linksInstruction} ${sourceInstruction}

Article: "${title}"
Content: ${content}
${link ? `${link}` : ""}

${
  platformGuidelines.supportsMarkdown
    ? "Format links using markdown: [text](url)"
    : "Include links as plain URLs without markdown formatting"
}

Write as if you are the same person who wrote the examples above, incorporating their natural ${contentTypeText} writing style, personality, and approach to discussing topics within their expertise areas.`
    }
  }

  // Handle post type styles
  const postTypeStyle = getPostTypeStyle(postType)
  if (postTypeStyle) {
    const keywordText = keywords ? `Include these keywords naturally: ${keywords}.` : ""

    return `Create a ${platformGuidelines.format} in ${postTypeStyle.voice} based on this article. ${keywordText} ${linksInstruction} ${sourceInstruction}


STRICT RULES:
- DO NOT use any emojis anywhere in the content
- Focus on professional, clean text formatting
- Only include links when they add significant value
- Never output links as a standalone line or as a list. Only mention a link inside a paragraph if the sentence is specifically discussing that link or resource.

${postTypeStyle.voice} Characteristics:
${postTypeStyle.characteristics.map((char) => `- ${char}`).join("\n")}

Platform Guidelines for ${platformGuidelines.format}:
${platformGuidelines.guidelines.map((guide) => `- ${guide}`).join("\n")}

Style-Specific Requirements:
- ${postTypeStyle.engagementStyle}

Article: "${title}"
Content: ${content}
${link ? `${link}` : ""}

${
  platformGuidelines.supportsMarkdown
    ? "Format links using markdown: [text](url)"
    : "Include links as plain URLs without markdown formatting"
}`
  }

  // Fallback to standard platform content
  const keywordText = keywords ? `Include these keywords naturally: ${keywords}.` : ""
  const styleText = postType ? `Make it ${postType} style.` : ""

  return `Create a ${platformGuidelines.format} based on this article. ${styleText} ${keywordText} ${linksInstruction} ${sourceInstruction}


STRICT RULES:
- DO NOT use any emojis anywhere in the content
- Focus on professional, clean text formatting
- Never output links as a standalone line or as a list. Only mention a link inside a paragraph if the sentence is specifically discussing that link or resource.

Guidelines:
${platformGuidelines.guidelines.map((guide) => `- ${guide}`).join("\n")}

Article: "${title}"
Content: ${content}
${link ? `${link}` : ""}

${
  platformGuidelines.supportsMarkdown
    ? "Format links using markdown: [text](url)"
    : "Include links as plain URLs without markdown formatting"
}`
}

export async function POST(request: NextRequest) {
  try {
    const {
      content,
      title,
      link,
      type,
      keywords,
      postType,
      provider = "groq",
      apiKey,
      model,
      personaTrainingData,
      extractedLinks = [],
      includeSourceLink = false,
    } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // Select AI model based on provider
    let aiModel

    switch (provider) {
      case "groq":
        aiModel = groqClient.chat("llama-3.3-70b-versatile")
        break
      case "gemini":
        aiModel = geminiClient("models/gemini-2.0-flash")
        break
      case "openai":
        if (!apiKey) {
          return NextResponse.json({ error: "OpenAI API key is required" }, { status: 400 })
        }
        const openaiClient = createOpenAI({ apiKey })
        // Determine best model based on content type
        let defaultOpenAIModel = "gpt-5"; // Default for posts - using latest GPT-5
        if (type === "medium" || type === "devto" || type === "hashnode") {
          defaultOpenAIModel = "gpt-5"; // Best model for blog content - using GPT-5
        }
        aiModel = openaiClient.chat(model || defaultOpenAIModel)
        break
      case "anthropic":
        if (!apiKey) {
          return NextResponse.json({ error: "Anthropic API key is required" }, { status: 400 })
        }
        const anthropicClient = createAnthropic({ apiKey })
        // Use Claude Opus for blog content, Sonnet for posts
        let defaultAnthropicModel = "claude-3-5-sonnet-20241022"; // Default for posts
        if (type === "medium" || type === "devto" || type === "hashnode") {
          defaultAnthropicModel = "claude-opus-4-1-20250805"; // Best for blog content
        }
        aiModel = anthropicClient(model || defaultAnthropicModel)
        break
      default:
        return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
    }

    let prompt = ""
    const keywordText = keywords ? `Include these keywords naturally: ${keywords}.` : ""

    // Handle special content types (summary, mermaid)
    if (type === "summary") {
      prompt = `Summarize the following article in 2-3 concise paragraphs. Focus on the key points and main takeaways. ${keywordText}

Article: "${title}"
Content: ${content}
Source: ${link || "N/A"}`
    } else if (type === "mermaid") {
      prompt = `You are an expert at creating Mermaid diagrams. Create a flowchart diagram based on the content provided.

Content: "${title}\n\n${content}"

CRITICAL FORMATTING RULES - FOLLOW EXACTLY:

1. ALWAYS start with: flowchart TD
2. Use ONLY alphanumeric identifiers (A, B, C, D1, D2, etc.) - NEVER use quotes around identifiers
3. Use square brackets with quotes for labels: A["Label Text"]
4. Connect using identifiers only: A --> B (NOT "A" --> "B")

CORRECT FORMAT EXAMPLE:
flowchart TD
    A["Main Topic"] --> B["Branch 1"]
    A --> C["Branch 2"]
    B --> B1["Sub-item 1"]
    B --> B2["Sub-item 2"]
    C --> C1["Sub-item 1"]
    C --> C2["Sub-item 2"]

WRONG FORMATS TO AVOID:
- "A" --> "B" (quoted identifiers)
- A["Label"] --> "B["Label2"] (mixed format)
- A[""Label""] (double quotes in labels)

STRUCTURE GUIDELINES:
1. Start with main concept as A
2. Create 3-5 primary branches (B, C, D, E)
3. Add sub-items using numbered identifiers (B1, B2, C1, C2)
4. Keep labels concise but descriptive
5. Ensure logical flow and relationships

Generate ONLY the Mermaid diagram code following the exact format above:`
    } else {
      // Handle platform-specific content with styling
      prompt =
        (await generateStyledPlatformPrompt(
          type,
          postType,
          title,
          content,
          link || "",
          keywords,
          extractedLinks,
          includeSourceLink,
          personaTrainingData,
        )) ?? ""

      if (!prompt) {
        return NextResponse.json({ error: "Invalid generation type" }, { status: 400 })
      }
    }

    const { text } = await generateText({
      model: aiModel,
      prompt,
      temperature: type === "mermaid" ? 0.3 : 0.7,
    })

    // Clean up Mermaid diagrams
    let finalContent = text
    if (type === "mermaid") {
      // Remove markdown code blocks
      finalContent = finalContent.replace(/```mermaid\n?/gi, "").replace(/```/g, "")

      // Remove any explanatory text before the diagram
      const lines = finalContent.split("\n")
      const diagramStartIndex = lines.findIndex((line) => /^flowchart\s+(TD|TB|BT|RL|LR)/i.test(line.trim()))

      if (diagramStartIndex !== -1) {
        // Only keep diagram lines until we hit an invalid line
        const diagramLines = []

        for (let i = diagramStartIndex; i < lines.length; i++) {
          const line = lines[i].trim()

          // Stop collecting if it's clearly not part of the diagram
          if (/^(Let me know|If you need|I'm here|Hope that helps|Feel free)/i.test(line)) break
          if (line === "") continue

          diagramLines.push(line)
        }

        finalContent = diagramLines.join("\n")
      }

      // Remove lingering markdown/code hints or assistant-style phrases
      finalContent = finalContent.replace(/^(Let me know|Hope this helps|I'm here.*)/gim, "").trim()

      // Ensure it starts with flowchart if not present
      if (!/^flowchart\s+(TD|TB|BT|RL|LR)/i.test(finalContent)) {
        finalContent = `flowchart TD\n${finalContent}`
      }
    }

    return NextResponse.json({ content: finalContent, provider })
  } catch (error) {
    console.error("AI generation error:", error)

    // Handle specific API errors
    let errorMessage = "Failed to generate AI content. Please try again."
    let errorDetails = ""
    let provider = "unknown"

    if (error instanceof Error) {
      // Handle OpenAI quota errors
      if (error.message.includes("exceeded your current quota")) {
        errorMessage = "OpenAI API quota exceeded"
        errorDetails =
          "Please check your OpenAI billing and usage limits, or try using a different provider like Groq or Gemini."
        provider = "openai"
      }
      // Handle Anthropic quota errors
      else if (error.message.includes("credit balance is too low")) {
        errorMessage = "Anthropic API credit balance too low"
        errorDetails = "Please add credits to your Anthropic account or try using a different provider."
        provider = "anthropic"
      }
      // Handle invalid API key errors
      else if (error.message.includes("Invalid API key") || error.message.includes("Incorrect API key")) {
        errorMessage = "Invalid API key"
        errorDetails = "Please check your API key configuration and try again."
        provider = error.message.includes("OpenAI")
          ? "openai"
          : error.message.includes("Anthropic")
            ? "anthropic"
            : "unknown"
      }
      // Handle rate limiting
      else if (error.message.includes("rate limit") || error.message.includes("too many requests")) {
        errorMessage = "Rate limit exceeded"
        errorDetails = "Please wait a moment before trying again, or switch to a different provider."
        provider = error.message.includes("OpenAI")
          ? "openai"
          : error.message.includes("Anthropic")
            ? "anthropic"
            : "unknown"
      }
      // Handle model not found errors
      else if (error.message.includes("model") && error.message.includes("not found")) {
        errorMessage = "Model not available"
        errorDetails = "The selected model is not available. Please try a different model or provider."
        provider = error.message.includes("OpenAI")
          ? "openai"
          : error.message.includes("Anthropic")
            ? "anthropic"
            : "unknown"
      }
      // Generic API errors
      else if (error.message.includes("API")) {
        errorMessage = "API Error"
        errorDetails = error.message
        provider = error.message.includes("OpenAI")
          ? "openai"
          : error.message.includes("Anthropic")
            ? "anthropic"
            : "unknown"
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        provider: provider,
      },
      { status: 500 },
    )
  }
}
