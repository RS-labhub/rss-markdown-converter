import { type NextRequest, NextResponse } from "next/server"
import { getAPIKey } from "@/lib/api-key-manager-server"

// Image generation providers configuration
interface ImageGenerationProvider {
  id: string
  name: string
  requiresKey: boolean
  sizes: { id: string; label: string; width: number; height: number }[]
  models?: { id: string; label: string }[]
  defaultModel?: string
}

const IMAGE_PROVIDERS: Record<string, ImageGenerationProvider> = {
  pollinations_free: {
    id: "pollinations_free",
    name: "AI Image Generator (Free)",
    requiresKey: false,
    models: [
      { id: "turbo", label: "Turbo (Fast Generation)" },
      { id: "sdxl", label: "Higher Quality (SDXL, Slower)" },
    ],
    defaultModel: "turbo",
    sizes: [
      { id: "square_small", label: "Square (512x512)", width: 512, height: 512 },
      { id: "square_medium", label: "Square (768x768)", width: 768, height: 768 },
      { id: "square_large", label: "Square (1024x1024)", width: 1024, height: 1024 },
      { id: "best_square", label: "Best Square (1536x1536)", width: 1536, height: 1536 },
      { id: "portrait", label: "Portrait (512x768)", width: 512, height: 768 },
      { id: "landscape", label: "Landscape (768x512)", width: 768, height: 512 },
      { id: "landscape_wide", label: "Wide (1024x576)", width: 1024, height: 576 },
      { id: "hd_landscape", label: "HD Landscape (1536x864)", width: 1536, height: 864 },
      { id: "dev_to_cover_image", label: "dev.to Cover Image (1000x420)", width: 1000, height: 420 },
    ],
  },
  huggingface: {
    id: "huggingface",
    name: "Hugging Face Models",
    requiresKey: true,
    models: [
      { id: "black-forest-labs/FLUX.1-schnell", label: "FLUX.1 Schnell (Fast)" },
      { id: "stabilityai/stable-diffusion-xl-base-1.0", label: "SDXL Base 1.0" },
      { id: "stable-diffusion-v1-5/stable-diffusion-v1-5", label: "Stable Diffusion 1.5" },
      { id: "CompVis/stable-diffusion-v1-4", label: "Stable Diffusion 1.4" },
    ],
    defaultModel: "black-forest-labs/FLUX.1-schnell",
    sizes: [
      { id: "square", label: "Square (512x512)", width: 512, height: 512 },
      { id: "portrait", label: "Portrait (512x768)", width: 512, height: 768 },
      { id: "landscape", label: "Landscape (768x512)", width: 768, height: 512 },
      { id: "hd_square", label: "HD Square (1024x1024)", width: 1024, height: 1024 },
      { id: "best_square", label: "Best Square (1536x1536)", width: 1536, height: 1536 },
      { id: "dev_to_cover_image", label: "dev.to Cover Image (1000x420)", width: 1000, height: 420 },
    ],
  },
  openai: {
    id: "openai",
    name: "OpenAI DALL-E",
    requiresKey: true,
    models: [
      { id: "dall-e-3", label: "DALL-E 3" },
    ],
    defaultModel: "dall-e-3",
    sizes: [
      { id: "square_small", label: "Square (1024x1024)", width: 1024, height: 1024 },
      { id: "square_large", label: "Square HD (1024x1024)", width: 1024, height: 1024 },
      { id: "portrait", label: "Portrait (1024x1792)", width: 1024, height: 1792 },
      { id: "landscape", label: "Landscape (1792x1024)", width: 1792, height: 1024 },
      { id: "highest_resolution", label: "Highest Resolution (1792x1024)", width: 1792, height: 1024 },
    ],
  },
}

