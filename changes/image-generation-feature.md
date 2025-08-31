# AI Image Generation Feature

## Overview
Added a comprehensive AI image generation feature to the RSS Markdown Converter app. This feature allows users to generate blog cover images using AI, with support for both free and premium providers.

## Features

### 1. Multiple AI Providers
- **AI Image Generator (Free - Default)**
  - Uses Pollinations AI for free image generation
  - No API key or authentication required
  - Fast generation with multiple size options
  - Automatic fallback to ensure reliability
  - Supports sizes from 512x512 up to 1024x1024

- **OpenAI DALL-E (Premium)**
  - DALL-E 3 (best quality)
  - High resolution images up to 1792x1024
  - Requires OpenAI API key
  - Credit usage tracking

### 2. Smart Prompt Generation
- **Auto Mode**: Automatically generates prompts based on blog content and title
- **Custom Mode**: Allows users to write their own prompts
- Intelligent keyword extraction from blog content

### 3. Image Sizes
Multiple aspect ratios available:
- Square (512x512, 1024x1024)
- Portrait (512x768, 1024x1792)  
- Landscape (768x512, 1792x1024)

### 4. User Interface
- Clean, intuitive dialog with real-time configuration
- Live preview of generated images
- Download button for saving images locally
- Copy URL button for images with external URLs
- Credit usage display for premium providers

### 5. Technical Details

#### API Endpoint
- `/api/image-generate` - Handles image generation requests
- Supports both base64 encoded images and external URLs
- CORS proxy support for external images

#### Components
- `ImageGenerationDialog` - Main UI component for image generation
- Integration with existing AI tools section
- Seamless API key management

#### Error Handling
- Comprehensive error messages
- Fallback options when models are unavailable
- Loading states and progress indicators

## Usage

1. Click on "AI Image" button in the Content Tools section
2. Select a provider (Hugging Face is free and default)
3. Choose a model and image size
4. Either use auto-generated prompt or write custom prompt
5. Click "Generate Image"
6. Preview and download the generated image

## Benefits

- **Cost Effective**: Free models available by default
- **Flexibility**: Multiple providers and models to choose from
- **Professional Quality**: High-resolution images suitable for blog covers
- **Easy Integration**: Generated images can be directly used in blog posts
- **Privacy**: Free models don't require API keys or user data

## Future Enhancements
- Additional free model providers
- Image editing capabilities
- Batch generation support
- Style presets for common blog types
