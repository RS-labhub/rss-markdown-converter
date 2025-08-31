# Hugging Face Image Generation Integration Guide

## Overview
RSS Markdown Converter now supports Hugging Face models for AI image generation, alongside the existing Pollinations (free), OpenAI DALL-E providers, and HuggingFace free models.

## Available Providers

### 1. Pollinations AI (Free - Default)
- **No API Key Required**
- Fast generation
- Completely free to use
- Good quality results

### 2. OpenAI DALL-E
- **Requires OpenAI API Key**
- Premium quality (DALL-E 3)
- Costs money per generation
- Best for professional use

### 3. Hugging Face Models (NEW)
- **Requires Hugging Face API Key**
- Multiple open-source models available:
  - **FLUX.1 Schnell** - Very fast, good quality (default)
  - **SDXL Base 1.0** - Stable Diffusion XL, excellent quality
  - **Stable Diffusion 1.5** - Classic, reliable
  - **Stable Diffusion 1.4** - Older but stable

## How to Get a Hugging Face API Key

1. **Create Account**: Go to https://huggingface.co and sign up (free)

2. **Get API Key**: 
   - Go to Settings → Access Tokens
   - Click "New token"
   - Give it a name (e.g., "RSS Converter")
   - Select "read" permission (that's all you need)
   - Copy the token (starts with `hf_`)

3. **Add to App**:
   - Open image generation dialog
   - Select "Hugging Face Models" provider
   - Click "Add API Key"
   - Paste your token
   - Give it a friendly name

## Pricing Information

### Hugging Face API Pricing
- **Free Tier**: Limited requests per month (usually sufficient for personal use)
- **Rate Limits**: ~30 requests per hour on free tier
- **Pro Account**: $9/month for increased limits
- **Note**: Some models may be slower on free tier due to cold starts

### Comparison
- **Pollinations**: Completely free, no limits
- **Hugging Face**: Free tier available, paid for more usage
- **OpenAI**: Pay per image ($0.02-0.08 per image depending on quality)

## Model Recommendations

### For Speed
- Pollinations (Turbo mode)
- FLUX.1 Schnell (Hugging Face)

### For Quality
- DALL-E 3 (OpenAI) - Best overall
- SDXL Base 1.0 (Hugging Face) - Best open-source

### For Reliability
- Pollinations (always available)
- Stable Diffusion 1.5 (Hugging Face)

## Common Issues

### "Model is loading"
- Hugging Face models may need 10-20 seconds to load on first use
- Just retry after waiting

### Rate Limit Errors
- Free tier has hourly limits
- Wait an hour or upgrade to Pro

### API Key Not Working
- Make sure it starts with `hf_`
- Check if token has "read" permission
- Verify token hasn't expired

## Features Added

1. **Multiple Providers**: Choose between free and premium options
2. **Model Selection**: Pick specific models for different styles
3. **Size Options**: Various aspect ratios and resolutions
4. **API Key Management**: Secure storage with encryption
5. **Preview & Download**: See results and save images
6. **Error Handling**: Clear messages for common issues

## Usage Tips

1. Start with Pollinations (free) for testing
2. Use Hugging Face for more control over models
3. Use OpenAI for highest quality commercial work
4. Always preview before downloading
5. Save your favorite prompts for reuse

## Technical Implementation

- API keys stored encrypted in localStorage
- Keys sent securely from client to server
- Server-side API calls to avoid CORS issues
- Automatic fallback to free service if premium fails
- Image previews use data URLs or proxy for external images
