import { type NextRequest, NextResponse } from "next/server"
import * as fal from "@fal-ai/serverless-client"

// Configure Fal client
if (process.env.FAL_KEY) {
  fal.config({
    credentials: process.env.FAL_KEY,
  })
  console.log("Fal AI configured with API key")
} else {
  console.warn("FAL_KEY environment variable not found")
}

export async function POST(request: NextRequest) {
  console.log("=== Image Generation API Called ===")

  try {
    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    const {
      content,
      title,
      style = "realistic",
      aspectRatio = "16:9",
      provider = "huggingface",
      apiKey,
      model = "dall-e-3",
    } = body

    if (!content && !title) {
      console.error("Missing content and title")
      return NextResponse.json({ error: "Content or title is required" }, { status: 400 })
    }

    // Create a focused prompt for image generation
    const imagePrompt = createImagePrompt(title || "", content || "", style, provider)
    console.log(`Generated prompt for ${provider}:`, imagePrompt)

    let imageUrl: string | null = null
    let generationDetails: any = {}

    try {
      switch (provider) {
        case "openai":
          console.log("Using OpenAI provider")
          if (!apiKey) {
            console.error("OpenAI API key missing")
            return NextResponse.json({ error: "OpenAI API key is required" }, { status: 400 })
          }
          const openaiResult = await generateWithOpenAI(imagePrompt, aspectRatio, apiKey, model)
          imageUrl = openaiResult.imageUrl
          generationDetails = openaiResult.details
          break

        case "huggingface":
          console.log("Using Hugging Face provider")
          const hfResult = await generateWithHuggingFace(imagePrompt, aspectRatio)
          imageUrl = hfResult.imageUrl
          generationDetails = hfResult.details
          break

        case "replicate":
          console.log("Using Replicate provider")
          if (!apiKey) {
            console.error("Replicate API key missing")
            return NextResponse.json({ error: "Replicate API key is required" }, { status: 400 })
          }
          const replicateResult = await generateWithReplicate(imagePrompt, aspectRatio, apiKey)
          imageUrl = replicateResult.imageUrl
          generationDetails = replicateResult.details
          break

        case "anthropic":
          console.log("Anthropic provider requested - not supported")
          return NextResponse.json(
            {
              error: "Anthropic doesn't support direct image generation",
              details:
                "Anthropic Claude can describe images but cannot generate them. Please use OpenAI, Hugging Face, or Replicate instead.",
            },
            { status: 400 },
          )

        case "fal":
          console.log("Using Fal AI provider")
          if (!process.env.FAL_KEY) {
            console.error("FAL_KEY environment variable not set")
            return NextResponse.json(
              {
                error: "FAL_KEY is not configured",
                details: "Please set the FAL_KEY environment variable to use Fal AI image generation",
              },
              { status: 500 },
            )
          }
          const falResult = await generateWithFal(imagePrompt, aspectRatio)
          imageUrl = falResult.imageUrl
          generationDetails = falResult.details
          break

        default:
          console.log("Using Hugging Face as default provider")
          const defaultResult = await generateWithHuggingFace(imagePrompt, aspectRatio)
          imageUrl = defaultResult.imageUrl
          generationDetails = defaultResult.details
          break
      }

      // Validate that we got a proper URL
      if (!imageUrl) {
        console.error("No image URL received from provider")
        throw new Error("No image URL received from the image generation service")
      }

      // Validate URL format
      if (!imageUrl.startsWith("http") && !imageUrl.startsWith("data:image/")) {
        console.error("Invalid image URL format received:", imageUrl)
        throw new Error(`Invalid image URL format received: ${imageUrl}`)
      }

      console.log("✅ Image generation successful!")
      console.log("Image URL type:", imageUrl.startsWith("data:") ? "Base64 Data URL" : "HTTP URL")
      console.log("Image URL length:", imageUrl.length)

      const response = {
        imageUrl,
        prompt: imagePrompt,
        style,
        aspectRatio,
        provider,
        ...generationDetails,
      }

      console.log("Sending response with imageUrl length:", response.imageUrl?.length || 0)
      return NextResponse.json(response)
    } catch (generationError) {
      console.error("Generation error:", generationError)
      throw generationError
    }
  } catch (error) {
    console.error("=== Image Generation Error ===")
    console.error("Error details:", error)
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace")

    let errorMessage = "Failed to generate image"
    let errorDetails = "Please try again or check your configuration"
    let provider = "unknown"

    // Extract provider from request if possible
    try {
      const body = await request.json()
      provider = body.provider || "unknown"
    } catch {
      // Ignore JSON parsing errors
    }

    if (error instanceof Error) {
      console.log("Processing error message:", error.message)

      if (error.message.includes("Forbidden") || error.message.includes("403")) {
        if (provider === "fal") {
          errorMessage = "Fal AI API access denied"
          errorDetails = "Please check your FAL_KEY environment variable. The API key may be invalid or expired."
        } else if (provider === "huggingface") {
          errorMessage = "Hugging Face rate limit or model unavailable"
          errorDetails = "The free Hugging Face model may be overloaded. Please try again in a few minutes."
        } else {
          errorMessage = "API access denied"
          errorDetails = "Please check your API key permissions and quota."
        }
      } else if (error.message.includes("credits") || error.message.includes("quota")) {
        errorMessage = "Image generation quota exceeded"
        errorDetails = "Please check your API credits or try again later"
      } else if (error.message.includes("safety") || error.message.includes("content_policy")) {
        errorMessage = "Content safety check failed"
        errorDetails = "The content may have triggered safety filters. Please try with different content."
      } else if (error.message.includes("timeout")) {
        errorMessage = "Image generation timeout"
        errorDetails = "The image generation took too long. Please try again."
      } else if (error.message.includes("Invalid API key") || error.message.includes("Incorrect API key")) {
        errorMessage = "Invalid API key"
        errorDetails = "Please check your API key configuration and try again."
      } else if (error.message.includes("rate limit") || error.message.includes("too many requests")) {
        errorMessage = "Rate limit exceeded"
        errorDetails = "Please wait a moment before trying again."
      } else if (error.message.includes("No image URL received")) {
        errorMessage = "No image generated"
        errorDetails = "The image generation service did not return an image. Please try again."
      } else if (error.message.includes("Invalid image URL")) {
        errorMessage = "Invalid image URL"
        errorDetails = "The image service returned an invalid URL. Please try again."
      } else if (error.message.includes("FAL_KEY is not configured")) {
        errorMessage = "Fal AI not configured"
        errorDetails = "Please set the FAL_KEY environment variable to use Fal AI."
      } else if (error.message.includes("Model is currently loading")) {
        errorMessage = "Model is loading"
        errorDetails = "The AI model is currently loading. Please wait a few minutes and try again."
      } else {
        // Use the actual error message for debugging
        errorMessage = error.message
        errorDetails = "Check the console for more details"
      }
    }

    const errorResponse = {
      error: errorMessage,
      details: errorDetails,
      originalError: error instanceof Error ? error.message : String(error),
      provider,
    }

    console.log("Sending error response:", JSON.stringify(errorResponse, null, 2))
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

async function generateWithOpenAI(prompt: string, aspectRatio: string, apiKey: string, model: string) {
  console.log("=== OpenAI Generation ===")
  console.log("Model:", model)
  console.log("Aspect ratio:", aspectRatio)
  console.log("Prompt length:", prompt.length)

  const size = getOpenAISize(aspectRatio)
  console.log("OpenAI size:", size)

  const requestBody = {
    model: model,
    prompt: prompt,
    n: 1,
    size: size,
    quality: "standard",
    style: "natural",
  }

  console.log("OpenAI request body:", JSON.stringify(requestBody, null, 2))

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    console.log("OpenAI response status:", response.status)
    console.log("OpenAI response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("OpenAI API error response:", errorText)

      let errorData
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: { message: errorText } }
      }

      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log("OpenAI success response:", JSON.stringify(data, null, 2))

    if (!data.data || data.data.length === 0) {
      console.error("No data in OpenAI response")
      throw new Error("No image generated by OpenAI")
    }

    const imageUrl = data.data[0]?.url
    console.log("OpenAI generated image URL:", imageUrl)

    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL from OpenAI: ${imageUrl}`)
    }

    if (!imageUrl.startsWith("http")) {
      throw new Error(`OpenAI returned non-HTTP URL: ${imageUrl}`)
    }

    return {
      imageUrl: imageUrl,
      details: {
        model: model,
        size: size,
        quality: "standard",
        revised_prompt: data.data[0]?.revised_prompt,
      },
    }
  } catch (error) {
    console.error("OpenAI generation error:", error)
    throw error
  }
}

async function generateWithHuggingFace(prompt: string, aspectRatio: string) {
  console.log("=== Hugging Face Generation ===")
  console.log("Aspect ratio:", aspectRatio)
  console.log("Prompt length:", prompt.length)

  // Using Stable Diffusion XL model on Hugging Face (free)
  const model = "stabilityai/stable-diffusion-xl-base-1.0"
  console.log("Using model:", model)

  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // No API key needed for free tier, but you can add one for better rate limits
        Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: "text, watermark, signature, blurry, low quality",
          num_inference_steps: 20,
          guidance_scale: 7.5,
          width: getHuggingFaceSize(aspectRatio).width,
          height: getHuggingFaceSize(aspectRatio).height,
        },
      }),
    })

    console.log("Hugging Face response status:", response.status)
    console.log("Hugging Face response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Hugging Face API error response:", errorText)

      if (response.status === 503) {
        throw new Error("Model is currently loading. Please wait a few minutes and try again.")
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again in a few minutes.")
      }

      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`)
    }

    // Hugging Face returns the image as a blob
    const imageBlob = await response.blob()
    console.log("Hugging Face image blob size:", imageBlob.size)

    if (imageBlob.size === 0) {
      throw new Error("Empty image received from Hugging Face")
    }

    // Convert blob to base64 data URL for immediate use
    const arrayBuffer = await imageBlob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    const imageUrl = `data:image/png;base64,${base64}`

    console.log("Hugging Face generated image (base64 length):", base64.length)

    if (!imageUrl || !imageUrl.startsWith("data:image/")) {
      throw new Error("Failed to create valid base64 image URL from Hugging Face response")
    }

    return {
      imageUrl: imageUrl,
      details: {
        model: "stable-diffusion-xl-base-1.0",
        provider: "huggingface",
        size: getHuggingFaceSize(aspectRatio),
      },
    }
  } catch (error) {
    console.error("Hugging Face generation error:", error)
    throw error
  }
}

