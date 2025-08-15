import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { action, name, rawContent } = await request.json()

    if (action === "add") {
      if (!name || !rawContent) {
        return NextResponse.json({ error: "Name and content are required" }, { status: 400 })
      }

      // In a real app, you'd save to a database
      // For now, we'll just return success since the client handles storage
      return NextResponse.json({
        success: true,
        message: `Persona ${name} trained successfully`,
        name,
        contentLength: rawContent.length,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Persona training error:", error)
    return NextResponse.json({ error: "Failed to process persona training request" }, { status: 500 })
  }
}
