import { type NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";

// Initialize AI clients
const groqClient = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
});

const geminiClient = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

interface SelectedPersona {
  id: string;
  name: string;
  type: "rss-author" | "trained-persona" | "built-in";
  weight: number;
}

interface RSSItem {
  title: string;
  content: string;
  author: string;
  date: string;
  link: string;
  markdown: string;
}

interface PersonaData {
  name: string;
  rawContent: string;
  instructions?: string;
  createdAt: string;
  isBuiltIn?: boolean;
  contentType?: "posts" | "blogs" | "mixed";
}

// Load built-in persona training data
async function loadBuiltInPersonaData(
  personaName: string,
  contentType: "posts" | "blogs"
): Promise<string | null> {
  try {
    const fs = await import("fs").catch(() => null);
    const path = await import("path").catch(() => null);

    if (fs && path) {
      const suffix = contentType === "blogs" ? "blogs" : "posts";
      const filePath = path.join(
        process.cwd(),
        "training-data",
        `${personaName}-${suffix}.txt`
      );

      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf-8");
      }

      // Fallback to posts if blogs don't exist
      if (contentType === "blogs") {
        const fallbackPath = path.join(
          process.cwd(),
          "training-data",
          `${personaName}-posts.txt`
        );
        if (fs.existsSync(fallbackPath)) {
          return fs.readFileSync(fallbackPath, "utf-8");
        }
      }
    }
  } catch (error) {
    console.error(`Error loading ${personaName} training data:`, error);
  }
  return null;
}

// Load custom persona training data from request
function getCustomPersonaData(
  customPersonas: PersonaData[],
  personaName: string
): PersonaData | null {
  return customPersonas.find((p) => p.name === personaName) || null;
}

// Extract writing samples from RSS articles
function extractWritingSamples(articles: RSSItem[], maxSamples = 10): string {
  // First, create a topic summary
  const topics = articles.map((a) => a.title).join(", ");
  const topicSummary = `Previous topics covered: ${topics}\n\n`;

  const samples = articles
    .slice(0, maxSamples)
    .map((article, index) => {
      // Extract more content and include metadata
      const contentLength = Math.min(article.content.length, 3000); // Increased from 2000
      const content = article.content.substring(0, contentLength);
      const truncated = article.content.length > contentLength ? "..." : "";

      return `## Sample ${index + 1}: ${article.title}
Date: ${new Date(article.date).toLocaleDateString()}
Link: ${article.link}

${content}${truncated}

---`;
    })
    .join("\n\n");

  return topicSummary + samples;
}

type PlatformGuideline = {
  format: string;
  guidelines: string[];
};

// Get platform-specific guidelines
const guidelines: Record<string, PlatformGuideline> = {
  linkedin: {
    format: "LinkedIn post",
    guidelines: [
      "Start with a compelling hook without emojis",
      "Keep it professional and engaging",
      "Use line breaks for readability",
      "Include 3-5 relevant hashtags at the end",
      "Target 600-800 characters for optimal readability",
      "Maximum 1000 characters to keep it concise",
      "NO EMOJIS - maintain professional tone",
      "Use bullet points (•) for lists",
    ],
  },
  twitter: {
    format: "Twitter/X thread",
    guidelines: [
      "Each tweet maximum 280 characters",
      "Start with a compelling hook",
      "NO EMOJIS - keep it clean and professional",
      "Include 2-3 relevant hashtags",
      "Number each tweet (1/n, 2/n, etc.)",
      "Keep thread concise - 3-5 tweets maximum",
      "Use bullet points (•) for lists",
    ],
  },
  discord: {
    format: "Discord message",
    guidelines: [
      "Keep it conversational but informative",
      "NO EMOJIS - use plain text",
      "Break into readable paragraphs",
      "Only include links if they add value",
      "Maximum 2000 characters",
    ],
  },
  instagram: {
    format: "Instagram caption",
    guidelines: [
      "Start with an attention-grabbing first line",
      "NO EMOJIS - focus on the message",
      "Use line breaks for readability",
      "Include 20-30 relevant hashtags at the end",
      "Maximum 2200 characters",
      "No external links (Instagram limitation)",
    ],
  },
  facebook: {
    format: "Facebook post",
    guidelines: [
      "Write conversationally but professionally",
      "NO EMOJIS - keep it clean",
      "Include a clear message",
      "Only add links if they're essential",
      "Encourage engagement with questions",
    ],
  },
  reddit: {
    format: "Reddit post",
    guidelines: [
      "Use proper subreddit etiquette",
      "NO EMOJIS - Reddit prefers plain text",
      "Be informative and authentic",
      "Only include links if they support your point",
      "Follow community guidelines",
    ],
  },
  medium: {
    format: "Medium article",
    guidelines: [
      "Write a compelling introduction without emojis",
      "Create a detailed outline with clear sections",
      "Use proper headings and subheadings",
      "Include relevant images descriptions if needed",
      "Minimum 600 words for better engagement",
      "Add links only when they provide additional value",
      "Use proper markdown formatting",
      "NO EMOJIS throughout the article",
    ],
  },
  devto: {
    format: "Dev.to article",
    guidelines: [
      "Start with a developer-focused introduction",
      "NO EMOJIS - keep it technical and clean",
      "Use proper markdown formatting",
      "Include code blocks with syntax highlighting",
      "Add relevant tags (4-5 maximum)",
      "Only link to documentation or resources when necessary",
      "Encourage technical discussion",
      "Minimum 400 words",
    ],
  },
  hashnode: {
    format: "Hashnode blog post",
    guidelines: [
      "Write for a technical audience",
      "NO EMOJIS - maintain professional tone",
      "Use clear headings and subheadings",
      "Include code examples when relevant",
      "Add a compelling cover image description",
      "Only include essential links",
      "Use proper SEO-friendly formatting",
      "Minimum 500 words",
    ],
  },
};

