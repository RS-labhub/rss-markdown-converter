"use client"

interface WritingPatterns {
  tone: string[]          // e.g., ["professional", "casual", "enthusiastic"]
  structure: string[]     // e.g., ["bullet points", "numbered lists", "paragraphs"]
  vocabulary: string[]    // characteristic words/phrases
  sentenceLength: "short" | "medium" | "long" | "mixed"
  engagement: string[]    // e.g., ["questions", "call-to-action", "personal anecdotes"]
  sentiment: {            // New: sentiment analysis
    dominant: "positive" | "neutral" | "negative" | "mixed"
    distribution: { positive: number; neutral: number; negative: number }
    emotionalRange: string[] // e.g., ["optimistic", "analytical", "cautious"]
  }
  readability: {          // New: readability metrics
    fleschKincaid: number
    averageWordsPerSentence: number
    averageSyllablesPerWord: number
    complexityLevel: "elementary" | "middle" | "high-school" | "college" | "graduate"
  }
}

interface PersonaAnalytics {
  wordCount: number
  avgPostLength: number
  commonTopics: string[]
  keyPhrases: string[]
  writingComplexity: "simple" | "moderate" | "complex"
  lastAnalyzed: string
  // New: Advanced analytics
  semanticClusters?: Array<{
    topic: string
    keywords: string[]
    frequency: number
    sentiment: string
  }>
  stylisticFingerprint?: {
    punctuationPatterns: string[]
    capitalizationStyle: string
    emphasisMarkers: string[]
    transitionWords: string[]
  }
  temporalPatterns?: {
    timeReferences: string[]
    urgencyIndicators: string[]
    futureFocusScore: number
  }
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
  // New: Adaptive learning fields
  adaptiveLearning?: {
    feedbackHistory: Array<{
      generatedContent: string
      userFeedback: "positive" | "negative" | "neutral"
      improvements: string[]
      timestamp: string
    }>
    performanceMetrics: {
      averageRating: number
      totalGenerations: number
      successfulGenerations: number
      commonIssues: string[]
    }
    learningPatterns: {
      improvedAspects: string[]
      persistentWeaknesses: string[]
      adaptationSuggestions: string[]
    }
  }
  // New: Multi-modal content preferences
  multiModalPreferences?: {
    imageStyle: {
      preferredTypes: string[]  // e.g., ["diagrams", "screenshots", "illustrations"]
      frequency: "rare" | "occasional" | "frequent" | "always"
      placement: string[]       // e.g., ["intro", "middle", "conclusion"]
      captionStyle: string     // e.g., "descriptive", "technical", "minimal"
    }
    formatting: {
      headingStyle: string[]    // e.g., ["numbered", "descriptive", "question-based"]
      listPreference: "bullets" | "numbers" | "mixed"
      codeBlockUsage: "frequent" | "occasional" | "rare"
      tableUsage: "frequent" | "occasional" | "rare"
      quoteUsage: "frequent" | "occasional" | "rare"
    }
    mediaPatterns: {
      videoFrequency: "never" | "rare" | "occasional" | "frequent"
      linkingStyle: "inline" | "reference" | "mixed"
      citationPreference: "formal" | "informal" | "none"
      socialMediaIntegration: boolean
    }
  }
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
  
  // Advanced analytics
  const semanticClusters = extractSemanticClusters(content)
  const stylisticFingerprint = extractStylisticFingerprint(content)
  const temporalPatterns = extractTemporalPatterns(content)
  
  return {
    wordCount: words.length,
    avgPostLength: words.length / Math.max(paragraphs.length, 1),
    commonTopics: extractTopics(content),
    keyPhrases,
    writingComplexity: complexity,
    lastAnalyzed: new Date().toISOString(),
    semanticClusters,
    stylisticFingerprint,
    temporalPatterns
  }
}