async function generateWithReplicate(prompt: string, aspectRatio: string, apiKey: string) {
  console.log("=== Replicate Generation ===")
  console.log("Aspect ratio:", aspectRatio)
  console.log("Prompt length:", prompt.length)

  const size = getReplicateSize(aspectRatio)
  console.log("Replicate size:", size)

  try {
    // Start the prediction
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", // SDXL
        input: {
          prompt: prompt,
          negative_prompt: "text, watermark, signature, blurry, low quality",
          width: size.width,
          height: size.height,
          num_inference_steps: 20,
          guidance_scale: 7.5,
        },
      }),
    })

    console.log("Replicate response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Replicate API error response:", errorText)
      throw new Error(`Replicate API error: ${response.status} ${response.statusText}`)
    }

    const prediction = await response.json()
    console.log("Replicate prediction:", prediction)

    // Poll for completion
    let result = prediction
    let attempts = 0
    const maxAttempts = 60 // 60 seconds max wait time

    while ((result.status === "starting" || result.status === "processing") && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          Authorization: `Token ${apiKey}`,
        },
      })
      result = await pollResponse.json()
      console.log("Replicate status:", result.status)
      attempts++
    }

    if (result.status === "failed") {
      throw new Error(`Replicate generation failed: ${result.error}`)
    }

    if (result.status !== "succeeded") {
      throw new Error(`Replicate generation timed out or failed with status: ${result.status}`)
    }

    if (!result.output || !Array.isArray(result.output) || result.output.length === 0) {
      throw new Error("No image generated by Replicate")
    }

    const imageUrl = result.output[0]
    console.log("Replicate generated image URL:", imageUrl)

    if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("http")) {
      throw new Error(`Invalid image URL from Replicate: ${imageUrl}`)
    }

    return {
      imageUrl: imageUrl,
      details: {
        model: "stable-diffusion-xl",
        provider: "replicate",
        size: size,
        id: result.id,
      },
    }
  } catch (error) {
    console.error("Replicate generation error:", error)
    throw error
  }
}

