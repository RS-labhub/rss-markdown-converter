import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createAnthropic } from "@ai-sdk/anthropic"

// Initialize AI clients
const groqClient = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
})

const geminiClient = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

interface SelectedPersona {
  id: string
  name: string
  type: "rss-author" | "trained-persona" | "built-in"
  weight: number
}

interface RSSItem {
  title: string
  content: string
  author: string
  date: string
  link: string
  markdown: string
}

interface PersonaData {
  name: string
  rawContent: string
  instructions?: string
  createdAt: string
  isBuiltIn?: boolean
  contentType?: "posts" | "blogs" | "mixed"
}

// Load built-in persona training data
async function loadBuiltInPersonaData(personaName: string, contentType: "posts" | "blogs"): Promise<string | null> {
  try {
    const fs = await import("fs").catch(() => null)
    const path = await import("path").catch(() => null)

    if (fs && path) {
      const suffix = contentType === "blogs" ? "blogs" : "posts"
      const filePath = path.join(process.cwd(), "training-data", `${personaName}-${suffix}.txt`)

      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf-8")
      }

      // Fallback to posts if blogs don't exist
      if (contentType === "blogs") {
        const fallbackPath = path.join(process.cwd(), "training-data", `${personaName}-posts.txt`)
        if (fs.existsSync(fallbackPath)) {
          return fs.readFileSync(fallbackPath, "utf-8")
        }
      }
    }
  } catch (error) {
    console.error(`Error loading ${personaName} training data:`, error)
  }
  return null
}

// Load custom persona training data from request
function getCustomPersonaData(customPersonas: PersonaData[], personaName: string): PersonaData | null {
  return customPersonas.find((p) => p.name === personaName) || null
}

// Extract writing samples from RSS articles
function extractWritingSamples(articles: RSSItem[], maxSamples = 10): string {
  const samples = articles
    .slice(0, maxSamples)
    .map((article, index) => {
      return `## Sample ${index + 1}: ${article.title}

${article.content.substring(0, 2000)}${article.content.length > 2000 ? "..." : ""}

---`
    })
    .join("\n\n")

  return samples
}

type PlatformGuideline = {
  format: string
  guidelines: string[]
}

// Get platform-specific guidelines
const guidelines: Record<string, PlatformGuideline> = {
  linkedin: {
    format: "LinkedIn post",
    guidelines: [
      "Start with a compelling hook",
      "Keep it professional but engaging",
      "Use line breaks for readability",
      "Include 3-5 relevant hashtags",
      "Maximum 1300 characters",
      "Add a call-to-action",
    ],
  },
  twitter: {
    format: "Twitter/X thread",
    guidelines: [
      "Each tweet maximum 280 characters",
      "Start with a compelling hook",
      "Use emojis appropriately",
      "Include relevant hashtags",
      "Number each tweet (1/n, 2/n, etc.)",
    ],
  },
  medium: {
    format: "Medium article",
    guidelines: [
      "Write a compelling introduction",
      "Create a detailed outline with main sections",
      "Include subheadings",
      "Make it suitable for Medium's audience",
      "Use markdown formatting",
    ],
  },
  devto: {
    format: "Dev.to post",
    guidelines: [
      "Start with a developer-focused hook",
      "Use technical language appropriately",
      "Include relevant tags",
      "Add code examples if applicable",
      "Encourage community discussion",
    ],
  },
}

function getPlatformGuidelines(platform: string): PlatformGuideline {
  return (
    guidelines[platform] || {
      format: `${platform} post`,
      guidelines: ["Create engaging content", "Use appropriate tone", "Include relevant hashtags"],
    }
  )
}

