"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { fetchNostrPosts } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"
import { Search as SearchIcon, MessageSquare, FileText, BookOpen } from "lucide-react"

interface SearchItem {
  type: "nostr" | "article" | "garden"
  title: string
  url: string
  content?: string
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [items, setItems] = useState<SearchItem[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const settings = getNostrSettings()
        const posts = await fetchNostrPosts(settings.ownerNpub, settings.maxPosts)
        const notesRes = await fetch("/api/digital-garden")
        const notes = await notesRes.json()
        const allItems: SearchItem[] = [
          ...posts.map((post) => ({
            type: post.type === "article" ? "article" : "nostr",
            title: post.title || post.content.slice(0, 50),
            url: `/blog/${post.id}`,
            content: post.content,
          })),
          ...notes.map((n: any) => ({
            type: "garden",
            title: n.title,
            url: `/digital-garden/${n.slug}`,
          })),
        ]
        setItems(allItems)
      } catch (err) {
        console.error("Failed to load search data", err)
      }
    }
    load()
  }, [])

  const results = useMemo(() => {
    if (!query) return []
    const term = query.toLowerCase()
    return items.filter((item) => {
      if (filter !== "all" && item.type !== filter) return false
      return (
        item.title.toLowerCase().includes(term) ||
        (item.content && item.content.toLowerCase().includes(term))
      )
    })
  }, [query, filter, items])

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 w-64"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="nostr">Nostr</SelectItem>
            <SelectItem value="article">Articles</SelectItem>
            <SelectItem value="garden">Garden</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {query && (
        <div className="absolute z-50 mt-2 w-full rounded-md border bg-background shadow">
          {results.length === 0 && (
            <div className="px-4 py-2 text-sm text-muted-foreground">No results found.</div>
          )}
          {results.map((item) => (
            <Link
              key={item.url}
              href={item.url}
              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
            >
              {item.type === "nostr" && <MessageSquare className="h-4 w-4" />}
              {item.type === "article" && <FileText className="h-4 w-4" />}
              {item.type === "garden" && <BookOpen className="h-4 w-4" />}
              <span className="truncate">{item.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar
