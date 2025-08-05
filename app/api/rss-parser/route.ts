import { type NextRequest, NextResponse } from "next/server"
import { parseStringPromise } from "xml2js"
import TurndownService from "turndown"

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
})

// Configure turndown to handle images and code blocks properly
turndownService.addRule("images", {
  filter: "img",
  replacement: (content, node: any) => {
    const alt = node.getAttribute("alt") || ""
    const src = node.getAttribute("src") || ""
    return `![${alt}](${src})`
  },
})

// Handle code blocks better
turndownService.addRule("codeBlocks", {
  filter: ["pre", "code"],
  replacement: (content, node: any) => {
    if (node.nodeName === "PRE") {
      return `\`\`\`\n${content}\n\`\`\``
    }
    return `\`${content}\``
  },
})

// Extract images from HTML content
function extractImages(htmlContent: string): string[] {
  const imgRegex = /<img[^>]+src="([^">]+)"/g
  const images: string[] = []
  let match

  while ((match = imgRegex.exec(htmlContent)) !== null) {
    images.push(match[1])
  }

  return images
}

// Extract cover image from content
function extractCoverImage(htmlContent: string, item: any): string | undefined {
  // Try to get image from media:content or enclosure first
  const mediaContent = item["media:content"]?.[0]?.$?.url
  if (
    mediaContent &&
    (mediaContent.includes(".jpg") ||
      mediaContent.includes(".png") ||
      mediaContent.includes(".jpeg") ||
      mediaContent.includes(".webp"))
  ) {
    return mediaContent
  }

  const enclosure = item.enclosure?.[0]?.$
  if (enclosure?.type?.startsWith("image/")) {
    return enclosure.url
  }

  // Extract first image from content
  const imgMatch = htmlContent.match(/<img[^>]+src="([^">]+)"/)
  if (imgMatch) {
    return imgMatch[1]
  }

  return undefined
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "RSS URL is required" }, { status: 400 })
    }

    // Fetch RSS feed
    const response = await fetch(url, {
      headers: {
        "User-Agent": "RSS-Markdown-Platform/1.0",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xmlData = await response.text()

    // Parse XML
    const result = await parseStringPromise(xmlData)
    const items = result.rss?.channel?.[0]?.item || result.feed?.entry || []

    // Process ALL items (removed the slice limit)
    const processedItems = items.map((item: any, index: number) => {
      // Handle different RSS formats (RSS 2.0, Atom, etc.)
      const title = item.title?.[0]?._ || item.title?.[0] || item.title || `Untitled Article ${index + 1}`
      const content =
        item["content:encoded"]?.[0] ||
        item.description?.[0] ||
        item.content?.[0]?._ ||
        item.summary?.[0] ||
        "No content available"

      const author =
        item.author?.[0]?.name?.[0] ||
        item.author?.[0] ||
        item["dc:creator"]?.[0] ||
        item.creator?.[0] ||
        "Unknown Author"

      const date =
        item.pubDate?.[0] ||
        item.published?.[0] ||
        item["dc:date"]?.[0] ||
        item.updated?.[0] ||
        new Date().toISOString()

      const link =
        item.link?.[0]?.$?.href || item.link?.[0] || item.guid?.[0]?._ || item.guid?.[0] || item.id?.[0] || "#"

      // Convert HTML content to clean markdown
      const cleanContent = typeof content === "string" ? content : String(content)

      // Clean up HTML before conversion
      const cleanedHtml = cleanContent
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "") // Remove styles
        .replace(/<!--[\s\S]*?-->/g, "") // Remove comments

      // Extract images and cover image
      const images = extractImages(cleanedHtml)
      const coverImage = extractCoverImage(cleanedHtml, item)

      const markdown = `# ${title}\n\n${turndownService.turndown(cleanedHtml)}`

      return {
        title: typeof title === "string" ? title.trim() : String(title).trim(),
        content: cleanedHtml,
        author: typeof author === "string" ? author.trim() : String(author).trim(),
        date: typeof date === "string" ? date : String(date),
        link: typeof link === "string" ? link : String(link),
        markdown: markdown.trim(),
        coverImage,
        images,
      }
    })

    // Sort by date (newest first)
    processedItems.sort((a: { date: string }, b: { date: string }) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({
      items: processedItems,
      total: processedItems.length,
      feedTitle: result.rss?.channel?.[0]?.title?.[0] || result.feed?.title?.[0] || "RSS Feed",
    })
  } catch (error) {
    console.error("RSS parsing error:", error)
    return NextResponse.json(
      {
        error: "Failed to parse RSS feed. Please check the URL and try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
