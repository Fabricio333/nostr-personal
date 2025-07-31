"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, MessageSquare, Calendar, RefreshCw } from "lucide-react"
import { fetchNostrPosts } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"
import Link from "next/link"

interface NostrProfile {
  name?: string
  display_name?: string
  about?: string
  picture?: string
  banner?: string
  nip05?: string
  lud16?: string
  website?: string
}

interface NostrPost {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
  profile?: NostrProfile
  type: "note" | "article"
  title?: string
  summary?: string
  image?: string
  published_at?: number
}

export default function BlogPage() {
  const [posts, setPosts] = useState<NostrPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<NostrPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<"all" | "note" | "article">("all")

  const loadPosts = async () => {
    try {
      setLoading(true)
      setError(null)

      const settings = getNostrSettings()
      if (!settings.ownerNpub) {
        setError("No Nostr public key configured. Please update settings.json to add your npub.")
        return
      }

      const postsData = await fetchNostrPosts(settings.ownerNpub, 100)
      setPosts(postsData)
      setFilteredPosts(postsData)
    } catch (err) {
      console.error("Error loading posts:", err)
      setError("Failed to load posts. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPosts()
  }, [])

  useEffect(() => {
    let filtered = posts

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((post) => post.type === selectedType)
    }

    setFilteredPosts(filtered)
  }, [posts, selectedType])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const truncateContent = (content: string, maxLength = 300) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Blog Posts
            </h1>
            <p className="text-slate-600 dark:text-slate-300">All my thoughts, articles, and notes from Nostr</p>
          </div>

          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Blog Posts
            </h1>
          </div>

          <Alert className="max-w-2xl mx-auto">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <div className="flex gap-2">
                <Button onClick={loadPosts} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Blog Posts
          </h1>
          <p className="text-slate-600 dark:text-slate-300">All my thoughts, articles, and notes from Nostr</p>
        </div>

        {/* Filter */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex gap-2">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("all")}
              >
                All ({posts.length})
              </Button>
              <Button
                variant={selectedType === "note" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("note")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Notes ({posts.filter((p) => p.type === "note").length})
              </Button>
              <Button
                variant={selectedType === "article" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType("article")}
              >
                <FileText className="h-4 w-4 mr-2" />
                Articles ({posts.filter((p) => p.type === "article").length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Posts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full">
              <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <p className="text-slate-600 dark:text-slate-300">
                    {posts.length === 0 ? "No posts found." : "No posts match your search criteria."}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={post.type === "article" ? "default" : "secondary"}>
                      {post.type === "article" ? (
                        <>
                          <FileText className="h-3 w-3 mr-1" />
                          Article
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Note
                        </>
                      )}
                    </Badge>
                    <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(post.published_at || post.created_at)}
                    </div>
                  </div>
                  {post.title ? (
                    <CardTitle className="text-lg leading-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                      {post.title}
                    </CardTitle>
                  ) : (
                    <CardTitle className="text-lg leading-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                      {truncateContent(post.content, 60)}
                    </CardTitle>
                  )}
                  {post.summary && (
                    <CardDescription className="text-slate-600 dark:text-slate-300">{post.summary}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {truncateContent(post.content, 150)}
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                      <Link href={`/blog/${post.id}`}>Read More</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
