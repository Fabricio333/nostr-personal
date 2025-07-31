"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { fetchNostrPosts } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"

interface NostrPost {
  id: string
  content: string
  title?: string
  summary?: string
  type: "note" | "article"
}

interface GardenNote {
  slug: string
  title: string
}

export default function SiteSearch() {
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "nostr" | "articles" | "garden">("all")
  const [posts, setPosts] = useState<NostrPost[]>([])
  const [notes, setNotes] = useState<GardenNote[]>([])
  const [results, setResults] = useState<(
    | { type: "note" | "article"; id: string; title: string }
    | { type: "garden"; slug: string; title: string }
  )[]>([])

  useEffect(() => {
    const settings = getNostrSettings()
    if (settings.ownerNpub) {
      fetchNostrPosts(settings.ownerNpub, settings.maxPosts).then(setPosts)
    }
    fetch("/api/digital-garden")
      .then((res) => res.json())
      .then(setNotes)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!query) {
      setResults([])
      return
    }
    const term = query.toLowerCase()
    const newResults: (
      | { type: "note" | "article"; id: string; title: string }
      | { type: "garden"; slug: string; title: string }
    )[] = []

    if (filter === "all" || filter === "nostr" || filter === "articles") {
      posts.forEach((post) => {
        if (filter === "nostr" && post.type !== "note") return
        if (filter === "articles" && post.type !== "article") return
        if (
          post.content.toLowerCase().includes(term) ||
          post.title?.toLowerCase().includes(term) ||
          post.summary?.toLowerCase().includes(term)
        ) {
          newResults.push({
            type: post.type,
            id: post.id,
            title: post.title || post.content.slice(0, 50),
          })
        }
      })
    }

    if (filter === "all" || filter === "garden") {
      notes.forEach((note) => {
        if (
          note.title.toLowerCase().includes(term) ||
          note.slug.toLowerCase().includes(term)
        ) {
          newResults.push({ type: "garden", slug: note.slug, title: note.title })
        }
      })
    }

    setResults(newResults.slice(0, 10))
  }, [query, filter, posts, notes])

  return (
    <div className="relative w-48 md:w-64">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="pl-8 h-8"
          />
        </div>
        <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
          <SelectTrigger className="h-8 w-24">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="nostr">Nostr</SelectItem>
            <SelectItem value="articles">Articles</SelectItem>
            <SelectItem value="garden">Garden</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full rounded-md border bg-background shadow-md max-h-64 overflow-auto">
          {results.map((r) => (
            <Link
              key={r.type === "garden" ? r.slug : r.id}
              href={
                r.type === "garden" ? `/digital-garden/${r.slug}` : `/blog/${r.id}`
              }
              className="block px-3 py-2 text-sm hover:bg-accent"
            >
              <span className="font-medium">{r.title}</span>
              <span className="ml-2 text-xs text-muted-foreground">
                {r.type === "note" && "Nostr"}
                {r.type === "article" && "Article"}
                {r.type === "garden" && "Garden"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

