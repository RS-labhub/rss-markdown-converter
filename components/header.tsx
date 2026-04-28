"use client"

import type { ReactNode } from "react"
import { Rss, Github, ExternalLink, Menu, FileText, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

export type HeaderTab = "content-tools" | "author-generator"

interface HeaderProps {
  mobileSidebarOpen?: boolean
  setMobileSidebarOpen?: (open: boolean) => void
  sidebar?: ReactNode
  activeTab?: HeaderTab
  onTabChange?: (tab: HeaderTab) => void
}

const tabs: Array<{ id: HeaderTab; label: string; icon: typeof FileText }> = [
  { id: "content-tools", label: "Content Tools", icon: FileText },
  { id: "author-generator", label: "Author Generator", icon: Users },
]

export function Header({
  mobileSidebarOpen,
  setMobileSidebarOpen,
  sidebar,
  activeTab,
  onTabChange,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2">
          {sidebar && setMobileSidebarOpen && (
            <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 lg:hidden"
                  aria-label="Open feed sidebar"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full max-w-sm overflow-y-auto p-4 sm:p-6">
                <SheetHeader className="mb-4">
                  <SheetTitle>RSS Feed</SheetTitle>
                </SheetHeader>
                {sidebar}
              </SheetContent>
            </Sheet>
          )}

          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 shadow-sm">
              <Rss className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="hidden min-w-0 flex-col leading-tight sm:flex">
              <span className="truncate text-sm font-semibold tracking-tight">RSS to Markdown</span>
              <span className="truncate text-[10px] text-muted-foreground">
                AI-powered content studio
              </span>
            </div>
          </div>
        </div>

        {/* Tab switcher in header */}
        {activeTab && onTabChange && (
          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 rounded-full border border-border/60 bg-muted/40 p-1 md:flex"
          >
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onTabChange(id)}
                  suppressHydrationWarning
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              )
            })}
          </nav>
        )}

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-9 w-9 sm:inline-flex"
            aria-label="GitHub"
            onClick={() =>
              window.open("https://github.com/RS-labhub/rss-markdown-converter", "_blank")
            }
          >
            <Github className="h-4 w-4" />
          </Button>
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 rounded-full px-3 text-xs font-medium"
            onClick={() =>
              window.open("https://rohan-sharma-portfolio.vercel.app", "_blank")
            }
          >
            <span className="hidden sm:inline">Rohan Sharma</span>
            <span className="sm:hidden">RS</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Mobile tab switcher row */}
      {activeTab && onTabChange && (
        <div className="border-t border-border/40 px-4 py-2 md:hidden">
          <nav
            aria-label="Primary mobile"
            className="grid grid-cols-2 gap-1 rounded-full bg-muted/40 p-1"
          >
            {tabs.map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onTabChange(id)}
                  suppressHydrationWarning
                  className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
