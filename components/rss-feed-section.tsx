"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
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
        <Card className="xl:col-span-1 shadow-lg">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Rss className="w-5 h-5 text-primary" />
                    RSS Feed
                </CardTitle>
                <CardDescription>Enter RSS feed URL to fetch all articles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>
                                {filteredItems.length} of {rssItems.length} articles
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-8 px-2">
                                <Filter className="w-4 h-4" />
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

                                <Select
                                    value={filters.author}
                                    onValueChange={(value) =>
                                        setFilters({
                                            ...filters,
                                            author: value === "all" ? "" : value,
                                        })
                                    }
                                >
                                    <SelectTrigger className="h-8">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4" />
                                            <SelectValue placeholder="Filter by author" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All authors</SelectItem>
                                        {uniqueAuthors.map((author) => (
                                            <SelectItem key={author} value={author}>
                                                {author}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

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

                {/* Articles List */}
                <ScrollArea className="h-[600px]">
                    <div className="space-y-3 px-1">
                        {filteredItems.map((item, index) => (
                            <Card
                                key={index}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${selectedItem === item ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/30"
                                    }`}
                                onClick={() => setSelectedItem(item)}
                            >
                                <CardContent className="p-4">
                                    {item.coverImage && (
                                        <div className="mb-3 rounded-lg overflow-hidden">
                                            <img
                                                src={item.coverImage || "/placeholder.svg"}
                                                alt={item.title}
                                                className="w-full h-24 object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none"
                                                }}
                                            />
                                        </div>
                                    )}
                                    <h4 className="font-medium text-sm line-clamp-2 mb-2 text-center sm:text-left">{item.title}</h4>
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Badge variant="outline" className="text-xs px-2 py-0">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(item.date).toLocaleDateString()}
                                            </Badge>
                                            {item.images.length > 0 && (
                                                <Badge variant="outline" className="text-xs px-2 py-0">
                                                    <Camera className="w-3 h-3 mr-1" />
                                                    {item.images.length}
                                                </Badge>
                                            )}
                                        </div>
                                        <span
                                            className="text-xs text-muted-foreground truncate max-w-24 text-center sm:text-right"
                                            title={item.author}
                                        >
                                            {item.author}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {filteredItems.length === 0 && rssItems.length > 0 && (
                            <div className="text-center text-muted-foreground py-8">
                                <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>No articles match your filters</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}