// Generate image using alternative free APIs
async function generateFreeImage(
  prompt: string,
  model: string,
  width: number,
  height: number
): Promise<{ imageUrl: string; credits: number; model: string }> {
  // Normalize model (default to turbo if not provided)
  const chosenModel = model || "turbo";

  // Try multiple free services in order
  const services = [
    {
      name: "Pollinations AI",
      generateUrl: () => {
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 1000000);

        return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=${chosenModel}`;
      },
      isDirect: true,
    },
    {
      name: "Lexica Art",
      generateUrl: () => {
        const encodedPrompt = encodeURIComponent(prompt);
        return `https://lexica.art/api/v1/search?q=${encodedPrompt}`;
      },
      isSearch: true,
    },
  ];

  for (const service of services) {
    try {
      console.log(`Trying ${service.name} with model: ${chosenModel}...`);

      // Handle Pollinations (turbo, flux, etc.)
      if (service.isDirect) {
        const url = service.generateUrl();
        const response = await fetch(url, { method: "HEAD" }); // check if alive
        if (!response.ok) {
          console.error(`${service.name} error: ${response.status} ${response.statusText}`);
          continue;
        }
        return {
          imageUrl: url,
          credits: 0,
          model: chosenModel, // could be turbo, sdxl or flux
        };
      }

      // Handle Lexica (search-based, fallback only)
      if (service.isSearch) {
        const response = await fetch(service.generateUrl());
        if (!response.ok) {
          console.error(`${service.name} error: ${response.status} ${response.statusText}`);
          continue;
        }
        const data = await response.json();
        if (data.images && data.images.length > 0) {
          return {
            imageUrl: data.images[0].src || data.images[0].url,
            credits: 0,
            model: service.name,
          };
        }
      }
    } catch (error) {
      console.error(`${service.name} failed:`, error);
      continue;
    }
  }

  // If all services fail, fallback placeholder
  console.warn("All services failed, generating placeholder...");
  const placeholderText = prompt.slice(0, 50).replace(/[^a-zA-Z0-9\s]/g, "");
  const placeholderUrl = `https://via.placeholder.com/${width}x${height}/3b82f6/ffffff?text=${encodeURIComponent(
    placeholderText
  )}`;

  return {
    imageUrl: placeholderUrl,
    credits: 0,
    model: "Placeholder (Services Unavailable)",
  };
}

// Generate image using Hugging Face API
async function generateHuggingFaceImage(
  prompt: string,
  apiKey: string,
  model: string,
  size: { width: number; height: number }
): Promise<{ imageUrl: string; credits: number; model: string }> {
  try {
    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: size.width,
          height: size.height,
          guidance_scale: 7.5,
          num_inference_steps: model.includes("schnell") ? 4 : 50,
        },
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Hugging Face API error:", errorData)
      
      if (response.status === 503) {
        throw new Error("Model is loading. Please try again in a few seconds.")
      }
      
      throw new Error(`Hugging Face API error: ${response.status} - ${errorData}`)
    }

    const imageBlob = await response.blob()
    const buffer = Buffer.from(await imageBlob.arrayBuffer())
    const base64Image = buffer.toString("base64")
    const dataUrl = `data:image/jpeg;base64,${base64Image}`

    return {
      imageUrl: dataUrl,
      credits: 0, // Hugging Face doesn't use credits
      model: model.split("/").pop() || model,
    }
  } catch (error) {
    console.error("Hugging Face generation error:", error)
    throw error
  }
}