async function generateWithFal(prompt: string, aspectRatio: string) {
  console.log("=== Fal AI Generation ===")
  console.log("Aspect ratio:", aspectRatio)
  console.log("Prompt length:", prompt.length)
  console.log("FAL_KEY present:", !!process.env.FAL_KEY)

  const imageSize = getFalImageSize(aspectRatio)
  console.log("Fal image size:", imageSize)

  const requestInput = {
    prompt: prompt,
    image_size: imageSize,
    num_inference_steps: 4,
    enable_safety_checker: true,
  }

  console.log("Fal request input:", JSON.stringify(requestInput, null, 2))

  try {
    console.log("Calling fal.subscribe...")

    const result = await fal.subscribe("fal-ai/flux/schnell", {
      input: requestInput,
    })

    console.log("Fal AI raw response:", JSON.stringify(result, null, 2))

    if (!result) {
      throw new Error("No response from Fal AI")
    }

    if (!result.data) {
      console.error("No data in Fal response:", result)
      throw new Error("No data received from Fal AI")
    }

    if (!result.data.images || !Array.isArray(result.data.images) || result.data.images.length === 0) {
      console.error("No images in Fal response:", result.data)
      throw new Error("No images generated by Fal AI")
    }

    const imageUrl = result.data.images[0]?.url
    console.log("Fal AI generated image URL:", imageUrl)

    if (!imageUrl || typeof imageUrl !== "string") {
      throw new Error(`Invalid image URL from Fal AI: ${imageUrl}`)
    }

    if (!imageUrl.startsWith("http")) {
      throw new Error(`Fal AI returned non-HTTP URL: ${imageUrl}`)
    }

    return {
      imageUrl: imageUrl,
      details: {
        model: "flux-schnell",
        inference_steps: 4,
        seed: result.data.seed,
      },
    }
  } catch (error) {
    console.error("Fal AI generation error:", error)

    // Provide more specific error messages for Fal AI
    if (error instanceof Error) {
      if (error.message.includes("Forbidden") || error.message.includes("403")) {
        throw new Error("Fal AI API key is invalid or expired. Please check your FAL_KEY environment variable.")
      } else if (error.message.includes("401")) {
        throw new Error("Fal AI authentication failed. Please verify your FAL_KEY.")
      } else if (error.message.includes("429")) {
        throw new Error("Fal AI rate limit exceeded. Please wait before trying again.")
      }
    }

    throw error
  }
}

