import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { fetchNostrPosts } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"
import { getAllNotes, getNote } from "@/lib/digital-garden"

interface SearchParams {
  q?: string
  source?: string
}

interface Result {
  type: string
  title: string
  url: string
  snippet: string
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const query = searchParams.q?.toLowerCase() || ""
  const source = (searchParams.source || "all").toLowerCase()
  const results: Result[] = []

  if (query) {
    if (["all", "nostr", "articles"].includes(source)) {
      const settings = getNostrSettings()
      if (settings.ownerNpub) {
        const posts = await fetchNostrPosts(settings.ownerNpub, 100)
        for (const post of posts) {
          if (source === "nostr" && post.type !== "note") continue
          if (source === "articles" && post.type !== "article") continue
          const text = (
            post.content + " " + (post.title || "") + " " + (post.summary || "")
          ).toLowerCase()
          if (text.includes(query)) {
            results.push({
              type: post.type === "article" ? "Article" : "Nostr",
              title: post.title || post.content.slice(0, 50),
              url: `/blog/${post.id}`,
              snippet: post.summary || post.content.slice(0, 100),
            })
          }
        }
      }
    }

    if (source === "all" || source === "garden") {
      const notes = await getAllNotes()
      for (const note of notes) {
        const data = await getNote(note.slug)
        const text = (note.title + " " + (data?.content || "")).toLowerCase()
        if (text.includes(query)) {
          results.push({
            type: "Garden",
            title: note.title,
            url: `/digital-garden/${note.slug}`,
            snippet: (data?.content || "").slice(0, 100),
          })
        }
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Search Results</h1>
      {query ? (
        results.length > 0 ? (
          <div className="space-y-4">
            {results.map((res, idx) => (
              <Card key={idx}>
                <CardHeader className="flex items-center justify-between">
                  <CardTitle>{res.title}</CardTitle>
                  <Badge variant="secondary">{res.type}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm text-muted-foreground">{res.snippet}</p>
                  <Link href={res.url} className="text-sm text-blue-600 hover:underline">
                    View
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p>No results found for &quot;{query}&quot;.</p>
        )
      ) : (
        <p>Enter a search term in the bar above.</p>
      )}
    </div>
  )
}