// Generate image using OpenAI DALL-E API
async function generateOpenAIImage(
  prompt: string,
  apiKey: string,
  model: string,
  size: string
): Promise<{ imageUrl: string; credits: number; model: string }> {
  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size,
        quality: model === "dall-e-3" ? "hd" : "standard",
        style: "vivid",
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`)
    }

    const data = await response.json()
    const imageUrl = data.data?.[0]?.url

    if (!imageUrl) {
      throw new Error("No image URL returned from OpenAI")
    }

    // Estimate credits based on model and quality
    const credits = model === "dall-e-3" ? (size.includes("hd") ? 0.12 : 0.08) : 0.02

    return {
      imageUrl,
      credits,
      model,
    }
  } catch (error) {
    console.error("OpenAI image generation error:", error)
    throw error
  }
}

// Convert blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      resolve(base64String.split(",")[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Generate prompt from blog content
function generatePromptFromContent(
  content: string,
  title: string,
  customContext?: string
): string {
  if (customContext) {
    return customContext
  }

  // Extract key themes from content
  const words = content.toLowerCase().split(/\s+/)
  const techKeywords = [
    "ai", "machine learning", "blockchain", "cloud", "devops", 
    "programming", "software", "database", "api", "framework",
    "javascript", "python", "react", "node", "docker"
  ]
  
  const foundKeywords = techKeywords.filter(keyword => 
    words.some(word => word.includes(keyword))
  )

  let prompt = `Create a professional blog cover image for an article titled "${title}".`
  
  if (foundKeywords.length > 0) {
    prompt += ` The article focuses on ${foundKeywords.slice(0, 3).join(", ")}.`
  }
  
  prompt += " Modern, clean design with abstract tech elements. Professional color scheme."
  
  return prompt
}

export async function POST(req: NextRequest) {
  try {
    const {
      provider,
      prompt: customPrompt,
      content,
      title,
      size,
      model,
      keyId,
      apiKey: providedApiKey,
    } = await req.json()

    const selectedProvider = IMAGE_PROVIDERS[provider]
    if (!selectedProvider) {
      return NextResponse.json(
        { error: "Invalid image provider" },
        { status: 400 }
      )
    }

    const selectedSize = selectedProvider.sizes.find((s) => s.id === size)
    if (!selectedSize) {
      return NextResponse.json(
        { error: "Invalid image size" },
        { status: 400 }
      )
    }

    // Generate prompt
    const prompt = generatePromptFromContent(content || "", title || "", customPrompt)

    let result: { imageUrl: string; credits: number; model: string }

    if (provider === "pollinations_free") {
      // Use free Pollinations AI
      const selectedModel = model || selectedProvider.defaultModel
      result = await generateFreeImage(
        prompt,
        selectedModel!,
        selectedSize.width,
        selectedSize.height
      )
    } else if (provider === "openai") {
      // Use OpenAI with API key
      let apiKey: string | null = null
      
      // Use provided API key from client first
      if (providedApiKey) {
        apiKey = providedApiKey
      } else if (keyId) {
        // Try to get from server storage (won't work with client-side storage)
        apiKey = getAPIKey(keyId)
      } else if (process.env.OPENAI_API_KEY) {
        // Fall back to system key if available
        apiKey = process.env.OPENAI_API_KEY
      }

      if (!apiKey) {
        return NextResponse.json(
          { error: "API key required for OpenAI. Please add your OpenAI API key." },
          { status: 401 }
        )
      }

      const selectedModel = model || selectedProvider.defaultModel
      const sizeString = `${selectedSize.width}x${selectedSize.height}`

      result = await generateOpenAIImage(prompt, apiKey, selectedModel!, sizeString)
    } else if (provider === "huggingface") {
      // Check for API key from multiple sources
      let apiKey = providedApiKey
      
      if (!apiKey && keyId) {
        // Try to get from server storage  
        apiKey = getAPIKey(keyId)
      }
      
      if (!apiKey && process.env.HUGGINGFACE_API_KEY) {
        // Fall back to system key if available
        apiKey = process.env.HUGGINGFACE_API_KEY
      }

      if (!apiKey) {
        return NextResponse.json(
          { error: "API key required for Hugging Face. Please add your Hugging Face API key." },
          { status: 401 }
        )
      }

      const selectedModel = model || selectedProvider.defaultModel
      
      result = await generateHuggingFaceImage(prompt, apiKey, selectedModel!, selectedSize)
    } else {
      return NextResponse.json(
        { error: "Unsupported provider" },
        { status: 400 }
      )
    }

    // For external URLs, use the proxy to avoid CORS issues
    let finalImageUrl = result.imageUrl
    if (!result.imageUrl.startsWith("data:") && provider === "openai") {
      finalImageUrl = `/api/proxy-image?url=${encodeURIComponent(result.imageUrl)}`
    }

    return NextResponse.json({
      success: true,
      imageUrl: finalImageUrl,
      credits: result.credits,
      model: result.model,
      prompt,
      provider: selectedProvider.name,
      size: `${selectedSize.width}x${selectedSize.height}`,
      originalUrl: result.imageUrl,
    })
  } catch (error) {
    console.error("Image generation error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image generation failed" },
      { status: 500 }
    )
  }
}
