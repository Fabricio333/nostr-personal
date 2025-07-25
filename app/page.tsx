"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Eye, ExternalLink, Calendar, BookOpen, User, FileText } from "lucide-react"
import { fetchNostrPosts, fetchNostrProfile, type NostrPost, type NostrProfile } from "@/lib/nostr"
import { getSettings } from "@/lib/settings"

export default function HomePage() {
  const [posts, setPosts] = useState<NostrPost[]>([])
  const [profile, setProfile] = useState<NostrProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)

        const settings = getSettings()

        // Only proceed if we have a valid npub configured
        if (!settings.npub || !settings.npub.startsWith("npub1")) {
          setError("No valid Nostr public key configured. Please check your settings.")
          return
        }

        // Load profile and posts in parallel
        const [profileData, postsData] = await Promise.all([
          fetchNostrProfile(settings.npub).catch((err) => {
            console.warn("Failed to fetch profile:", err)
            return null
          }),
          fetchNostrPosts(settings.npub).catch((err) => {
            console.warn("Failed to fetch posts:", err)
            return []
          }),
        ])

        setProfile(profileData)
        setPosts(postsData.slice(0, 6)) // Show only latest 6 posts on homepage
      } catch (err) {
        console.error("Failed to load data:", err)
        setError("Failed to load content. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDisplayName = (profile: NostrProfile | null) => {
    if (!profile) return "Welcome to My Blog"
    return profile.name || profile.nip05?.split("@")[0] || "My Blog"
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-8 flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-muted"></div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-muted rounded"></div>
              <div className="h-4 w-64 bg-muted rounded"></div>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
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
      {/* Profile Header */}
      <div className="mb-12 text-center">
        <Avatar className="mx-auto mb-4 h-24 w-24">
          <AvatarImage src={profile?.picture || "/placeholder.svg"} alt={getDisplayName(profile)} />
          <AvatarFallback className="text-2xl">{getDisplayName(profile).charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <h1 className="mb-2 text-4xl font-bold">{getDisplayName(profile)}</h1>
        {profile?.about && <p className="mx-auto max-w-2xl text-lg text-muted-foreground">{profile.about}</p>}
        {profile?.website && (
          <Button variant="outline" size="sm" className="mt-4 bg-transparent" asChild>
            <a href={profile.website} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Website
            </a>
          </Button>
        )}
      </div>

      {/* Recent Posts */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Posts</h2>
          <Button variant="outline" asChild>
            <Link href="/blog">View All Posts</Link>
          </Button>
        </div>

        {posts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-muted-foreground text-4xl mb-4">📝</div>
                <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground text-sm">
                  Posts will appear here once they're published to Nostr relays.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.id} className="transition-shadow hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={post.kind === 30023 ? "default" : "secondary"}>
                      {post.kind === 30023 ? "Article" : "Note"}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      {formatDate(post.created_at)}
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{post.title || "Untitled"}</CardTitle>
                  {post.summary && <CardDescription className="line-clamp-2">{post.summary}</CardDescription>}
                </CardHeader>
                <CardContent>
                  {post.image && (
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt={post.title || "Post image"}
                      className="w-full h-32 object-cover rounded-md mb-3"
                    />
                  )}
                  <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                    {post.summary || post.content.substring(0, 150) + "..."}
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
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/blog/${post.id}`}>Read More</Link>
                    </Button>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Portfolio
            </CardTitle>
            <CardDescription>Check out my latest projects and work</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/portfolio">View Portfolio</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-green-600" />
              Resume
            </CardTitle>
            <CardDescription>Learn about my experience and skills</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/resume">View Resume</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5 text-purple-600" />
              Blog
            </CardTitle>
            <CardDescription>Read all my thoughts and articles</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/blog">Read Blog</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
