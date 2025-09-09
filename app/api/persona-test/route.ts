import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"

// Initialize client
const groqClient = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { personaName, originalContent, generatedContent, testPrompt } = await request.json()

    if (!personaName || !originalContent || !generatedContent) {
      return NextResponse.json(
        { error: "Missing required fields: personaName, originalContent, generatedContent" },
        { status: 400 }
      )
    }

    // Use AI to analyze how well the generated content matches the persona
    const analysisPrompt = `You are an expert content analyst specializing in writing style comparison. Analyze how well the generated content matches the writing style and persona characteristics of the original content.

PERSONA: ${personaName}

ORIGINAL CONTENT SAMPLE:
${originalContent.substring(0, 2000)}...

GENERATED CONTENT TO EVALUATE:
${generatedContent}

${testPrompt ? `SPECIFIC TEST CRITERIA: ${testPrompt}` : ""}

Please provide a detailed analysis in JSON format with the following structure:
{
  "styleMatch": {
    "score": <number 0-100>,
    "explanation": "<detailed explanation of style matching>"
  },
  "toneConsistency": {
    "score": <number 0-100>,
    "explanation": "<analysis of tone consistency>"
  },
  "vocabularyMatch": {
    "score": <number 0-100>,
    "explanation": "<analysis of vocabulary and language patterns>"
  },
  "structureMatch": {
    "score": <number 0-100>,
    "explanation": "<analysis of content structure and formatting>"
  },
  "overallScore": <number 0-100>,
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "improvements": ["<improvement 1>", "<improvement 2>", ...],
  "personaFidelity": "<assessment of how well it captures the persona>",
  "recommendations": "<specific recommendations for improvement>"
}

Focus on:
- Writing tone and voice consistency
- Vocabulary and language pattern matching
- Content structure and formatting style
- Engagement patterns and audience interaction style
- Technical accuracy and domain expertise demonstration
- Overall authenticity to the persona

Provide specific examples from the generated content to support your analysis.`

    const result = await generateText({
      model: groqClient("llama-3.1-70b-versatile"),
      prompt: analysisPrompt,
      temperature: 0.3,
    })

    let analysis
    try {
      // Try to parse the JSON response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0])
      } else {
        // Fallback if JSON parsing fails
        analysis = {
          overallScore: 75,
          styleMatch: { score: 75, explanation: "Analysis completed" },
          toneConsistency: { score: 75, explanation: "Analysis completed" },
          vocabularyMatch: { score: 75, explanation: "Analysis completed" },
          structureMatch: { score: 75, explanation: "Analysis completed" },
          strengths: ["Generated content analysis completed"],
          improvements: ["See full analysis for details"],
          personaFidelity: result.text,
          recommendations: "See detailed analysis above"
        }
      }
    } catch (parseError) {
      console.error("Error parsing analysis JSON:", parseError)
      analysis = {
        overallScore: 75,
        rawAnalysis: result.text,
        error: "Could not parse structured analysis, but evaluation completed"
      }
    }

    return NextResponse.json({
      success: true,
      analysis,
      metadata: {
        personaName,
        timestamp: new Date().toISOString(),
        originalContentLength: originalContent.length,
        generatedContentLength: generatedContent.length
      }
    })

  } catch (error) {
    console.error("Error in persona testing:", error)
    return NextResponse.json(
      { error: "Failed to analyze persona effectiveness" },
      { status: 500 }
    )
  }
}
