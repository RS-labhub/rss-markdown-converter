import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Test with a simple prompt
    const prompt = "A beautiful landscape with mountains and sunset"
    const width = 512
    const height = 512
    
    // Direct test of Pollinations API
    const encodedPrompt = encodeURIComponent(prompt)
    const seed = Math.floor(Math.random() * 1000000)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`
    
    return NextResponse.json({
      success: true,
      message: "Image generation test",
      imageUrl: imageUrl,
      directLink: imageUrl,
      prompt: prompt,
      instructions: "Open the directLink in your browser to see the generated image"
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