// Generate mixed content prompt
async function generateMixedContentPrompt(
  selectedPersonas: SelectedPersona[],
  contentType: "blog" | "post",
  platform: string,
  topic: string,
  keywords: string,
  context: string,
  rssItems: RSSItem[],
  customPersonas: PersonaData[] = [],
): Promise<string> {
  const platformGuidelines = getPlatformGuidelines(platform)
  const keywordText = keywords ? `Include these keywords naturally: ${keywords}.` : ""
  const contextText = context ? `Additional context: ${context}` : ""

  let personaInstructions = ""
  let trainingExamples = ""
  let customInstructions = ""

  // Process each selected persona
  for (const persona of selectedPersonas) {
    const weight = Math.round(persona.weight * 100)

    if (persona.type === "rss-author") {
      // Get articles from this author
      const authorArticles = rssItems.filter((item) => item.author === persona.name)
      if (authorArticles.length > 0) {
        const samples = extractWritingSamples(authorArticles, 5)
        trainingExamples += `\n\n### ${persona.name}'s Writing Style (${weight}% influence):\n${samples}`
        personaInstructions += `- ${weight}% of the content should reflect ${persona.name}'s writing style and voice\n`
      }
    } else if (persona.type === "built-in") {
      // Load built-in persona data
      const trainingData = await loadBuiltInPersonaData(persona.name, contentType === "blog" ? "blogs" : "posts")
      if (trainingData) {
        trainingExamples += `\n\n### ${persona.name}'s Writing Style (${weight}% influence):\n${trainingData}`
        personaInstructions += `- ${weight}% of the content should reflect ${persona.name}'s writing style and voice\n`
      }

      // Check for custom instructions for built-in personas
      const builtInInstructions = customPersonas.find(
        (p) => p.name === `${persona.name}-instructions` && p.isBuiltIn,
      )?.instructions
      if (builtInInstructions) {
        customInstructions += `\n\n### Custom Instructions for ${persona.name} (${weight}% influence):\n${builtInInstructions}`
      }
    } else if (persona.type === "trained-persona") {
      // Load custom persona data
      const customPersona = getCustomPersonaData(customPersonas, persona.name)
      if (customPersona) {
        trainingExamples += `\n\n### ${persona.name}'s Writing Style (${weight}% influence):\n${customPersona.rawContent}`
        personaInstructions += `- ${weight}% of the content should reflect ${persona.name}'s trained writing style\n`

        // Add custom instructions if available
        if (customPersona.instructions) {
          customInstructions += `\n\n### Custom Instructions for ${persona.name} (${weight}% influence):\n${customPersona.instructions}`
        }
      }
    }
  }

  return `You are an expert content creator who can blend multiple writing styles seamlessly. Create a ${platformGuidelines.format} about "${topic}" by mixing the writing styles of the provided authors/personas according to their specified weights.

WRITING STYLE EXAMPLES TO LEARN FROM:
${trainingExamples}

STYLE MIXING INSTRUCTIONS:
${personaInstructions}

${customInstructions ? `CUSTOM WRITING INSTRUCTIONS:${customInstructions}` : ""}

PLATFORM REQUIREMENTS for ${platformGuidelines.format}:
${platformGuidelines.guidelines.map((guide: any) => `- ${guide}`).join("\n")}

TASK:
Create a ${platformGuidelines.format} about "${topic}" that seamlessly blends the writing styles above according to their weights. ${keywordText} ${contextText}

The content should feel natural and cohesive, not like separate sections from different authors. Blend their:
- Tone and voice
- Sentence structure and rhythm  
- Technical depth and approach
- Engagement style and personality
- Vocabulary and expressions

${customInstructions ? "Follow the custom instructions provided for each persona while maintaining their specified influence weight." : ""}

Make it feel like a single, unified piece of content that incorporates the best elements of each style according to their weights.`
}

export async function POST(request: NextRequest) {
  try {
    const {
      selectedPersonas,
      contentType,
      platform,
      topic,
      keywords,
      context,
      provider = "groq",
      apiKey,
      model,
      rssItems = [],
      customPersonas = [],
    } = await request.json()

    if (!selectedPersonas || selectedPersonas.length === 0) {
      return NextResponse.json({ error: "At least one persona must be selected" }, { status: 400 })
    }

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 })
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
        aiModel = openaiClient.chat(model || "gpt-4o")
        break
      case "anthropic":
        if (!apiKey) {
          return NextResponse.json({ error: "Anthropic API key is required" }, { status: 400 })
        }
        const anthropicClient = createAnthropic({ apiKey })
        aiModel = anthropicClient(model || "claude-3-5-sonnet-20241022")
        break
      default:
        return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
    }

    // Generate the mixed content prompt
    const prompt = await generateMixedContentPrompt(
      selectedPersonas,
      contentType,
      platform,
      topic,
      keywords || "",
      context || "",
      rssItems,
      customPersonas,
    )

    const { text } = await generateText({
      model: aiModel,
      prompt,
      temperature: 0.7,
    })

    return NextResponse.json({ content: text, provider })
  } catch (error) {
    console.error("Author content generation error:", error)

    // Handle specific API errors
    let errorMessage = "Failed to generate mixed content. Please try again."
    let errorDetails = ""
    let provider = "unknown"

    if (error instanceof Error) {
      if (error.message.includes("exceeded your current quota")) {
        errorMessage = "OpenAI API quota exceeded"
        errorDetails = "Please check your OpenAI billing and usage limits, or try using a different provider."
        provider = "openai"
      } else if (error.message.includes("credit balance is too low")) {
        errorMessage = "Anthropic API credit balance too low"
        errorDetails = "Please add credits to your Anthropic account or try using a different provider."
        provider = "anthropic"
      } else if (error.message.includes("Invalid API key")) {
        errorMessage = "Invalid API key"
        errorDetails = "Please check your API key configuration and try again."
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded"
        errorDetails = "Please wait a moment before trying again, or switch to a different provider."
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
