import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createAnthropic } from "@ai-sdk/anthropic"

// Initialize GROQ (OpenAI-compatible) and Gemini clients
const groqClient = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
})

const geminiClient = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

// Load training data from text files
async function loadPersonaTrainingData(personaName: string): Promise<string | null> {
  try {
    const fs = await import("fs").catch(() => null)
    const path = await import("path").catch(() => null)

    if (fs && path) {
      const filePath = path.join(process.cwd(), "training-data", `${personaName}-posts.txt`)
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf-8")
      }
    }
  } catch (error) {
    console.error(`Error loading ${personaName} training data:`, error)
  }
  return null
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
          "Maximum 1300 characters",
          "Add a call-to-action or question to encourage engagement",
          "Use emojis sparingly but effectively",
          "Include relevant links as plain URLs not more than 2-3 (no markdown formatting)",
        ],
      }

    case "twitter":
      return {
        format: "Twitter/X thread (2-5 tweets)",
        supportsMarkdown: false,
        guidelines: [
          "Each tweet maximum 280 characters",
          "Start with a compelling hook in the first tweet",
          "Use emojis appropriately to add personality",
          "Include relevant hashtags (2-3 per tweet max)",
          "End with an engagement question or call-to-action",
          "Number each tweet (1/n, 2/n, etc.)",
          "Include relevant links as plain URLs not more than 2-3(no markdown formatting)",
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
          "Encourage replies and community engagement with open-ended questions"
        ],
      }

    case "instagram":
      return {
        format: "Instagram post caption",
        supportsMarkdown: false,
        guidelines: [
          "Start with an attention-grabbing hook",
          "Use emojis strategically throughout",
          "Include relevant hashtags (10-15 hashtags)",
          "Add a call-to-action",
          "Keep it engaging and visual",
          "Maximum 2200 characters",
          "Include relevant links as plain URLs not more than 2-3 in bio reference",
        ],
      }

    case "facebook":
      return {
        format: "Facebook post",
        supportsMarkdown: false,
        guidelines: [
          "Start with an engaging hook",
          "Keep it conversational and friendly",
          "Use emojis moderately",
          "Include a call-to-action",
          "Encourage comments and shares",
          "Maximum 500 words",
          "Include relevant links as plain URLs not more than 2-3 as plain URLs",
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
          "Include relevant tags",
          "Add code examples if applicable",
          "Encourage community discussion",
          "Format for developer audience",
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
  extractedLinks: Array<{ url: string, text: string }> = [],
  includeSourceLink: boolean = false,
  clientPersonaTrainingData?: string | null,
) => {
  const platformGuidelines = getPlatformGuidelines(platform)
  if (!platformGuidelines) {
    return null
  }

  // Format links based on platform support
  const formatLinks = (links: Array<{ url: string, text: string }>) => {
    if (links.length === 0) return ""

    if (platformGuidelines.supportsMarkdown) {
      return links.map(link => `[${link.text}](${link.url})`).join(", ")
    } else {
      return links.map(link => link.url).join(", ")
    }
  }

  const formattedLinks = formatLinks(extractedLinks)
  const linksInstruction = extractedLinks.length > 0
    ? `Include these relevant links from the article: ${formattedLinks}`
    : ""

  const sourceInstruction = includeSourceLink
    ? `Include the source article link (${link}) for proper attribution.`
    : ""

  // Check if it's a trained persona
  const standardPostTypes = ["devrel", "technical", "tutorial", "opinion", "news", "story", "custom"]
  const isPersona = postType && !standardPostTypes.includes(postType)

  if (isPersona) {
    let trainingData = clientPersonaTrainingData
    if (!trainingData) {
      trainingData = await loadPersonaTrainingData(postType)
    }

    if (trainingData) {
      const keywordText = keywords ? `Include these keywords naturally: ${keywords}.` : ""

      return `You are an expert content creator. Study the writing examples below and learn the author's unique voice, tone, style, and language patterns. Then create a ${platformGuidelines.format} in that exact same style.

WRITING EXAMPLES TO LEARN FROM:
${trainingData}

PLATFORM REQUIREMENTS for ${platformGuidelines.format}:
${platformGuidelines.guidelines.map((guide) => `- ${guide}`).join("\n")}

TASK:
Create a ${platformGuidelines.format} about the article below, written in the exact same style as the examples above. ${keywordText} ${linksInstruction} ${sourceInstruction}

Article: "${title}"
Content: ${content}
${link ? `${link}` : ""}

${platformGuidelines.supportsMarkdown
          ? "Format links using markdown: [text](url)"
          : "Include links as plain URLs without markdown formatting"}

Write as if you are the same person who wrote the examples above, but adapt your natural style to fit the ${platform} platform requirements.`
    }
  }

  // Handle post type styles
  const postTypeStyle = getPostTypeStyle(postType)
  if (postTypeStyle) {
    const keywordText = keywords ? `Include these keywords naturally: ${keywords}.` : ""

    return `Create a ${platformGuidelines.format} in ${postTypeStyle.voice} based on this article. ${keywordText} ${linksInstruction} ${sourceInstruction}

${postTypeStyle.voice} Characteristics:
${postTypeStyle.characteristics.map((char) => `- ${char}`).join("\n")}

Platform Guidelines for ${platformGuidelines.format}:
${platformGuidelines.guidelines.map((guide) => `- ${guide}`).join("\n")}

Style-Specific Requirements:
- ${postTypeStyle.engagementStyle}

Article: "${title}"
Content: ${content}
${link ? `${link}` : ""}

${platformGuidelines.supportsMarkdown
        ? "Format links using markdown: [text](url)"
        : "Include links as plain URLs without markdown formatting"}`
  }

  // Fallback to standard platform content
  const keywordText = keywords ? `Include these keywords naturally: ${keywords}.` : ""
  const styleText = postType ? `Make it ${postType} style.` : ""

  return `Create a ${platformGuidelines.format} based on this article. ${styleText} ${keywordText} ${linksInstruction} ${sourceInstruction}

Guidelines:
${platformGuidelines.guidelines.map((guide) => `- ${guide}`).join("\n")}

Article: "${title}"
Content: ${content}
${link ? `${link}` : ""}

${platformGuidelines.supportsMarkdown
      ? "Format links using markdown: [text](url)"
      : "Include links as plain URLs without markdown formatting"}`
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
      prompt = await generateStyledPlatformPrompt(
        type,
        postType,
        title,
        content,
        link || "",
        keywords,
        extractedLinks,
        includeSourceLink,
        personaTrainingData,
      ) ?? ""

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
      finalContent = finalContent.replace(/\`\`\`mermaid\n?/gi, "").replace(/\`\`\`/g, "")

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
