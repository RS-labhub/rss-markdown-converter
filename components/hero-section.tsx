"use client"

import { useEffect, useState } from "react"
import { Rss, Sparkles, Share2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const DISMISS_KEY = "rss-md-hero-dismissed-v1"

export function HeroSection() {
  const [dismissed, setDismissed] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1")
  }, [])

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DISMISS_KEY, "1")
    }
    setDismissed(true)
  }

  if (dismissed === null || dismissed) {
    return null
  }

  const steps = [
    {
      icon: Rss,
      title: "1. Add a feed",
      desc: "Paste any RSS URL on the left to load articles.",
    },
    {
      icon: Sparkles,
      title: "2. Pick an article",
      desc: "Preview clean markdown and source content.",
    },
    {
      icon: Share2,
      title: "3. Repurpose with AI",
      desc: "Generate posts for LinkedIn, X, Medium and more.",
    },
  ]

  return (
    <section className="relative mb-8 mt-6 overflow-hidden rounded-2xl border border-border/60 bg-card/60 px-5 py-7 shadow-sm backdrop-blur-sm sm:mt-8 sm:px-8 sm:py-9">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, hsl(var(--primary) / 0.18), transparent 70%)",
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-7 w-7 text-muted-foreground"
        onClick={handleDismiss}
        aria-label="Dismiss onboarding"
      >
        <X className="h-4 w-4" />
      </Button>

      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Get started in 3 steps
        </div>
      </div>

      <div className="mx-auto mt-5 grid max-w-4xl gap-3 sm:grid-cols-3 sm:gap-4">
        {steps.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-xl border border-border/60 bg-background/60 p-4 text-left transition-colors hover:border-primary/40"
          >
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
