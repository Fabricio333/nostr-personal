"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MessageCircle, Eye } from "lucide-react"
import Link from "next/link"
import { type NostrPost, fetchNostrPosts } from "@/lib/nostr"
import { getSettings } from "@/lib/settings"

export default function HomePage() {
  const [posts, setPosts] = useState<NostrPost[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    const loadContent = async () => {
      const userSettings = getSettings()
      setSettings(userSettings)

      if (userSettings.npub) {
        try {
          console.log("Loading posts for npub:", userSettings.npub)
          const nostrPosts = await fetchNostrPosts(userSettings.npub)
          console.log("Loaded posts:", nostrPosts.length)

          const filteredPosts = nostrPosts
            .filter((post) => userSettings.selectedPosts.includes(post.id) || userSettings.selectedPosts.length === 0)
            .slice(0, userSettings.postsPerPage || 10)

          setPosts(filteredPosts)
        } catch (error) {
          console.error("Error loading posts:", error)
          // Don't show alert on home page, just log the error
        }
      }
      setLoading(false)
    }

    loadContent()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to My Blog</h1>
        <p className="text-xl text-muted-foreground">Thoughts, ideas, and insights from my journey in tech and life.</p>
      </div>

      <div className="grid gap-6">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No posts available. Configure your Nostr npub in settings to start fetching content.
              </p>
              <Link href="/settings">
                <Button className="mt-4">Go to Settings</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">
                      <Link href={`/blog/${post.id}`} className="hover:underline">
                        {post.title || "Untitled Post"}
                      </Link>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.created_at * 1000).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.views || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments || 0} comments
                      </span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3">{post.content.substring(0, 200)}...</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {post.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <Link href={`/blog/${post.id}`}>
                    <Button variant="outline" size="sm">
                      Read More
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
