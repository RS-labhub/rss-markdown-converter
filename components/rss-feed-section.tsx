"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RefreshCw, Rss, Filter, Search, Calendar, User, FileText, X, Clock, Trash2, Camera } from 'lucide-react'

interface RSSItem {
    title: string
    content: string
    author: string
    date: string
    link: string
    markdown: string
    coverImage?: string
    images: string[]
    category?: string
    categories?: string[]
}

interface FilterState {
    search: string
    author: string
    dateFrom: string
    dateTo: string
    selectedAuthors: string[]
}

interface RecentFeed {
    url: string
    title: string
    lastUsed: string
    articleCount: number
}

interface RSSFeedSectionProps {
    rssUrl: string
    setRssUrl: (url: string) => void
    rssItems: RSSItem[]
    selectedItem: RSSItem | null
    setSelectedItem: (item: RSSItem | null) => void
    loading: boolean
    filters: FilterState
    setFilters: (filters: FilterState) => void
    showFilters: boolean
    setShowFilters: (show: boolean) => void
    recentFeeds: RecentFeed[]
    removeRecentFeed: (url: string) => void
    fetchRSSFeed: (url?: string) => void
    filteredItems: RSSItem[]
    uniqueAuthors: string[]
}

export function RSSFeedSection({
    rssUrl,
    setRssUrl,
    rssItems,
    selectedItem,
    setSelectedItem,
    loading,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    recentFeeds,
    removeRecentFeed,
    fetchRSSFeed,
    filteredItems,
    uniqueAuthors,
}: RSSFeedSectionProps) {
    const [showSuggestions, setShowSuggestions] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const suggestionsRef = useRef<HTMLDivElement>(null)
    const [authorSearch, setAuthorSearch] = useState("")
    const [authorOpen, setAuthorOpen] = useState(false)
    const authorInputRef = useRef<HTMLInputElement>(null)

    // Handle clicks outside suggestions to close them
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRssUrl(e.target.value)
        setShowSuggestions(true)
    }

    const handleInputFocus = () => {
        if (recentFeeds.length > 0) {
            setShowSuggestions(true)
        }
    }

    const selectSuggestion = (feed: RecentFeed) => {
        setRssUrl(feed.url)
        setShowSuggestions(false)
        fetchRSSFeed(feed.url)
    }

    const clearFilters = () => {
        setFilters({
            search: "",
            author: "all",
            dateFrom: "",
            dateTo: "",
            selectedAuthors: [],
        })
    }

    // Filter suggestions based on input
    const filteredSuggestions = !rssUrl.trim()
        ? recentFeeds.slice(0, 5)
        : recentFeeds
            .filter(
                (feed) =>
                    feed.url.toLowerCase().includes(rssUrl.toLowerCase()) ||
                    feed.title.toLowerCase().includes(rssUrl.toLowerCase()),
            )
            .slice(0, 5)

    return (
        <div className="flex h-full min-h-0 flex-col">
            {/* Sticky header: title, URL input, search, filter toggle */}
            <div className="space-y-4 px-4 pt-5 pb-3">
                <div>
                    <div className="mb-1 flex items-center justify-between">
                        <Badge variant="outline" className="h-5 border-primary/30 bg-primary/5 px-1.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                            Step 1
                        </Badge>
                        {rssItems.length > 0 && (
                            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                                {rssItems.length} articles
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-base font-semibold tracking-tight">
                        <Rss className="h-4 w-4 text-primary" />
                        RSS Feed
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Paste any RSS feed URL to load articles
                    </p>
                </div>
                {/* RSS URL Input with Suggestions */}
                <div className="space-y-2">
                    <div className="relative">
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Input
                                    ref={inputRef}
                                    placeholder="https://example.com/rss"
                                    value={rssUrl}
                                    onChange={handleInputChange}
                                    onFocus={handleInputFocus}
                                    className="flex-1"
                                />

                                {/* Suggestions Dropdown */}
                                {showSuggestions && filteredSuggestions.length > 0 && (
                                    <div
                                        ref={suggestionsRef}
                                        className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
                                    >
                                        <div className="p-2">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs font-medium text-muted-foreground">Recent Feeds</span>
                                                {recentFeeds.length > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 px-2 text-xs"
                                                        onClick={() => {
                                                            // Clear all feeds logic would be handled by parent
                                                            setShowSuggestions(false)
                                                        }}
                                                    >
                                                        Clear All
                                                    </Button>
                                                )}
                                            </div>
                                            {filteredSuggestions.map((feed, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between p-2 hover:bg-accent rounded-sm cursor-pointer group"
                                                    onClick={() => selectSuggestion(feed)}
                                                >
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Rss className="w-3 h-3 text-primary flex-shrink-0" />
                                                            <span className="text-sm font-medium truncate">{feed.title}</span>
                                                        </div>
                                                        <div className="text-xs text-muted-foreground truncate">{feed.url}</div>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <FileText className="w-3 h-3" />
                                                                {feed.articleCount} articles
                                                            </span>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                {new Date(feed.lastUsed).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            removeRecentFeed(feed.url)
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Button onClick={() => fetchRSSFeed()} disabled={loading} size="sm">
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Fetch"}
                            </Button>
                        </div>
                    </div>

                    {rssItems.length > 0 && (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                                Showing {filteredItems.length} of {rssItems.length}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                                className="h-7 gap-1.5 px-2 text-xs"
                            >
                                <Filter className="h-3.5 w-3.5" />
                                {showFilters ? "Hide" : "Filter"}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Filters */}
                {showFilters && rssItems.length > 0 && (
                    <Card className="p-4 bg-muted/50">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Filters</Label>
                                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 px-2 text-xs">
                                    <X className="w-3 h-3 mr-1" />
                                    Clear
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search title or content..."
                                        value={filters.search}
                                        onChange={(e) =>
                                            setFilters({
                                                ...filters,
                                                search: e.target.value,
                                            })
                                        }
                                        className="pl-9 h-8"
                                    />
                                </div>

                                {/* Searchable author combobox using Popover (portals out of clipping sidebar) */}
                                <Popover open={authorOpen} onOpenChange={setAuthorOpen}>
                                    <PopoverTrigger asChild>
                                        <div className="relative">
                                            <User className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                ref={authorInputRef}
                                                placeholder={
                                                    filters.author && filters.author !== "all"
                                                        ? filters.author
                                                        : "Filter by author"
                                                }
                                                value={authorSearch}
                                                onFocus={() => setAuthorOpen(true)}
                                                onChange={(e) => {
                                                    setAuthorSearch(e.target.value)
                                                    setAuthorOpen(true)
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Escape") setAuthorOpen(false)
                                                }}
                                                className="h-8 pl-9 pr-8 text-xs"
                                            />
                                            {(authorSearch || (filters.author && filters.author !== "all")) && (
                                                <button
                                                    type="button"
                                                    aria-label="Clear author filter"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setAuthorSearch("")
                                                        setFilters({ ...filters, author: "" })
                                                    }}
                                                    className="absolute right-2 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            )}
                                        </div>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        align="start"
                                        sideOffset={4}
                                        onOpenAutoFocus={(e) => e.preventDefault()}
                                        className="z-[60] w-[var(--radix-popover-trigger-width)] p-0"
                                    >
                                        {(() => {
                                            const list = uniqueAuthors.filter((a) =>
                                                a.toLowerCase().includes(authorSearch.toLowerCase()),
                                            )
                                            // Each row has a fixed 32px height; show 5 at a time = 160px
                                            return (
                                                <div className="max-h-40 overflow-y-auto text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setFilters({ ...filters, author: "" })
                                                            setAuthorSearch("")
                                                            setAuthorOpen(false)
                                                        }}
                                                        className={`flex h-8 w-full shrink-0 items-center gap-2 px-3 text-left hover:bg-accent ${
                                                            !filters.author || filters.author === "all"
                                                                ? "font-medium text-foreground"
                                                                : "text-muted-foreground"
                                                        }`}
                                                    >
                                                        All authors
                                                    </button>
                                                    {list.length === 0 ? (
                                                        <div className="px-3 py-3 text-center text-muted-foreground">
                                                            No matches
                                                        </div>
                                                    ) : (
                                                        list.map((author) => {
                                                            const active = filters.author === author
                                                            return (
                                                                <button
                                                                    key={author}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setFilters({ ...filters, author })
                                                                        setAuthorSearch("")
                                                                        setAuthorOpen(false)
                                                                    }}
                                                                    className={`flex h-8 w-full shrink-0 items-center gap-2 truncate px-3 text-left hover:bg-accent ${
                                                                        active ? "bg-accent text-foreground" : ""
                                                                    }`}
                                                                >
                                                                    <span className="truncate">{author}</span>
                                                                </button>
                                                            )
                                                        })
                                                    )}
                                                </div>
                                            )
                                        })()}
                                    </PopoverContent>
                                </Popover>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-muted-foreground">From</Label>
                                        <Input
                                            type="date"
                                            value={filters.dateFrom}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    dateFrom: e.target.value,
                                                })
                                            }
                                            className="h-8"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-muted-foreground">To</Label>
                                        <Input
                                            type="date"
                                            value={filters.dateTo}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    dateTo: e.target.value,
                                                })
                                            }
                                            className="h-8"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            {/* Scrollable list area */}
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5">
                {/* Articles List */}
                {rssItems.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-10 text-center">
                        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                            <Rss className="h-5 w-5 text-primary" />
                        </div>
                        <p className="text-sm font-medium">No feed loaded yet</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Paste an RSS URL above and hit{" "}
                            <span className="font-medium text-foreground">Fetch</span>
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                            {filteredItems.map((item, index) => {
                                const isSelected = selectedItem === item
                                return (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedItem(item)}
                                        className={`group w-full rounded-lg border p-3 text-left transition-all ${
                                            isSelected
                                                ? "border-primary/60 bg-primary/5 shadow-sm"
                                                : "border-border/60 hover:border-border hover:bg-muted/40"
                                        }`}
                                    >
                                        {item.coverImage ? (
                                            <div className="relative mb-2 overflow-hidden rounded-md">
                                                <img
                                                    src={item.coverImage || "/placeholder.svg"}
                                                    alt={item.title}
                                                    className="h-24 w-full object-cover transition-transform group-hover:scale-[1.03]"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none"
                                                    }}
                                                />
                                                {item.category && (
                                                    <span className="absolute right-1.5 top-1.5 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm backdrop-blur-sm">
                                                        {item.category}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            item.category && (
                                                <div className="mb-2">
                                                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                                        {item.category}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                        <h4
                                            className={`mb-2 line-clamp-2 text-sm font-medium leading-snug ${
                                                isSelected ? "text-foreground" : "text-foreground/90"
                                            }`}
                                        >
                                            {item.title}
                                        </h4>
                                        <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(item.date).toLocaleDateString()}
                                                </span>
                                                {item.images.length > 0 && (
                                                    <span className="inline-flex items-center gap-1">
                                                        <Camera className="h-3 w-3" />
                                                        {item.images.length}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="max-w-[6.5rem] truncate" title={item.author}>
                                                {item.author}
                                            </span>
                                        </div>
                                    </button>
                                )
                            })}
                            {filteredItems.length === 0 && rssItems.length > 0 && (
                                <div className="py-8 text-center text-muted-foreground">
                                    <Filter className="mx-auto mb-2 h-7 w-7 opacity-50" />
                                    <p className="text-sm">No articles match your filters</p>
                                </div>
                            )}
                    </div>
                )}
            </div>
        </div>
    )
}
