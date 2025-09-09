import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createAnthropic } from "@ai-sdk/anthropic"
import { getAPIKey } from "@/lib/api-key-manager-server"

// Initialize AI clients
const groqClient = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
})

const geminiClient = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
})

// Load persona training data with analysis
async function loadPersonaTrainingDataWithAnalysis(personaName: string, contentType?: "posts" | "blogs"): Promise<{
  content: string | null
  analysis?: {
    writingPatterns?: any
    analytics?: any
    description?: string
    domain?: string[]
    instructions?: string
  }
}> {
  try {
    const fs = await import("fs").catch(() => null)
    const path = await import("path").catch(() => null)

    if (fs && path) {
      // Load training content
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

      // For built-in personas, provide enhanced analysis
      let analysis = undefined
      if (personaName === "bap") {
        analysis = {
          writingPatterns: {
            tone: ["technical", "educational", "community-focused"],
            structure: ["problem-solution", "examples with code", "community insights"],
            language: ["developer terminology", "inclusive language", "collaborative tone"]
          },
          analytics: {
            engagement: ["asks questions", "builds community", "shares experiences"],
            audience: ["developers", "community builders", "tech enthusiasts"]
          },
          description: "Developer Advocate with focus on community building and technical education",
          domain: ["developer advocacy", "community building", "technical content", "open source"],
          instructions: "Write comments that engage the community, ask thoughtful questions, and provide additional value or perspective. Use a warm, inclusive tone that encourages discussion."
        }
      } else if (personaName === "simon") {
        analysis = {
          writingPatterns: {
            tone: ["approachable", "storytelling", "personal"],
            structure: ["narrative flow", "personal insights", "community examples", "story-telling"],
            language: ["conversational", "relatable", "encouraging"]
          },
          analytics: {
            engagement: ["personal anecdotes", "community questions", "shared experiences"],
            audience: ["general tech community", "learners", "professionals"]
          },
          description: "Tech storyteller focused on personal growth and community experiences",
          domain: ["technology", "personal development", "community", "career advice"],
          instructions: "Write comments that share personal experiences, encourage others, and create meaningful connections. Use storytelling elements and ask engaging questions."
        }
      } else if (personaName === "rohan-sharma") {
        analysis = {
          writingPatterns: {
            tone: ["analytical", "educational", "solution-oriented"],
            structure: ["problem analysis", "technical solutions", "practical examples"],
            language: ["precise", "technical", "clear explanations"]
          },
          analytics: {
            engagement: ["technical discussions", "solution sharing", "knowledge exchange"],
            audience: ["developers", "technical professionals", "learners"]
          },
          description: "Technical problem solver with focus on practical solutions and clear explanations",
          domain: ["software development", "problem solving", "technical education", "best practices"],
          instructions: "Write comments that provide technical insights, offer solutions, and clarify complex topics. Focus on practical value and clear explanations."
        }
      }

      return { content, analysis }
    }

    return { content: null }
  } catch (error) {
    console.error(`Error loading ${personaName} training data with analysis:`, error)
    return { content: null }
  }
}