function createImagePrompt(title: string, content: string, style: string, provider: string): string {
  console.log("Creating image prompt...")
  console.log("Title:", title)
  console.log("Content length:", content.length)
  console.log("Style:", style)
  console.log("Provider:", provider)

  // Extract key concepts from title and content
  const text = `${title} ${content}`.toLowerCase()

  // Style modifiers based on provider
  const styleModifiers: Record<string, string> = {
    realistic:
      provider === "openai"
        ? "photorealistic, high quality, detailed, professional photography"
        : "photorealistic, high quality, detailed",
    illustration:
      provider === "openai"
        ? "digital illustration, clean art style, vector art, modern design"
        : "digital illustration, clean art style, vector art",
    abstract:
      provider === "openai"
        ? "abstract art, modern, geometric shapes, vibrant colors, contemporary design"
        : "abstract art, modern, geometric shapes, vibrant colors",
    minimalist:
      provider === "openai"
        ? "minimalist design, clean, simple, professional, white background"
        : "minimalist design, clean, simple, professional",
    tech:
      provider === "openai"
        ? "futuristic technology, digital interface, modern tech design, sleek"
        : "futuristic, technology, digital, modern interface design",
    business:
      provider === "openai"
        ? "professional business setting, corporate environment, clean modern office"
        : "professional, corporate, business setting, clean design",
  }

  // Detect content themes
  const themeKeywords: string[] = []

  if (text.includes("ai") || text.includes("artificial intelligence") || text.includes("machine learning")) {
    themeKeywords.push("artificial intelligence", "neural networks", "technology")
  }

  if (text.includes("code") || text.includes("programming") || text.includes("developer")) {
    themeKeywords.push("programming", "software development", "coding")
  }

  if (text.includes("business") || text.includes("startup") || text.includes("company")) {
    themeKeywords.push("business", "corporate", "professional")
  }

  if (text.includes("design") || text.includes("ui") || text.includes("ux")) {
    themeKeywords.push("user interface design", "modern design")
  }

  if (text.includes("data") || text.includes("analytics") || text.includes("chart")) {
    themeKeywords.push("data visualization", "analytics", "charts")
  }

  // Fallback to general tech/business theme if no specific themes detected
  if (themeKeywords.length === 0) {
    themeKeywords.push("technology", "modern", "professional")
  }

  console.log("Detected themes:", themeKeywords)

  // Create the final prompt based on provider
  const styleModifier = styleModifiers[style] || styleModifiers.realistic

  let finalPrompt: string
  if (provider === "openai") {
    // OpenAI DALL-E works better with more descriptive, natural language prompts
    finalPrompt = `Create a ${style} image representing ${themeKeywords.join(" and ")}. The image should be ${styleModifier}. No text, no watermarks, high quality.`
  } else {
    // Other providers work well with more structured prompts
    finalPrompt = `${themeKeywords.join(", ")}, ${styleModifier}, no text, no watermarks, high quality, professional`
  }

  console.log("Final prompt:", finalPrompt)
  return finalPrompt
}