export function extractWritingPatterns(content: string): WritingPatterns {
  const tone = analyzeTone(content)
  const structure = analyzeStructure(content)
  const vocabulary = extractVocabulary(content)
  const sentenceLength = analyzeSentenceLength(content)
  const engagement = analyzeEngagement(content)
  const sentiment = analyzeSentiment(content)
  const readability = analyzeReadability(content)
  
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

// New: Advanced sentiment analysis
function analyzeSentiment(content: string): {
  dominant: "positive" | "neutral" | "negative" | "mixed"
  distribution: { positive: number; neutral: number; negative: number }
  emotionalRange: string[]
} {
  const positiveWords = [
    "amazing", "excellent", "fantastic", "great", "awesome", "wonderful", "brilliant", 
    "outstanding", "impressive", "incredible", "powerful", "effective", "successful",
    "exciting", "innovative", "revolutionary", "breakthrough", "opportunity", "progress",
    "growth", "improvement", "solution", "benefit", "advantage", "love", "enjoy"
  ]
  
  const negativeWords = [
    "terrible", "awful", "horrible", "bad", "worst", "disappointing", "frustrating",
    "difficult", "challenging", "problem", "issue", "concern", "worry", "risk",
    "danger", "threat", "failure", "mistake", "error", "bug", "broken", "hate"
  ]
  
  const emotionalIndicators = {
    optimistic: ["future", "will", "can", "opportunity", "potential", "growth"],
    analytical: ["analysis", "data", "research", "study", "examine", "investigate"],
    cautious: ["however", "but", "careful", "consider", "might", "potential risk"],
    enthusiastic: ["!", "exciting", "amazing", "can't wait", "thrilled"],
    authoritative: ["should", "must", "recommend", "important", "critical", "essential"]
  }
  
  const words = content.toLowerCase().split(/\s+/)
  let positiveCount = 0
  let negativeCount = 0
  let totalWords = words.length
  
  // Count sentiment words
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++
  })
  
  // Calculate percentages
  const positivePerc = (positiveCount / totalWords) * 100
  const negativePerc = (negativeCount / totalWords) * 100
  const neutralPerc = 100 - positivePerc - negativePerc
  
  // Determine dominant sentiment
  let dominant: "positive" | "neutral" | "negative" | "mixed" = "neutral"
  if (positivePerc > negativePerc && positivePerc > 2) {
    dominant = "positive"
  } else if (negativePerc > positivePerc && negativePerc > 2) {
    dominant = "negative"
  } else if (Math.abs(positivePerc - negativePerc) < 1 && (positivePerc > 1 || negativePerc > 1)) {
    dominant = "mixed"
  }
  
  // Extract emotional range
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

