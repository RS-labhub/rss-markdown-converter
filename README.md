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
- **Multiple AI providers** - Choose between Groq (Llama 3.3 70B), Gemini (2.0 Flash), OpenAI (GPT-5, GPT-4o), and Anthropic (Claude 3 Opus/Sonnet)
- **GPT-5 support** - Latest cutting-edge model from OpenAI as default for premium content generation
- **Platform-specific optimization** - Tailored content for each social media and blogging platform
- **Advanced persona training** - Train custom AI personas with sentiment analysis, readability metrics, and semantic clustering
- **Custom post types** - DevRel, technical, tutorial, opinion, news, and custom styles
- **Keyword integration** - Natural keyword inclusion in generated content
- **Professional formatting** - Clean, emoji-free content focused on professional presentation
- **Multi-modal preferences** - Analyze and replicate content structure, formatting, and engagement patterns

### Supported Platforms

#### Content Tools
- **Summary generation** - Concise article summaries
- **Workflow diagrams** - Mermaid diagram generation from content
- **Image Generation** - Generate images using free models (Pollinations AI), premium models (DALL-E by OpenAI), or open-source models from HuggingFace
- **Author content generation** - Generate content in the style of specific authors using trained personas
- **Persona training** - Train AI on writing samples with advanced analytics including sentiment analysis, readability metrics, and semantic clustering

#### Social Media Platforms
- **LinkedIn** - Professional posts with engagement hooks (no emojis, clean formatting)
- **X/Twitter** - Thread-optimized content with hashtags (professional tone)
- **Instagram** - Clean captions with strategic hashtag placement
- **Facebook** - Conversational posts for community engagement
- **Discord** - Community-friendly messaging with markdown support
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
- **API key management** - Secure browser-based storage for OpenAI and Anthropic keys
- **Model selection** - Dynamic model selection with fallback options
- **Professional output** - Clean, emoji-free content optimized for business use

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
- **OpenAI** - GPT-5 (default), GPT-4o, GPT-4o-mini for premium content generation
- **Anthropic** - Claude 3 Opus and Sonnet for high-quality long-form content
- **HuggingFace** - Open-source image generation models
- **Advanced persona analysis** - Sentiment analysis, readability metrics, semantic clustering
- **Multi-modal content support** - Text, image, and formatting preference analysis

### Storage
- **LocalStorage** - Client-side feed history persistence

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Environment Variables
Create a `.env.local` file in the root directory:

