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
  
  // Map frontend model names to Pollinations model names
  const modelMapping: Record<string, string> = {
    "turbo": "turbo",
    "sdxl": "dreamshaper"  // Pollinations uses 'dreamshaper' for SDXL-like models
  };
  
  const pollinationModel = modelMapping[chosenModel] || "turbo";

  // Try multiple free services in order
  const services = [
    {
      name: "Pollinations AI",
      generateUrl: () => {
        const encodedPrompt = encodeURIComponent(prompt);
        const seed = Math.floor(Math.random() * 1000000);

        // Updated URL format for Pollinations API
        return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=${pollinationModel}`;
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
      console.log(`Trying ${service.name} with model: ${chosenModel} (mapped to: ${pollinationModel})...`);

      // Handle Pollinations (turbo, dreamshaper, etc.)
      if (service.isDirect) {
        const url = service.generateUrl();
        
        // First, try to fetch the image to validate it works
        const response = await fetch(url, { 
          method: "GET",
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!response.ok) {
          console.error(`${service.name} error: ${response.status} ${response.statusText}`);
          continue;
        }
        
        // Check if response is actually an image
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          console.error(`${service.name} returned non-image content: ${contentType}`);
          continue;
        }
        
        return {
          imageUrl: url,
          credits: 0,
          model: chosenModel,
        };
      }

      // Handle Lexica (search-based, fallback only)
      if (service.isSearch) {
        const response = await fetch(service.generateUrl(), {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        if (!response.ok) {
          console.error(`${service.name} error: ${response.status} ${response.statusText}`);
          continue;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`${service.name} returned non-JSON content: ${contentType}`);
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

  // If all services fail, return a more descriptive error instead of placeholder
  console.warn("All free image generation services failed");
  throw new Error("All free image generation services are currently unavailable. Please try again later or use a different provider.");
}

// Generate image using Hugging Face API
async function generateHuggingFaceImage(
  prompt: string,
  apiKey: string,
  model: string,
  size: { width: number; height: number }
): Promise<{ imageUrl: string; credits: number; model: string }> {
  try {
    // Handle different model types with appropriate parameters
    const isFluxModel = model.includes("FLUX");
    const isSDXLModel = model.includes("xl") || model.includes("SDXL");
    
    let requestBody: any = {
      inputs: prompt,
    };

    // Add parameters based on model type
    if (isFluxModel) {
      requestBody.parameters = {
        width: Math.min(size.width, 1024), // FLUX has size limits
        height: Math.min(size.height, 1024),
        guidance_scale: 3.5, // FLUX uses lower guidance scale
        num_inference_steps: 4, // FLUX Schnell is optimized for 4 steps
        max_sequence_length: 256,
      };
    } else if (isSDXLModel) {
      requestBody.parameters = {
        width: size.width,
        height: size.height,
        guidance_scale: 7.5,
        num_inference_steps: 20,
      };
    } else {
      // Standard Stable Diffusion parameters
      requestBody.parameters = {
        width: Math.min(size.width, 512), // SD 1.x works best at 512x512
        height: Math.min(size.height, 512),
        guidance_scale: 7.5,
        num_inference_steps: 50,
      };
    }

    console.log(`Generating image with Hugging Face model: ${model}`, requestBody);

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Wait-For-Model": "true", // Wait for model to load if needed
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", errorText);
      
      if (response.status === 503) {
        throw new Error("Model is currently loading. Please try again in 20-30 seconds.");
      } else if (response.status === 401) {
        throw new Error("Invalid Hugging Face API key. Please check your API key.");
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      } else if (response.status === 400) {
        throw new Error("Invalid request parameters. The model might not support the requested size or parameters.");
      }
      
      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
    }

    // Check if response is JSON (error) or binary (image)
    const contentType = response.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      const errorData = await response.json();
      if (errorData.error) {
        throw new Error(`Hugging Face API error: ${errorData.error}`);
      }
    }

    // Get image as blob
    const imageBlob = await response.blob();
    
    if (imageBlob.size === 0) {
      throw new Error("Received empty image from Hugging Face API");
    }

    // Convert to base64 data URL
    const buffer = Buffer.from(await imageBlob.arrayBuffer());
    const base64Image = buffer.toString("base64");
    const mimeType = imageBlob.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    return {
      imageUrl: dataUrl,
      credits: 0, // Hugging Face doesn't use credits
      model: model.split("/").pop() || model,
    };
  } catch (error) {
    console.error("Hugging Face generation error:", error);
    throw error;
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
  customPrompt?: string,
  style?: string,
  customStyle?: string
): string {
  let basePrompt = ""
  
  if (customPrompt) {
    basePrompt = customPrompt
  } else {
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

    basePrompt = `Create a professional blog cover image for an article titled "${title}".`
    
    if (foundKeywords.length > 0) {
      basePrompt += ` The article focuses on ${foundKeywords.slice(0, 3).join(", ")}.`
    }
    
    basePrompt += " Modern, clean design with abstract tech elements. Professional color scheme."
  }
  
  // Add style if specified
  if (style && style !== "none") {
    const stylePrompts: Record<string, string> = {
      ghibli: "in Studio Ghibli style, anime aesthetic, soft colors, dreamy atmosphere, hand-drawn animation style",
      amigurumi: "in amigurumi style, cute crochet doll aesthetic, soft yarn texture, adorable kawaii design",
      cartoon: "in cartoon style, vibrant colors, bold outlines, animated illustration style",
      realistic: "photorealistic, high detail, professional photography style, realistic lighting",
      minimalist: "minimalist style, clean design, simple composition, flat design aesthetic",
      cyberpunk: "cyberpunk style, neon colors, futuristic aesthetic, dark atmosphere with bright accents",
      watercolor: "watercolor painting style, soft brushstrokes, flowing colors, artistic aesthetic",
      pixel_art: "pixel art style, 8-bit aesthetic, retro game graphics, blocky pixels",
      custom: customStyle || ""
    }
    
    const stylePrompt = stylePrompts[style] || ""
    if (stylePrompt) {
      basePrompt += `, ${stylePrompt}`
    }
  }
  
  return basePrompt
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
      style,
      customStyle,
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

    // Generate prompt with style
    const prompt = generatePromptFromContent(
      content || "", 
      title || "", 
      customPrompt,
      style,
      customStyle
    )

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