// New: Advanced readability analysis
function analyzeReadability(content: string): {
  fleschKincaid: number
  averageWordsPerSentence: number
  averageSyllablesPerWord: number
  complexityLevel: "elementary" | "middle" | "high-school" | "college" | "graduate"
} {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = content.split(/\s+/).filter(w => w.length > 0)
  
  // Calculate syllables (approximation)
  function countSyllables(word: string): number {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    
    // Remove common endings that don't add syllables
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')
    
    // Count vowel groups
    const matches = word.match(/[aeiouy]{1,2}/g)
    return Math.max(1, matches ? matches.length : 1)
  }
  
  const totalSyllables = words.reduce((total, word) => total + countSyllables(word), 0)
  const avgWordsPerSentence = words.length / Math.max(sentences.length, 1)
  const avgSyllablesPerWord = totalSyllables / Math.max(words.length, 1)
  
  // Flesch-Kincaid Grade Level
  const fleschKincaid = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59
  
  // Determine complexity level
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

// New: Extract semantic clusters for better topic understanding
function extractSemanticClusters(content: string): Array<{
  topic: string
  keywords: string[]
  frequency: number
  sentiment: string
}> {
  const clusters = []
  const contentLower = content.toLowerCase()
  
  // Define semantic clusters with related terms
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
    },
    "DevOps/Infrastructure": {
      keywords: ["deployment", "infrastructure", "cloud", "docker", "kubernetes", "ci/cd", "automation", "scalability"],
      sentiment: "operational"
    },
    "Data & Analytics": {
      keywords: ["data", "analytics", "metrics", "insights", "visualization", "analysis", "statistics", "dashboard"],
      sentiment: "analytical"
    }
  }
  
  for (const [topic, group] of Object.entries(semanticGroups)) {
    const matchedKeywords = group.keywords.filter(keyword => contentLower.includes(keyword))
    if (matchedKeywords.length >= 2) {
      // Calculate frequency (simple word count)
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

// New: Extract stylistic fingerprint for unique writing characteristics
function extractStylisticFingerprint(content: string): {
  punctuationPatterns: string[]
  capitalizationStyle: string
  emphasisMarkers: string[]
  transitionWords: string[]
} {
  const punctuationPatterns: string[] = []
  const emphasisMarkers: string[] = []
  const transitionWords: string[] = []
  
  // Analyze punctuation patterns
  if ((content.match(/!/g) || []).length > 3) {
    punctuationPatterns.push("frequent exclamations")
  }
  if ((content.match(/\?/g) || []).length > 2) {
    punctuationPatterns.push("questioning style")
  }
  if (content.includes("...")) {
    punctuationPatterns.push("ellipsis usage")
  }
  if ((content.match(/;/g) || []).length > 1) {
    punctuationPatterns.push("semicolon preference")
  }
  if ((content.match(/:/g) || []).length > 2) {
    punctuationPatterns.push("colon usage")
  }
  
  // Analyze capitalization
  const upperCaseWords = content.match(/\b[A-Z]{2,}\b/g) || []
  const capitalizationStyle = upperCaseWords.length > 3 ? "emphasizes with caps" : "standard capitalization"
  
  // Find emphasis markers
  if (content.includes("**") || content.includes("__")) {
    emphasisMarkers.push("bold formatting")
  }
  if (content.includes("*") && !content.includes("**")) {
    emphasisMarkers.push("italic formatting")
  }
  if (content.includes("`")) {
    emphasisMarkers.push("code formatting")
  }
  if (content.match(/\b[A-Z]{2,}\b/)) {
    emphasisMarkers.push("capitalization emphasis")
  }
  
  // Find transition words
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

// New: Extract temporal patterns for time-based writing characteristics
function extractTemporalPatterns(content: string): {
  timeReferences: string[]
  urgencyIndicators: string[]
  futureFocusScore: number
} {
  const timeReferences: string[] = []
  const urgencyIndicators: string[] = []
  
  const timeWords = ["today", "tomorrow", "yesterday", "now", "soon", "recently", "future", "past", "current", "next", "this year", "2024", "2025"]
  const urgencyWords = ["urgent", "asap", "immediately", "critical", "quickly", "fast", "deadline", "rush", "priority"]
  const futureWords = ["will", "going to", "plan to", "expect", "predict", "anticipate", "upcoming", "future", "next"]
  
  const contentLower = content.toLowerCase()
  
  // Extract time references
  timeWords.forEach(word => {
    if (contentLower.includes(word)) {
      timeReferences.push(word)
    }
  })
  
  // Extract urgency indicators
  urgencyWords.forEach(word => {
    if (contentLower.includes(word)) {
      urgencyIndicators.push(word)
    }
  })
  
  // Calculate future focus score
  const futureMatches = futureWords.filter(word => contentLower.includes(word)).length
  const totalWords = content.split(/\s+/).length
  const futureFocusScore = Math.round((futureMatches / totalWords) * 1000) / 10 // percentage * 10 for precision
  
  return {
    timeReferences,
    urgencyIndicators,
    futureFocusScore
  }
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
    const multiModalPreferences = analyzeMultiModalPreferences(rawContent)
    
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
      version: "3.0", // Updated version for multi-modal support
      lastUpdated: new Date().toISOString(),
      multiModalPreferences,
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

// New: Adaptive learning functions
export function recordPersonaFeedback(
  personaName: string,
  generatedContent: string,
  userFeedback: "positive" | "negative" | "neutral",
  improvements: string[] = []
): void {
  if (typeof window === "undefined") return

  try {
    const persona = getPersonaTrainingData(personaName)
    if (!persona) throw new Error("Persona not found")

    // Initialize adaptive learning if not present
    if (!persona.adaptiveLearning) {
      persona.adaptiveLearning = {
        feedbackHistory: [],
        performanceMetrics: {
          averageRating: 0,
          totalGenerations: 0,
          successfulGenerations: 0,
          commonIssues: []
        },
        learningPatterns: {
          improvedAspects: [],
          persistentWeaknesses: [],
          adaptationSuggestions: []
        }
      }
    }

    // Add feedback to history
    persona.adaptiveLearning.feedbackHistory.push({
      generatedContent,
      userFeedback,
      improvements,
      timestamp: new Date().toISOString()
    })

    // Update performance metrics
    persona.adaptiveLearning.performanceMetrics.totalGenerations++
    if (userFeedback === "positive") {
      persona.adaptiveLearning.performanceMetrics.successfulGenerations++
    }

    // Recalculate average rating (positive=100, neutral=50, negative=0)
    const ratingValue = userFeedback === "positive" ? 100 : userFeedback === "neutral" ? 50 : 0
    const currentAvg = persona.adaptiveLearning.performanceMetrics.averageRating
    const totalGens = persona.adaptiveLearning.performanceMetrics.totalGenerations
    persona.adaptiveLearning.performanceMetrics.averageRating = 
      ((currentAvg * (totalGens - 1)) + ratingValue) / totalGens

    // Update common issues
    if (userFeedback === "negative" && improvements.length > 0) {
      improvements.forEach(issue => {
        if (!persona.adaptiveLearning!.performanceMetrics.commonIssues.includes(issue)) {
          persona.adaptiveLearning!.performanceMetrics.commonIssues.push(issue)
        }
      })
    }

    // Generate learning patterns
    updateLearningPatterns(persona)

    // Save updated persona
    const existingData = getStoredPersonaData()
    const filteredData = existingData.filter((p) => p.name !== persona.name)
    const updatedData = [...filteredData, { ...persona, lastUpdated: new Date().toISOString() }]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData))

  } catch (error) {
    console.error("Error recording persona feedback:", error)
    throw error
  }
}

function updateLearningPatterns(persona: PersonaData): void {
  if (!persona.adaptiveLearning) return

  const { feedbackHistory, performanceMetrics } = persona.adaptiveLearning
  
  // Analyze recent feedback (last 10 entries)
  const recentFeedback = feedbackHistory.slice(-10)
  const positiveCount = recentFeedback.filter(f => f.userFeedback === "positive").length
  const negativeCount = recentFeedback.filter(f => f.userFeedback === "negative").length

  // Identify improved aspects
  const improvedAspects: string[] = []
  if (positiveCount > negativeCount && performanceMetrics.averageRating > 70) {
    improvedAspects.push("Overall content quality improving")
  }

  // Identify persistent weaknesses
  const persistentWeaknesses: string[] = []
  const commonIssues = performanceMetrics.commonIssues
  if (commonIssues.length > 0) {
    // Issues that appear in recent feedback are persistent
    const recentIssues = recentFeedback.flatMap(f => f.improvements)
    persistentWeaknesses.push(...commonIssues.filter(issue => 
      recentIssues.includes(issue)
    ))
  }

  // Generate adaptation suggestions
  const adaptationSuggestions: string[] = []
  if (performanceMetrics.averageRating < 50) {
    adaptationSuggestions.push("Consider adding more diverse training examples")
  }
  if (persistentWeaknesses.length > 2) {
    adaptationSuggestions.push("Focus on addressing recurring issues in training content")
  }
  if (performanceMetrics.successfulGenerations / performanceMetrics.totalGenerations < 0.6) {
    adaptationSuggestions.push("Review and refine persona instructions")
  }

  persona.adaptiveLearning.learningPatterns = {
    improvedAspects,
    persistentWeaknesses,
    adaptationSuggestions
  }
}

export function getPersonaLearningInsights(personaName: string): {
  currentPerformance: {
    rating: number
    successRate: number
    totalGenerations: number
  }
  trends: {
    improving: boolean
    recentFeedback: string[]
    problematicAreas: string[]
  }
  recommendations: string[]
} | null {
  const persona = getPersonaTrainingData(personaName)
  if (!persona || !persona.adaptiveLearning) return null

  const { performanceMetrics, feedbackHistory, learningPatterns } = persona.adaptiveLearning

  // Calculate trends
  const recentFeedback = feedbackHistory.slice(-5).map(f => f.userFeedback)
  const recentPositive = recentFeedback.filter(f => f === "positive").length
  const improving = recentPositive > recentFeedback.length / 2

  const successRate = performanceMetrics.totalGenerations > 0 
    ? performanceMetrics.successfulGenerations / performanceMetrics.totalGenerations 
    : 0

  return {
    currentPerformance: {
      rating: Math.round(performanceMetrics.averageRating),
      successRate: Math.round(successRate * 100),
      totalGenerations: performanceMetrics.totalGenerations
    },
    trends: {
      improving,
      recentFeedback,
      problematicAreas: learningPatterns.persistentWeaknesses
    },
    recommendations: learningPatterns.adaptationSuggestions
  }
}

export function suggestPersonaImprovements(personaName: string): {
  contentSuggestions: string[]
  instructionUpdates: string[]
  trainingDataNeeds: string[]
} | null {
  const persona = getPersonaTrainingData(personaName)
  if (!persona) return null

  const suggestions = {
    contentSuggestions: [] as string[],
    instructionUpdates: [] as string[],
    trainingDataNeeds: [] as string[]
  }

  // Analyze based on adaptive learning
  if (persona.adaptiveLearning) {
    const { performanceMetrics, learningPatterns } = persona.adaptiveLearning

    // Content suggestions based on common issues
    performanceMetrics.commonIssues.forEach(issue => {
      if (issue.includes("tone")) {
        suggestions.contentSuggestions.push("Add more examples with consistent tone")
      }
      if (issue.includes("structure")) {
        suggestions.contentSuggestions.push("Include more varied structural examples")
      }
      if (issue.includes("technical")) {
        suggestions.contentSuggestions.push("Expand technical vocabulary and examples")
      }
    })

    // Instruction updates based on learning patterns
    if (learningPatterns.persistentWeaknesses.length > 0) {
      suggestions.instructionUpdates.push("Add specific guidance for addressing weak areas")
      suggestions.instructionUpdates.push("Include examples of preferred writing patterns")
    }

    // Training data needs
    if (performanceMetrics.averageRating < 70) {
      suggestions.trainingDataNeeds.push("More diverse content examples needed")
      suggestions.trainingDataNeeds.push("Focus on successful content patterns")
    }
  }

  // Analyze based on current analytics
  if (persona.analytics) {
    if (persona.analytics.wordCount < 1000) {
      suggestions.trainingDataNeeds.push("Increase training content volume")
    }
    if (persona.analytics.commonTopics.length < 3) {
      suggestions.trainingDataNeeds.push("Add content covering more topic areas")
    }
  }

  return suggestions
}

// New: Multi-modal content analysis
export function analyzeMultiModalPreferences(content: string): {
  imageStyle: {
    preferredTypes: string[]
    frequency: "rare" | "occasional" | "frequent" | "always"
    placement: string[]
    captionStyle: string
  }
  formatting: {
    headingStyle: string[]
    listPreference: "bullets" | "numbers" | "mixed"
    codeBlockUsage: "frequent" | "occasional" | "rare"
    tableUsage: "frequent" | "occasional" | "rare"
    quoteUsage: "frequent" | "occasional" | "rare"
  }
  mediaPatterns: {
    videoFrequency: "never" | "rare" | "occasional" | "frequent"
    linkingStyle: "inline" | "reference" | "mixed"
    citationPreference: "formal" | "informal" | "none"
    socialMediaIntegration: boolean
  }
} {
  // Analyze image preferences
  const imageReferences = (content.match(/!\[.*?\]/g) || []).length
  const totalParagraphs = content.split(/\n\s*\n/).length
  let imageFrequency: "rare" | "occasional" | "frequent" | "always" = "rare"
  
  if (imageReferences / totalParagraphs > 0.5) imageFrequency = "always"
  else if (imageReferences / totalParagraphs > 0.3) imageFrequency = "frequent"
  else if (imageReferences / totalParagraphs > 0.1) imageFrequency = "occasional"

  // Analyze image types and captions
  const preferredTypes: string[] = []
  const imageCaptions = content.match(/!\[(.*?)\]/g) || []
  
  if (imageCaptions.some(cap => /diagram|chart|graph|visual/.test(cap.toLowerCase()))) {
    preferredTypes.push("diagrams")
  }
  if (imageCaptions.some(cap => /screenshot|interface|ui/.test(cap.toLowerCase()))) {
    preferredTypes.push("screenshots")
  }
  if (imageCaptions.some(cap => /illustration|art|design/.test(cap.toLowerCase()))) {
    preferredTypes.push("illustrations")
  }

  // Determine caption style
  let captionStyle = "minimal"
  if (imageCaptions.length > 0) {
    const avgCaptionLength = imageCaptions.reduce((total, cap) => total + cap.length, 0) / imageCaptions.length
    if (avgCaptionLength > 50) captionStyle = "descriptive"
    else if (avgCaptionLength > 20) captionStyle = "technical"
  }

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

  // Table usage
  const tables = (content.match(/\|.*\|/g) || []).length
  let tableUsage: "frequent" | "occasional" | "rare" = "rare"
  
  if (tables > totalParagraphs * 0.2) tableUsage = "frequent"
  else if (tables > 0) tableUsage = "occasional"

  // Quote usage
  const quotes = (content.match(/^>/gm) || []).length
  let quoteUsage: "frequent" | "occasional" | "rare" = "rare"
  
  if (quotes > totalParagraphs * 0.2) quoteUsage = "frequent"
  else if (quotes > 0) quoteUsage = "occasional"

  // Media patterns
  const videoReferences = (content.match(/video|youtube|vimeo|mp4/gi) || []).length
  let videoFrequency: "never" | "rare" | "occasional" | "frequent" = "never"
  
  if (videoReferences > totalParagraphs * 0.2) videoFrequency = "frequent"
  else if (videoReferences > totalParagraphs * 0.1) videoFrequency = "occasional"
  else if (videoReferences > 0) videoFrequency = "rare"

  // Linking style
  const inlineLinks = (content.match(/\[.*?\]\(.*?\)/g) || []).length
  const referenceLinks = (content.match(/\[.*?\]:\s*http/g) || []).length
  let linkingStyle: "inline" | "reference" | "mixed" = "inline"
  
  if (referenceLinks > inlineLinks) linkingStyle = "reference"
  else if (referenceLinks > 0 && inlineLinks > 0) linkingStyle = "mixed"

  // Citation preference
  let citationPreference: "formal" | "informal" | "none" = "none"
  if (/\[\d+\]|\(.*?\d{4}.*?\)/.test(content)) citationPreference = "formal"
  else if (/source:|via:|h\/t:|credit:/.test(content.toLowerCase())) citationPreference = "informal"

  // Social media integration
  const socialMediaIntegration = /@\w+|#\w+|twitter|linkedin|instagram|facebook/.test(content.toLowerCase())

  return {
    imageStyle: {
      preferredTypes: preferredTypes.length > 0 ? preferredTypes : ["screenshots"],
      frequency: imageFrequency,
      placement: imageReferences > 0 ? ["middle"] : [],
      captionStyle
    },
    formatting: {
      headingStyle: headingStyle.length > 0 ? headingStyle : ["descriptive"],
      listPreference,
      codeBlockUsage,
      tableUsage,
      quoteUsage
    },
    mediaPatterns: {
      videoFrequency,
      linkingStyle,
      citationPreference,
      socialMediaIntegration
    }
  }
}

export function generateMultiModalPrompt(persona: PersonaData): string {
  if (!persona.multiModalPreferences) return ""

  const { imageStyle, formatting, mediaPatterns } = persona.multiModalPreferences
  const prompts: string[] = []

  // Image guidance
  if (imageStyle.frequency !== "rare") {
    prompts.push(`Include images ${imageStyle.frequency} with ${imageStyle.captionStyle} captions`)
    if (imageStyle.preferredTypes.length > 0) {
      prompts.push(`Prefer ${imageStyle.preferredTypes.join(", ")} style images`)
    }
  }

  // Formatting guidance
  if (formatting.headingStyle.length > 0) {
    prompts.push(`Use ${formatting.headingStyle.join(" and ")} heading styles`)
  }
  if (formatting.listPreference !== "bullets") {
    prompts.push(`Prefer ${formatting.listPreference} lists`)
  }
  if (formatting.codeBlockUsage === "frequent") {
    prompts.push("Include code examples frequently")
  }

  // Media patterns
  if (mediaPatterns.videoFrequency !== "never") {
    prompts.push(`Reference videos ${mediaPatterns.videoFrequency}`)
  }
  if (mediaPatterns.socialMediaIntegration) {
    prompts.push("Include social media references and hashtags where appropriate")
  }

  return prompts.length > 0 ? `Multi-modal preferences: ${prompts.join("; ")}.` : ""
}