function getPlatformGuidelines(platform: string): PlatformGuideline {
  return (
    guidelines[platform] || {
      format: `${platform} post`,
      guidelines: [
        "Create engaging content",
        "Use appropriate tone",
        "Include relevant hashtags",
      ],
    }
  );
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
  customPersonas: PersonaData[] = []
): Promise<string> {
  const platformGuidelines = getPlatformGuidelines(platform);
  const keywordText = keywords
    ? `Include these keywords naturally: ${keywords}.`
    : "";
  const contextText = context ? `Additional context: ${context}` : "";

  let personaInstructions = "";
  let trainingExamples = "";
  let customInstructions = "";

  // Process each selected persona
  for (const persona of selectedPersonas) {
    const weight = Math.round(persona.weight * 100);

    if (persona.type === "rss-author") {
      // Get articles from this author
      const authorArticles = rssItems.filter(
        (item) => item.author === persona.name
      );
      if (authorArticles.length > 0) {
        const samples = extractWritingSamples(authorArticles, 5);
        trainingExamples += `\n\n### ${persona.name}'s Writing Style (${weight}% influence):\n${samples}`;
        personaInstructions += `- ${weight}% of the content should reflect ${persona.name}'s writing style and voice\n`;
      }
    } else if (persona.type === "built-in") {
      // Load built-in persona data
      const trainingData = await loadBuiltInPersonaData(
        persona.name,
        contentType === "blog" ? "blogs" : "posts"
      );
      if (trainingData) {
        trainingExamples += `\n\n### ${persona.name}'s Writing Style (${weight}% influence):\n${trainingData}`;
        personaInstructions += `- ${weight}% of the content should reflect ${persona.name}'s writing style and voice\n`;
      }

      // Check for custom instructions for built-in personas
      const builtInInstructions = customPersonas.find(
        (p) => p.name === `${persona.name}-instructions` && p.isBuiltIn
      )?.instructions;
      if (builtInInstructions) {
        customInstructions += `\n\n### Custom Instructions for ${persona.name} (${weight}% influence):\n${builtInInstructions}`;
      }
    } else if (persona.type === "trained-persona") {
      // Load custom persona data
      const customPersona = getCustomPersonaData(customPersonas, persona.name);
      if (customPersona) {
        trainingExamples += `\n\n### ${persona.name}'s Writing Style (${weight}% influence):\n${customPersona.rawContent}`;
        personaInstructions += `- ${weight}% of the content should reflect ${persona.name}'s trained writing style\n`;

        // Add custom instructions if available
        if (customPersona.instructions) {
          customInstructions += `\n\n### Custom Instructions for ${persona.name} (${weight}% influence):\n${customPersona.instructions}`;
        }
      }
    }
  }

  return `You are an expert content creator who can blend multiple writing styles seamlessly. Create a ${
    platformGuidelines.format
  } about "${topic}" by mixing the writing styles of the provided authors/personas according to their specified weights.

WRITING STYLE EXAMPLES TO LEARN FROM:
${trainingExamples}

STYLE MIXING INSTRUCTIONS:
${personaInstructions}

${customInstructions ? `CUSTOM WRITING INSTRUCTIONS:${customInstructions}` : ""}

PLATFORM REQUIREMENTS for ${platformGuidelines.format}:
${platformGuidelines.guidelines.map((guide: any) => `- ${guide}`).join("\n")}

IMPORTANT GUIDELINES FOR USING REFERENCE CONTENT:
- Study the writing patterns, vocabulary choices, and structural preferences from the samples
- Note recurring themes, expertise areas, and unique perspectives from each author
- Reference similar topics or build upon ideas from previous articles when relevant
- Maintain consistency with the author's established voice and expertise level
- Use similar formatting patterns, transition words, and rhetorical devices


STRICT CONTENT RULES:
- DO NOT use any emojis in the content
- Focus on clean, professional text formatting
- Maintain readability without relying on visual elements
- Never output links as a standalone line or as a list. Only mention a link inside a paragraph if the sentence is specifically discussing that link or resource.

TASK:
Create a ${
    platformGuidelines.format
  } about "${topic}" that seamlessly blends the writing styles above according to their weights. ${keywordText} ${contextText}

The content should:
1. Feel natural and cohesive, not like separate sections from different authors
2. Draw from the knowledge and perspectives demonstrated in the reference samples
3. Use similar language patterns and technical depth as shown in the examples
4. Blend their:
   - Tone and voice
   - Sentence structure and rhythm  
   - Technical depth and approach
   - Engagement style and personality
   - Vocabulary and expressions
   - Topic expertise and perspective

${
  customInstructions
    ? "Follow the custom instructions provided for each persona while maintaining their specified influence weight."
    : ""
}

Make it feel like a single, unified piece of content that incorporates the best elements of each style according to their weights, while drawing from their demonstrated expertise and previous content.`;
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
    } = await request.json();

    if (!selectedPersonas || selectedPersonas.length === 0) {
      return NextResponse.json(
        { error: "At least one persona must be selected" },
        { status: 400 }
      );
    }

    if (!topic || !topic.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Select AI model based on provider
    let aiModel;

    switch (provider) {
      case "groq":
        if (!process.env.GROQ_API_KEY) {
          return NextResponse.json(
            { error: "Groq API key not configured in environment" },
            { status: 400 }
          );
        }
        aiModel = groqClient.chat("llama-3.3-70b-versatile");
        break;
      case "gemini":
        if (!process.env.GEMINI_API_KEY) {
          return NextResponse.json(
            { error: "Gemini API key not configured in environment" },
            { status: 400 }
          );
        }
        aiModel = geminiClient("models/gemini-2.0-flash");
        break;
      case "openai":
        if (!apiKey) {
          return NextResponse.json(
            { error: "OpenAI API key is required" },
            { status: 400 }
          );
        }
        const openaiClient = createOpenAI({ apiKey });
        // Use GPT-4o-mini for posts, GPT-4o for blogs
        const defaultOpenAIModel =
          contentType === "blog" ? "gpt-4o" : "gpt-4o-mini";
        aiModel = openaiClient.chat(model || defaultOpenAIModel);
        break;
      case "anthropic":
        if (!apiKey) {
          return NextResponse.json(
            { error: "Anthropic API key is required" },
            { status: 400 }
          );
        }
        const anthropicClient = createAnthropic({ apiKey });
        // Use Claude Opus for blogs (best quality), Sonnet for posts
        const defaultAnthropicModel =
          contentType === "blog" ? "claude-opus-4-1-20250805" : "claude-3-5-sonnet-20241022";
        aiModel = anthropicClient(model || defaultAnthropicModel);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid provider" },
          { status: 400 }
        );
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
      customPersonas
    );

    const { text } = await generateText({
      model: aiModel,
      prompt,
      temperature: 0.7,
    });

    return NextResponse.json({ content: text, provider });
  } catch (error) {
    console.error("Author content generation error:", error);

    // Handle specific API errors
    let errorMessage = "Failed to generate mixed content. Please try again.";
    let errorDetails = "";
    let provider = "unknown";

    if (error instanceof Error) {
      if (error.message.includes("exceeded your current quota")) {
        errorMessage = "OpenAI API quota exceeded";
        errorDetails =
          "Please check your OpenAI billing and usage limits, or try using a different provider.";
        provider = "openai";
      } else if (error.message.includes("credit balance is too low")) {
        errorMessage = "Anthropic API credit balance too low";
        errorDetails =
          "Please add credits to your Anthropic account or try using a different provider.";
        provider = "anthropic";
      } else if (error.message.includes("Invalid API key")) {
        errorMessage = "Invalid API key";
        errorDetails = "Please check your API key configuration and try again.";
      } else if (error.message.includes("rate limit")) {
        errorMessage = "Rate limit exceeded";
        errorDetails =
          "Please wait a moment before trying again, or switch to a different provider.";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
        provider: provider,
      },
      { status: 500 }
    );
  }
}
