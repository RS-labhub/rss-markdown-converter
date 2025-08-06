"use client"

import { Button } from "@/components/ui/button"
import { Heart, Github, Linkedin, Twitter, Globe } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white/50 backdrop-blur-sm rounded-lg">
      <div className="px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Made with love by</span>
            <span className="font-semibold text-gray-900">Rohan Sharma</span>
            <Heart className="h-4 w-4 text-red-500" />
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-gray-600 hover:text-gray-900"
              onClick={() => window.open("https://github.com/RS-labhub", "_blank")}
            >
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-gray-600 hover:text-gray-900"
              onClick={() => window.open("https://www.linkedin.com/in/rohan-sharma-9386rs/", "_blank")}
            >
              <Linkedin className="mr-2 h-4 w-4" />
              LinkedIn
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-gray-600 hover:text-gray-900"
              onClick={() => window.open("https://twitter.com/rrs00179", "_blank")}
            >
              <Twitter className="mr-2 h-4 w-4" />X (Twitter)
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-gray-600 hover:text-gray-900"
              onClick={() => window.open("https://rohan-sharma-portfolio.vercel.app", "_blank")}
            >
              <Globe className="mr-2 h-4 w-4" />
              Portfolio
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p className="mt-1">
              Must check the{" "}
              <a
                href="https://content-generation-platform.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 underline hover:text-gray-800"
              >
                Content Generation Platform
              </a>
            </p>
            <p className="mt-1">© 2025 RSS to Markdown Converter.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