```env
# Required for default AI providers
GROQ_API_KEY=your_groq_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here

# Optional - for premium AI models (can also be added via UI)
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

**Note**: OpenAI and Anthropic API keys can be managed through the application UI and are stored securely in your browser's local storage.

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
4. **Choose AI provider** - Select between Groq, Gemini, OpenAI (GPT-5), or Anthropic
5. **Configure settings** - Set post type, keywords, and persona options
6. **Generate content** - Click on any platform button
7. **Copy and use** - Copy the generated content for your platform

### Advanced Features

#### AI Model Selection
- **GPT-5** - Latest OpenAI model for cutting-edge content generation
- **GPT-4o/4o-mini** - Proven OpenAI models for reliable content
- **Claude 3 Opus/Sonnet** - Anthropic models for nuanced, long-form content
- **Gemini 2.0 Flash** - Google's fast, capable model
- **Llama 3.3 70B** - High-performance open-source model via Groq

#### Persona Training & Management
- **Custom personas** - Train AI on specific writing styles using sample content
- **Advanced analytics** - Sentiment analysis, readability metrics, semantic clustering
- **Writing pattern analysis** - Tone, structure, vocabulary, and engagement patterns
- **Multi-modal preferences** - Image usage, formatting styles, and content structure
- **Built-in personas** - Pre-trained personas for popular tech writers and DevRel professionals

#### Professional Content Generation
- **No emoji policy** - All content generated without emojis for professional use
- **Clean formatting** - Focus on text quality and readability
- **Strategic link placement** - Links included only when they add value
- **Platform optimization** - Content tailored for each platform's best practices

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
- Train custom personas with your own writing samples
- Apply advanced writing pattern analysis for consistent voice

#### Feed Management
- Recent feeds appear as suggestions while typing
- Click on any suggestion to instantly load that feed
- Remove individual feeds or clear all history
- Feed metadata shows article count and last used date

## AI Model Guide

### OpenAI Models
| Model | Best For | Speed | Quality | Cost |
|-------|----------|-------|---------|------|
| **GPT-5** | All content types (default) | Fast | Excellent | Premium |
| GPT-4o | Blog content, complex analysis | Medium | Very High | High |
| GPT-4o-mini | Social posts, quick generation | Very Fast | High | Low |
| GPT-4-turbo | Legacy support | Medium | High | Medium |

### Anthropic Models
| Model | Best For | Speed | Quality | Cost |
|-------|----------|-------|---------|------|
| Claude 3 Opus | Long-form blog content | Slow | Excellent | Premium |
| Claude 3.5 Sonnet | Balanced content generation | Medium | Very High | Medium |
| Claude 3.5 Haiku | Quick social posts | Fast | Good | Low |

### Free Models
| Model | Provider | Best For | Speed | Quality |
|-------|----------|----------|-------|---------|
| Llama 3.3 70B | Groq | Technical content | Ultra Fast | High |
| Gemini 2.0 Flash | Google | Creative content | Fast | High |

### Recommended Combinations
- **Professional Blogs**: GPT-5 or Claude 3 Opus
- **Social Media**: GPT-5 or Claude 3.5 Sonnet  
- **Quick Posts**: GPT-4o-mini or Llama 3.3 70B
- **Creative Content**: Gemini 2.0 Flash or GPT-5
- **Technical Writing**: GPT-5 or Llama 3.3 70B

## API Reference

### Recent Updates & Features

#### GPT-5 Integration (Latest)
- **Default model** - GPT-5 is now the default for all OpenAI content generation
- **Cutting-edge AI** - Access to the latest language model capabilities
- **Improved quality** - Enhanced reasoning and content generation
- **Backward compatibility** - Fallback to GPT-4o and other models as needed

#### Enhanced Persona Training System
- **Advanced analytics** - Sentiment analysis, readability scoring, semantic clustering
- **Writing pattern extraction** - Tone, structure, vocabulary analysis
- **Multi-modal support** - Image preferences, formatting styles, engagement patterns
- **Adaptive learning** - System learns and improves from feedback
- **Built-in personas** - Pre-trained models for tech industry personalities

#### Professional Content Standards
- **No emojis policy** - All generated content is emoji-free for professional use
- **Clean formatting** - Focus on text quality and readability
- **Strategic link usage** - Links only included when they add significant value
- **Platform-specific optimization** - Tailored guidelines for each social media and blogging platform

#### Image Generation Enhancements
- **Multiple providers** - Pollinations AI (free), OpenAI DALL-E (premium), HuggingFace models
- **Workflow integration** - Generate images directly from article content
- **Quality options** - Choose between speed and quality based on your needs

#### Model Selection Intelligence
- **Dynamic defaults** - Best model automatically selected based on content type
- **Provider comparison** - Easy switching between AI providers
- **Custom model support** - Add your own model configurations
- **Performance optimization** - Faster generation with smart model routing

### Internal API Reference

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
  "provider": "openai",
  "model": "gpt-5",
  "apiKey": "your_api_key_here",
  "personaTrainingData": "optional_training_content",
  "extractedLinks": [{"url": "...", "text": "..."}],
  "includeSourceLink": true
}
```

### Persona Training Endpoint
```
POST /api/persona-training
Content-Type: application/json

{
  "content": "Training content samples",
  "personaName": "custom_persona",
  "analysisType": "advanced"
}
```

### Image Generation Endpoint
```
POST /api/image-generate
Content-Type: application/json

{
  "prompt": "Image description",
  "provider": "openai",
  "model": "dall-e-3",
  "size": "1024x1024",
  "quality": "hd"
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

### Completed ✅
- [x] GPT-5 integration as default model
- [x] Advanced persona training with analytics
- [x] Professional content standards (no emojis)
- [x] Multi-provider image generation
- [x] Enhanced API key management
- [x] Sentiment analysis and readability metrics
- [x] Semantic clustering for content analysis
- [x] Multi-modal preference learning

### In Progress 🚧
- [ ] Bulk content generation for multiple platforms
- [ ] Content scheduling and automation
- [ ] Advanced persona feedback system
- [ ] Real-time collaboration features

### Planned 📋
- [ ] Analytics dashboard for generated content
- [ ] Custom AI model integration beyond major providers
- [ ] Team collaboration and workspace features
- [ ] Content templates and presets library
- [ ] Export functionality (PDF, DOCX, multiple formats)
- [ ] Integration with social media APIs for direct posting
- [ ] Content performance tracking and optimization
- [ ] Multi-language support and translation
- [ ] Voice-to-content generation capabilities

&nbsp;

## Meet the Author

<img  src="https://raw.githubusercontent.com/RS-labhub/rss-markdown-converter/master/public/Author.jpg" alt="Author">

<div align="center">

**Built with ❤️ by [RS-labhub](https://github.com/RS-labhub)**
