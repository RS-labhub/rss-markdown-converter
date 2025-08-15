import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("=== Image Proxy API Called ===")

  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get("url")

    console.log("Proxy request for URL:", imageUrl)

    if (!imageUrl) {
      console.error("No image URL provided")
      return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
    }

    // Handle base64 data URLs directly
    if (imageUrl.startsWith("data:image/")) {
      console.log("Handling base64 data URL")
      try {
        const [header, base64Data] = imageUrl.split(",")
        if (!base64Data) {
          throw new Error("Invalid base64 data URL format")
        }

        const mimeMatch = header.match(/data:([^;]+)/)
        const contentType = mimeMatch ? mimeMatch[1] : "image/png"

        const buffer = Buffer.from(base64Data, "base64")
        console.log("Base64 image buffer size:", buffer.length)

        if (buffer.length === 0) {
          throw new Error("Empty base64 image data")
        }

        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Content-Length": buffer.length.toString(),
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
          },
        })
      } catch (error) {
        console.error("Error processing base64 data URL:", error)
        return NextResponse.json({ error: "Invalid base64 image data" }, { status: 400 })
      }
    }

    // For HTTP URLs, fetch and proxy
    console.log("Fetching HTTP image from:", imageUrl)

    const response = await fetch(imageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ImageProxy/1.0)",
        Accept: "image/*,*/*",
      },
    })

    console.log("Fetch response status:", response.status)

    if (!response.ok) {
      console.error("Failed to fetch image:", response.status, response.statusText)
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: response.status },
      )
    }

    const contentType = response.headers.get("content-type") || "image/png"
    const arrayBuffer = await response.arrayBuffer()

    console.log("Image fetched successfully!")
    console.log("Content type:", contentType)
    console.log("Buffer size:", arrayBuffer.byteLength)

    if (arrayBuffer.byteLength === 0) {
      console.error("Empty image buffer received")
      return NextResponse.json({ error: "Empty image received" }, { status: 500 })
    }

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": arrayBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("=== Proxy Image Error ===")
    console.error("Error details:", error)

    return NextResponse.json(
      {
        error: "Failed to proxy image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
