![banner](https://raw.githubusercontent.com/RS-labhub/rss-markdown-converter/master/public/og-image.png)

# RSS to Markdown Converter
A powerful web application that transforms RSS feeds into clean markdown content and repurposes it for multiple platforms using AI-powered content generation.

## Features

### RSS Feed Processing
- **Real-time RSS parsing** - Fetch and parse RSS feeds from any URL
- **Complete article extraction** - Retrieves all articles without pagination limits
- **Clean markdown conversion** - Converts HTML content to properly formatted markdown
- **Cover image extraction** - Automatically detects and displays article cover images
- **Metadata preservation** - Maintains author, date, and publication information

### Recent Feeds Management
- **Smart suggestions** - Auto-complete with recently used RSS feeds
- **Feed history** - Stores up to 10 recent feeds with metadata
- **Quick access** - One-click loading of previously used feeds
- **Feed management** - Remove individual feeds or clear all history

### Advanced Filtering
- **Text search** - Search through article titles and content
- **Author filtering** - Filter articles by specific authors
- **Date range filtering** - Filter articles by publication date
- **Real-time filtering** - Instant results as you type

### AI-Powered Content Generation
- **Multiple AI providers** - Choose between Groq (Llama 3.1 70B) and Gemini (2.0 Flash)
- **Platform-specific optimization** - Tailored content for each social media and blogging platform
- **Custom post types** - DevRel, technical, tutorial, opinion, news, and custom styles
- **Keyword integration** - Natural keyword inclusion in generated content

### Supported Platforms

#### Content Tools
- **Summary generation** - Concise article summaries
- **Workflow diagrams** - Mermaid diagram generation from content

#### Social Media Platforms
- **LinkedIn** - Professional posts with engagement hooks
- **X/Twitter** - Thread-optimized content with hashtags
- **Instagram** - Visual-friendly captions with emojis
- **Facebook** - Conversational posts for community engagement
- **Reddit** - Platform-appropriate discussion starters
- **YouTube** - Video descriptions with timestamps
- **TikTok** - Short-form video scripts

#### Blogging Platforms
- **Medium** - Article introductions and outlines
- **Dev.to** - Developer-focused technical content
- **Hashnode** - Technical blog posts with proper formatting

### User Experience
- **Responsive design** - Works seamlessly on desktop and mobile
- **Dark/light mode** - Automatic theme detection
- **Auto-scroll** - Automatically scrolls to generated content
- **Copy functionality** - One-click copying of markdown and generated content
- **Loading states** - Clear feedback during processing
- **Error handling** - Graceful error messages and recovery

## Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/ui** - Modern component library
- **Lucide React** - Beautiful icons

### Backend
- **Next.js API Routes** - Serverless API endpoints
- **XML2JS** - RSS feed parsing
- **Turndown** - HTML to Markdown conversion

### AI Integration
- **AI SDK** - Unified AI provider interface
- **Groq API** - Ultra-fast inference with Llama models
- **Google Gemini** - Advanced reasoning capabilities

### Storage
- **LocalStorage** - Client-side feed history persistence

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Environment Variables
Create a `.env.local` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/rss-markdown-converter.git
cd rss-markdown-converter
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Usage Guide

### Basic Workflow

1. **Enter RSS URL** - Paste any RSS feed URL into the input field
2. **Browse suggestions** - Use recent feeds for quick access
3. **Select article** - Click on any article from the parsed feed
4. **Choose AI provider** - Select between Groq or Gemini
5. **Configure settings** - Set post type and keywords
6. **Generate content** - Click on any platform button
7. **Copy and use** - Copy the generated content for your platform

### Advanced Features

#### Filtering Articles
- Use the search box to find specific articles
- Filter by author using the dropdown
- Set date ranges for time-specific content
- Combine filters for precise results

#### Content Customization
- Choose from predefined post types (DevRel, Technical, Tutorial, etc.)
- Add custom post types for specific needs
- Include keywords for SEO optimization
- Switch between AI providers for different writing styles

#### Feed Management
- Recent feeds appear as suggestions while typing
- Click on any suggestion to instantly load that feed
- Remove individual feeds or clear all history
- Feed metadata shows article count and last used date

## API Reference

### RSS Parser Endpoint
```
POST /api/rss-parser
Content-Type: application/json

{
  "url": "https://example.com/rss"
}
```

### AI Generation Endpoint
```
POST /api/ai-generate
Content-Type: application/json

{
  "content": "Article content",
  "title": "Article title",
  "type": "linkedin",
  "keywords": "react, javascript",
  "postType": "technical",
  "provider": "groq"
}
```

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain responsive design principles
- Add proper error handling
- Include loading states for async operations

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/rss-markdown-converter/issues) page
2. Create a new issue with detailed information
3. Contact the maintainer through GitHub

## Roadmap

- [ ] Bulk content generation for multiple platforms
- [ ] Content scheduling and automation
- [ ] Analytics dashboard for generated content
- [ ] Custom AI model integration
- [ ] Team collaboration features
- [ ] Content templates and presets
- [ ] Export functionality (PDF, DOCX)
- [ ] Integration with social media APIs for direct posting

&nbsp;

## Meet the Author

<img  src="https://raw.githubusercontent.com/RS-labhub/rss-markdown-converter/master/public/Author.jpg" alt="Author">

<div align="center">

**Built with ❤️ by [RS-labhub](https://github.com/RS-labhub)**
