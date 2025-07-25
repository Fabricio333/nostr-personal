"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Eye, Calendar, Search, Filter } from "lucide-react"
import { fetchNostrPosts, type NostrPost } from "@/lib/nostr"
import { getSettings } from "@/lib/settings"

export default function BlogPage() {
  const [posts, setPosts] = useState<NostrPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<NostrPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    async function loadPosts() {
      try {
        setLoading(true)
        setError(null)

        const settings = getSettings()

        if (!settings.npub || !settings.npub.startsWith("npub1")) {
          setError("No valid Nostr public key configured. Please check your settings.")
          return
        }

        const postsData = await fetchNostrPosts(settings.npub)
        setPosts(postsData)
        setFilteredPosts(postsData)
      } catch (err) {
        console.error("Failed to load posts:", err)
        setError("Failed to load posts. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadPosts()
  }, [])

  useEffect(() => {
    let filtered = posts

    // Filter by type
    if (filterType === "articles") {
      filtered = filtered.filter((post) => post.kind === 30023)
    } else if (filterType === "notes") {
      filtered = filtered.filter((post) => post.kind === 1)
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    setFilteredPosts(filtered)
  }, [posts, searchQuery, filterType])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-8">
            <div className="h-8 w-32 bg-muted rounded mb-4"></div>
            <div className="h-4 w-64 bg-muted rounded"></div>
          </div>
          <div className="grid gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-destructive mb-2">Configuration Required</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/settings">Configure Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Blog Posts</h1>
        <p className="text-muted-foreground">All my thoughts, articles, and notes from the Nostr network</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="articles">Articles Only</SelectItem>
            <SelectItem value="notes">Notes Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts */}
      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-muted-foreground text-4xl mb-4">
                {searchQuery || filterType !== "all" ? "🔍" : "📝"}
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || filterType !== "all" ? "No Posts Found" : "No Posts Yet"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {searchQuery || filterType !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Posts will appear here once they're published to Nostr relays."}
              </p>
              {(searchQuery || filterType !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("")
                    setFilterType("all")
                  }}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={post.kind === 30023 ? "default" : "secondary"}>
                    {post.kind === 30023 ? "Article" : "Note"}
                  </Badge>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {formatDate(post.published_at || post.created_at)}
                  </div>
                </div>
                <CardTitle className="text-xl">
                  <Link href={`/blog/${post.id}`} className="hover:underline">
                    {post.title || "Untitled"}
                  </Link>
                </CardTitle>
                {post.summary && <CardDescription>{post.summary}</CardDescription>}
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-4">
                  {post.image && (
                    <div className="lg:w-48 flex-shrink-0">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={post.title || "Post image"}
                        className="w-full h-32 lg:h-24 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.summary || post.content.substring(0, 200) + "..."}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Eye className="mr-1 h-4 w-4" />
                          {post.views}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="mr-1 h-4 w-4" />
                          {post.comments}
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/blog/${post.id}`}>Read More</Link>
                      </Button>
                    </div>
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Load More Button (placeholder for future pagination) */}
      {filteredPosts.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Showing {filteredPosts.length} of {posts.length} posts
          </p>
        </div>
      )}
    </div>
  )
}