function getOpenAISize(aspectRatio: string): string {
  const sizeMap: Record<string, string> = {
    "1:1": "1024x1024",
    "16:9": "1792x1024",
    "9:16": "1024x1792",
    "4:3": "1024x1024", // Closest available
    "3:4": "1024x1792", // Use portrait format
  }

  return sizeMap[aspectRatio] || "1024x1024"
}

function getHuggingFaceSize(aspectRatio: string): { width: number; height: number } {
  const sizeMap: Record<string, { width: number; height: number }> = {
    "1:1": { width: 1024, height: 1024 },
    "16:9": { width: 1344, height: 768 },
    "9:16": { width: 768, height: 1344 },
    "4:3": { width: 1152, height: 896 },
    "3:4": { width: 896, height: 1152 },
  }

  return sizeMap[aspectRatio] || { width: 1024, height: 1024 }
}

function getReplicateSize(aspectRatio: string): { width: number; height: number } {
  const sizeMap: Record<string, { width: number; height: number }> = {
    "1:1": { width: 1024, height: 1024 },
    "16:9": { width: 1344, height: 768 },
    "9:16": { width: 768, height: 1344 },
    "4:3": { width: 1152, height: 896 },
    "3:4": { width: 896, height: 1152 },
  }

  return sizeMap[aspectRatio] || { width: 1024, height: 1024 }
}

function getFalImageSize(aspectRatio: string): string {
  const sizeMap: Record<string, string> = {
    "1:1": "square_hd",
    "16:9": "landscape_16_9",
    "9:16": "portrait_9_16",
    "4:3": "landscape_4_3",
    "3:4": "portrait_4_3",
  }

  return sizeMap[aspectRatio] || "landscape_16_9"
}
