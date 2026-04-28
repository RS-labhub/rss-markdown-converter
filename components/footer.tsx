"use client"

import { Heart, Github, Linkedin, Twitter, Globe } from "lucide-react"

const links = [
  {
    href: "https://github.com/RS-labhub/rss-markdown-converter",
    label: "GitHub",
    icon: Github,
  },
  {
    href: "https://www.linkedin.com/in/rohan-sharma-9386rs/",
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    href: "https://twitter.com/rrs00179",
    label: "Twitter",
    icon: Twitter,
  },
  {
    href: "https://rohan-sharma-portfolio.vercel.app",
    label: "Portfolio",
    icon: Globe,
  },
]

export function Footer() {
  return (
    <footer>
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          © {new Date().getFullYear()}
          <span className="text-foreground/40">·</span>
          Built with
          <Heart className="h-3 w-3 fill-red-500 text-red-500" />
          by
          <a
            href="https://rohan-sharma-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Rohan Sharma
          </a>
        </span>

        <span className="hidden items-center gap-1.5 md:flex">
          <span className="text-foreground/40">Try also</span>
          <a
            href="https://content-generation-platform.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground transition-colors hover:text-primary"
          >
            Content Generation Platform
          </a>
        </span>

        <div className="flex items-center gap-0.5">
          {links.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon className="h-3.5 w-3.5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
