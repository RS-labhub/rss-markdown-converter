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

export async function POST(request: NextRequest) {
  try {
    const { 
      content, 
      title, 
      type, 
      keywords, 
      postType, 
      provider = "groq",
      apiKey,
      model 
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
    const styleText = postType ? `Make it ${postType} style.` : ""

    switch (type) {
      case "summary":
        prompt = `Summarize the following article in 2-3 concise paragraphs. Focus on the key points and main takeaways. ${keywordText}

Article: "${title}"
Content: ${content}`
        break

      case "linkedin":
        prompt = `Create a LinkedIn post based on this article. ${styleText} ${keywordText}
        
Guidelines:
- Start with a compelling hook that grabs attention
- Keep it professional but engaging and conversational
- Use line breaks for readability
- Include 3-5 relevant hashtags at the end
- Maximum 1300 characters
- Add a call-to-action or question to encourage engagement
- Use emojis sparingly but effectively

Article: "${title}"
Content: ${content}`
        break

      case "twitter":
        prompt = `Create a Twitter/X thread (2-5 tweets) based on this article. ${styleText} ${keywordText}
        
Guidelines:
- Each tweet maximum 280 characters
- Start with a compelling hook in the first tweet
- Use emojis appropriately to add personality
- Include relevant hashtags (2-3 per tweet max)
- End with an engagement question or call-to-action
- Number each tweet (1/n, 2/n, etc.)

Article: "${title}"
Content: ${content}`
        break

      case "instagram":
        prompt = `Create an Instagram post caption based on this article. ${styleText} ${keywordText}
        
Guidelines:
- Start with an attention-grabbing hook
- Use emojis strategically throughout
- Include relevant hashtags (10-15 hashtags)
- Add a call-to-action
- Keep it engaging and visual
- Maximum 2200 characters

Article: "${title}"
Content: ${content}`
        break

      case "facebook":
        prompt = `Create a Facebook post based on this article. ${styleText} ${keywordText}
        
Guidelines:
- Start with an engaging hook
- Keep it conversational and friendly
- Use emojis moderately
- Include a call-to-action
- Encourage comments and shares
- Maximum 500 words

Article: "${title}"
Content: ${content}`
        break

      case "medium":
        prompt = `Create a Medium article introduction and outline based on this content. ${styleText} ${keywordText}
        
Guidelines:
- Write a compelling introduction (2-3 paragraphs)
- Create a detailed outline with main sections
- Include subheadings
- Suggest key points for each section
- Make it suitable for Medium's audience

Article: "${title}"
Content: ${content}`
        break

      case "devto":
        prompt = `Create a Dev.to post based on this article. ${styleText} ${keywordText}
        
Guidelines:
- Start with a developer-focused hook
- Use technical language appropriately
- Include relevant tags
- Add code examples if applicable
- Encourage community discussion
- Format for developer audience

Article: "${title}"
Content: ${content}`
        break

      case "hashnode":
        prompt = `Create a Hashnode blog post based on this article. ${styleText} ${keywordText}
        
Guidelines:
- Technical and developer-focused
- Include relevant tags
- Start with a compelling introduction
- Structure with clear headings
- Add practical examples
- Encourage engagement

Article: "${title}"
Content: ${content}`
        break

      case "reddit":
        prompt = `Create a Reddit post based on this article. ${styleText} ${keywordText}
        
Guidelines:
- Write a catchy title
- Create engaging post content
- Be authentic and conversational
- Include relevant details
- Encourage discussion
- Follow Reddit etiquette

Article: "${title}"
Content: ${content}`
        break

      case "youtube":
        prompt = `Create a YouTube video description based on this article. ${styleText} ${keywordText}
        
Guidelines:
- Write a compelling description
- Include timestamps if applicable
- Add relevant keywords
- Include call-to-action
- Add social media links section
- Maximum 1000 words

Article: "${title}"
Content: ${content}`
        break

      case "tiktok":
        prompt = `Create a TikTok video script based on this article. ${styleText} ${keywordText}
        
Guidelines:
- Create a hook for the first 3 seconds
- Keep it under 60 seconds
- Make it engaging and visual
- Include trending hashtags
- Add a call-to-action
- Make it shareable

Article: "${title}"
Content: ${content}`
        break

      case "mermaid":
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
        break

      default:
        return NextResponse.json({ error: "Invalid generation type" }, { status: 400 })
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
    return NextResponse.json(
      {
        error: "Failed to generate AI content. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
