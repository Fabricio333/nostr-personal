"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { fetchNostrPosts } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"

interface NostrPost {
  id: string
  content: string
  type: "note" | "article"
  title?: string
  summary?: string
}

interface GardenNote {
  slug: string
  title: string
  content?: string
}

interface ResultItem {
  type: string
  title: string
  url: string
  snippet: string
}

export default function SearchPage() {
  const params = useSearchParams()
  const query = (params.get("q") || "").toLowerCase()
  const filter = params.get("type") || "all"
  const [posts, setPosts] = useState<NostrPost[]>([])
  const [notes, setNotes] = useState<GardenNote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const settings = getNostrSettings()
      const postsPromise = settings.ownerNpub
        ? fetchNostrPosts(settings.ownerNpub, 100)
        : Promise.resolve([] as NostrPost[])
      const notesPromise = fetch("/api/digital-garden?content=1").then((res) =>
        res.json(),
      )
      const [p, n] = await Promise.all([postsPromise, notesPromise])
      setPosts(p)
      setNotes(n)
      setLoading(false)
    }
    load()
  }, [])

  const results = useMemo<ResultItem[]>(() => {
    if (!query) return []
    const items: ResultItem[] = []
    if (filter === "all" || filter === "nostr" || filter === "articles") {
      posts.forEach((post) => {
        if (
          (filter === "nostr" && post.type !== "note") ||
          (filter === "articles" && post.type !== "article")
        )
          return
        const haystack = (
          post.content +
          " " +
          (post.title || "") +
          " " +
          (post.summary || "")
        ).toLowerCase()
        if (haystack.includes(query)) {
          items.push({
            type: post.type === "note" ? "Nostr" : "Article",
            title: post.title || post.content.slice(0, 80),
            url: `/blog/${post.id}`,
            snippet: post.summary || post.content.slice(0, 120),
          })
        }
      })
    }
    if (filter === "all" || filter === "garden") {
      notes.forEach((note) => {
        const haystack = (
          note.title + " " + (note.content || "")
        ).toLowerCase()
        if (haystack.includes(query)) {
          items.push({
            type: "Garden",
            title: note.title,
            url: `/digital-garden/${note.slug}`,
            snippet: note.content?.slice(0, 120) || "",
          })
        }
      })
    }
    return items
  }, [query, filter, posts, notes])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Search Results</h1>
      {loading ? (
        <p>Loading...</p>
      ) : !query ? (
        <p>Enter a search term above.</p>
      ) : results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="space-y-4">
          {results.map((r, i) => (
            <div key={i} className="rounded-lg border p-4">
              <div className="text-sm text-muted-foreground mb-1">{r.type}</div>
              <Link href={r.url} className="text-lg font-semibold hover:underline">
                {r.title}
              </Link>
              <p className="text-sm text-muted-foreground mt-1">{r.snippet}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
