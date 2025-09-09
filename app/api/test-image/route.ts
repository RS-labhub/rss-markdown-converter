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
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=turbo`
    
    // Test if the image URL actually works
    try {
      const testResponse = await fetch(imageUrl, { 
        method: "HEAD",
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })
      
      const contentType = testResponse.headers.get('content-type')
      const isValidImage = testResponse.ok && contentType && contentType.startsWith('image/')
      
      return NextResponse.json({
        success: true,
        message: "Image generation test completed",
        imageUrl: isValidImage ? imageUrl : null,
        directLink: imageUrl,
        prompt: prompt,
        status: testResponse.status,
        contentType: contentType,
        isValidImage: isValidImage,
        instructions: isValidImage 
          ? "Image URL is working correctly" 
          : "Image URL test failed - check the directLink manually"
      })
    } catch (testError) {
      return NextResponse.json({
        success: false,
        message: "Image URL test failed",
        error: testError instanceof Error ? testError.message : "Unknown error",
        imageUrl: null,
        directLink: imageUrl,
        prompt: prompt
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}
