"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { fetchNostrPosts } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"
import { FileText, MessageSquare, BookOpen } from "lucide-react"

interface SearchResult {
  type: "note" | "article" | "garden"
  title: string
  content: string
  url: string
}

export default function SearchPage() {
  const params = useSearchParams()
  const query = params.get("q") || ""
  const filter = params.get("filter") || "all"
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!query) return
      setLoading(true)
      const term = query.toLowerCase()
      const items: SearchResult[] = []

      if (filter === "all" || filter === "nostr" || filter === "articles") {
        const settings = getNostrSettings()
        if (settings.ownerNpub) {
          const posts = await fetchNostrPosts(settings.ownerNpub, settings.maxPosts)
          posts.forEach((post) => {
            const matches =
              post.content.toLowerCase().includes(term) ||
              post.title?.toLowerCase().includes(term) ||
              post.summary?.toLowerCase().includes(term)
            if (!matches) return
            if (filter === "nostr" && post.type !== "note") return
            if (filter === "articles" && post.type !== "article") return
            items.push({
              type: post.type,
              title: post.title || post.content.slice(0, 60),
              content: post.content,
              url: `/blog/${post.id}`,
            })
          })
        }
      }

      if (filter === "all" || filter === "garden") {
        const notes = await fetch(`/api/digital-garden?content=1`).then((res) => res.json())
        notes.forEach((note: any) => {
          const matches =
            note.title.toLowerCase().includes(term) ||
            note.content.toLowerCase().includes(term)
          if (!matches) return
          items.push({
            type: "garden",
            title: note.title,
            content: note.content,
            url: `/digital-garden/${note.slug}`,
          })
        })
      }

      setResults(items)
      setLoading(false)
    }

    load()
  }, [query, filter])

  const truncate = (str: string, len = 200) =>
    str.length <= len ? str : str.slice(0, len) + "…"

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Search Results for &quot;{query}&quot;</h1>
      {loading ? (
        <p>Loading...</p>
      ) : results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="space-y-6">
          {results.map((res, idx) => (
            <Card key={idx} className="border-0 shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Badge variant={res.type === "article" ? "default" : res.type === "garden" ? "outline" : "secondary"}>
                    {res.type === "article"
                      ? "Article"
                      : res.type === "garden"
                      ? "Garden"
                      : "Note"}
                  </Badge>
                  {res.type === "article" && <FileText className="h-4 w-4" />}
                  {res.type === "note" && <MessageSquare className="h-4 w-4" />}
                  {res.type === "garden" && <BookOpen className="h-4 w-4" />}
                </div>
                <CardTitle>{res.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-slate-700 dark:text-slate-300">
                  {truncate(res.content)}
                </p>
                <Link href={res.url} className="text-blue-600 hover:underline">
                  Read More
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
