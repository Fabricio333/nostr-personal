"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageCircle, Eye, Calendar, Search, Filter, BookOpen } from "lucide-react"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 h-10 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="mx-auto h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="mb-8 flex gap-4">
              <div className="flex-1 h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="w-48 h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-12">
          <Card className="border-red-200 dark:border-red-800 max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Configuration Required</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error}</p>
              <Button asChild>
                <Link href="/settings">Configure Settings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Blog Posts
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            All my thoughts, articles, and notes from the Nostr network
          </p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
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
          </CardContent>
        </Card>

        {/* Posts */}
        {filteredPosts.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-8">
              <div className="text-center">
                <div className="text-slate-400 text-6xl mb-4">{searchQuery || filterType !== "all" ? "🔍" : "📝"}</div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {searchQuery || filterType !== "all" ? "No Posts Found" : "No Posts Yet"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
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
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={post.kind === 30023 ? "default" : "secondary"} className="text-xs">
                      {post.kind === 30023 ? (
                        <>
                          <BookOpen className="mr-1 h-3 w-3" />
                          Article
                        </>
                      ) : (
                        "Note"
                      )}
                    </Badge>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="mr-1 h-4 w-4" />
                      {formatDate(post.published_at || post.created_at)}
                    </div>
                  </div>
                  <CardTitle className="text-2xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    <Link href={`/blog/${post.id}`} className="hover:underline">
                      {post.title || "Untitled"}
                    </Link>
                  </CardTitle>
                  {post.summary && (
                    <CardDescription className="text-base text-slate-600 dark:text-slate-400">
                      {post.summary}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col lg:flex-row gap-6">
                    {post.image && (
                      <div className="lg:w-48 flex-shrink-0">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt={post.title || "Post image"}
                          className="w-full h-32 lg:h-24 object-cover rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-3">
                        {post.summary || post.content.substring(0, 200) + "..."}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
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
                        <div className="mt-4 flex flex-wrap gap-2">
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

        {/* Stats */}
        {filteredPosts.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-slate-500 dark:text-slate-400">
              Showing {filteredPosts.length} of {posts.length} posts
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