// Comment generation prompt
const generateCommentsPrompt = async (
  title: string,
  content: string,
  link: string,
  personaName: string,
  keywords: string,
  clientPersonaTrainingData?: string | null,
) => {
  let personaData = null
  let personaAnalysis = null

  // Load persona training data if persona is specified
  if (personaName && personaName !== "general") {
    if (clientPersonaTrainingData) {
      personaData = clientPersonaTrainingData
    } else {
      const result = await loadPersonaTrainingDataWithAnalysis(personaName)
      personaData = result.content
      personaAnalysis = result.analysis
    }
  }

  const keywordText = keywords ? `Consider these keywords when relevant: ${keywords}.` : ""

  let personaInstructions = ""
  if (personaData && personaAnalysis) {
    personaInstructions = `
PERSONA CONTEXT:
You are generating comments in the style of ${personaName}. Here's the persona profile:

Description: ${personaAnalysis.description}
Domain expertise: ${personaAnalysis.domain?.join(", ")}
Writing style: ${personaAnalysis.writingPatterns?.tone?.join(", ")}
Engagement approach: ${personaAnalysis.analytics?.engagement?.join(", ")}

Instructions: ${personaAnalysis.instructions}

Training data sample (to understand the writing style):
${personaData.substring(0, 1500)}...

Based on this persona, write comments that match their voice, expertise, and engagement style.`
  } else if (personaName && personaName !== "general") {
    personaInstructions = `
PERSONA CONTEXT:
Generate comments in the style of ${personaName}. Make the comments authentic to this persona's voice and perspective.`
  }

  return `You are a social media engagement expert. Generate 5-10 high-quality, diverse comments for the following article. Each comment should be unique, engaging, and add value to the discussion.

${personaInstructions}

ARTICLE DETAILS:
Title: "${title}"
Content: ${content.substring(0, 2000)}${content.length > 2000 ? "..." : ""}
Source: ${link || "N/A"}

${keywordText}

COMMENT REQUIREMENTS:
1. Generate exactly 5-10 comments of VARYING TYPES and LENGTHS
2. Create a MIX of different comment styles:
   
   SHORT COMMENTS (1 sentence):
   - Praise comments: "Great insight!" or "This is exactly what I needed!"
   - Agreement comments: "Completely agree with this approach."
   - Appreciation comments: "Thanks for sharing this!"
   
   MEDIUM COMMENTS (2-3 sentences):
   - Highlight comments: Point out specific valuable parts of the article
   - Experience sharing: Share a brief related experience or insight
   - Appreciation with detail: Explain why something was helpful
   
   LONGER COMMENTS (3-5 sentences):
   - Thoughtful questions: Ask meaningful questions that spark discussion
   - Detailed insights: Add complementary information or different perspectives
   - Story sharing: Share a relevant story or detailed experience
   
3. VARY THE COMMENT TYPES - Include:
   - 2-3 praise/appreciation comments (short to medium)
   - 2-3 highlight/insight comments (medium to long) 
   - 1-2 thoughtful question comments (medium to long)
   - 1-2 experience/story sharing comments (medium to long)

4. Make comments feel authentic and human
5. Avoid being overly promotional or repetitive
6. Each comment should add unique value
7. Use varied vocabulary and sentence structures

${personaName && personaName !== "general" ? 
  `8. All comments must match the persona's voice, expertise, and engagement style
9. Use vocabulary and topics that align with the persona's domain` : 
  "8. Use a friendly, professional tone appropriate for the topic"}

FORMAT: Return each comment on a separate line, numbered 1-10. Do not include any additional text or explanations.

EXAMPLE OUTPUT:
1. Excellent breakdown of this complex topic! Really appreciate the clear examples.
2. This reminds me of a similar challenge I faced last year - your solution would have saved me hours of debugging.
3. The section about performance optimization was particularly insightful. Have you considered how this approach scales with larger datasets?
4. Thanks for sharing this! Bookmarking for future reference.
5. I've been struggling with this exact issue. Your step-by-step approach makes it so much clearer.
6. Great article! The practical examples really help solidify the concepts.
7. This is a game-changer for our team's workflow. We've been looking for exactly this kind of solution.
8. Fantastic write-up! I especially loved how you explained the trade-offs between different approaches. Have you tested this in production environments?

ACTUAL COMMENTS:`
}

export async function POST(request: NextRequest) {
  try {
    const { title, content, link, provider, model, keyId, personaName, keywords, clientPersonaTrainingData, apiKey } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 })
    }

    // Validate provider
    const validProviders = ["groq", "gemini", "openai", "anthropic"]
    if (!validProviders.includes(provider)) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 })
    }

    // Initialize AI model based on provider
    let aiModel: any

    switch (provider) {
      case "groq":
        aiModel = groqClient.chat(model || "llama-3.1-8b-instant")
        break
      case "gemini":
        aiModel = geminiClient(model || "gemini-1.5-flash")
        break
      case "openai":
        if (!apiKey) {
          return NextResponse.json({ error: "OpenAI API key is required" }, { status: 400 })
        }
        const openaiClient = createOpenAI({ apiKey })
        aiModel = openaiClient.chat(model || "gpt-4o-mini")
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

    // Generate the prompt
    const prompt = await generateCommentsPrompt(
      title,
      content,
      link,
      personaName || "general",
      keywords || "",
      clientPersonaTrainingData
    )

    // Generate comments
    const result = await generateText({
      model: aiModel,
      prompt,
      temperature: 0.8, // Higher temperature for more diverse comments
    })

    // Parse the comments from the result
    const generatedText = result.text
    const commentLines = generatedText
      .split('\n')
      .filter(line => line.trim() && /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(comment => comment.length > 0)

    // Ensure we have 5-10 comments
    if (commentLines.length === 0) {
      return NextResponse.json({ error: "Failed to generate comments" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      comments: commentLines,
      count: commentLines.length,
      personaUsed: personaName || "general"
    })

  } catch (error) {
    console.error("Comment generation error:", error)
    return NextResponse.json({ 
      error: "Failed to generate comments", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}
