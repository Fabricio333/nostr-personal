"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Eye, ExternalLink, BookOpen, User, FileText, Calendar } from "lucide-react"
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
    return profile.display_name || profile.name || "My Blog"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="mb-8 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-700"></div>
            </div>
            <div className="mb-8 text-center">
              <div className="mx-auto mb-4 h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="mx-auto h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
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
        {/* Profile Header */}
        <div className="mb-16 text-center">
          <div className="mb-6 flex justify-center">
            <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-700 shadow-xl">
              <AvatarImage
                src={profile?.picture || "/placeholder-user.jpg"}
                alt={getDisplayName(profile)}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {getDisplayName(profile).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {getDisplayName(profile)}
          </h1>
          {profile?.about && (
            <p className="mx-auto max-w-2xl text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              {profile.about}
            </p>
          )}
          <div className="mt-6 flex justify-center gap-4">
            {profile?.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={profile.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Website
                </a>
              </Button>
            )}
            <Button asChild>
              <Link href="/blog">
                <BookOpen className="mr-2 h-4 w-4" />
                Read My Blog
              </Link>
            </Button>
          </div>
        </div>

        {/* Recent Posts */}
        <div className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Recent Posts</h2>
            <Button variant="outline" asChild>
              <Link href="/blog">View All Posts</Link>
            </Button>
          </div>

          {posts.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="text-center">
                  <div className="text-slate-400 text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">No Posts Yet</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Posts will appear here once they're published to Nostr relays.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1"
                >
                  <CardHeader className="pb-3">
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
                      <div className="flex items-center text-xs text-slate-500 dark:text-slate-400">
                        <Calendar className="mr-1 h-3 w-3" />
                        {formatDate(post.published_at || post.created_at)}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {post.title || "Untitled"}
                    </CardTitle>
                    {post.summary && (
                      <CardDescription className="line-clamp-2 text-slate-600 dark:text-slate-400">
                        {post.summary}
                      </CardDescription>
                    )}
                  </CardHeader>

                  {post.image && (
                    <div className="px-6 pb-3">
                      <img
                        src={post.image || "/placeholder.svg"}
                        alt={post.title || "Post image"}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  <CardContent className="pt-0">
                    {!post.summary && (
                      <p className="mb-4 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                        {post.content.substring(0, 150)}...
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          {post.views}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="mr-1 h-3 w-3" />
                          {post.comments}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        asChild
                      >
                        <Link href={`/blog/${post.id}`}>Read More →</Link>
                      </Button>
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-1">
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
        <div className="grid gap-8 md:grid-cols-3">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <User className="mr-3 h-6 w-6 text-blue-600" />
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

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="mr-3 h-6 w-6 text-green-600" />
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

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BookOpen className="mr-3 h-6 w-6 text-purple-600" />
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
    </div>
  )
}
