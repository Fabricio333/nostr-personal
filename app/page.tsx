"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Calendar, FileText, MessageSquare, ExternalLink, Settings, RefreshCw } from "lucide-react"
import Link from "next/link"
import { fetchNostrPosts, fetchNostrProfile, type NostrPost, type NostrProfile } from "@/lib/nostr"
import { getSettings } from "@/lib/settings"

export default function HomePage() {
  const [posts, setPosts] = useState<NostrPost[]>([])
  const [profile, setProfile] = useState<NostrProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [npub, setNpub] = useState<string>("")

  useEffect(() => {
    const settings = getSettings()
    if (settings.npub) {
      setNpub(settings.npub)
      loadData(settings.npub)
    } else {
      setLoading(false)
      setError("No Nostr public key configured. Please go to Settings to configure your npub.")
    }
  }, [])

  const loadData = async (userNpub: string) => {
    try {
      setLoading(true)
      setError(null)

      const [profileData, postsData] = await Promise.all([fetchNostrProfile(userNpub), fetchNostrPosts(userNpub)])

      setProfile(profileData)
      setPosts(postsData)
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load data from Nostr relays. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    if (npub) {
      loadData(npub)
    }
  }

  const filteredPosts = posts.filter((post) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      post.content.toLowerCase().includes(searchLower) ||
      post.title?.toLowerCase().includes(searchLower) ||
      post.summary?.toLowerCase().includes(searchLower)
    )
  })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const truncateContent = (content: string, maxLength = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + "..."
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          {/* Profile Skeleton */}
          <Card className="mb-8 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="h-32 w-32 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Posts Skeleton */}
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
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
          <Alert className="mb-8 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
          </Alert>

          <div className="text-center space-y-4">
            <Button onClick={handleRefresh} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <div>
              <Link href="/settings">
                <Button variant="outline" className="ml-2 bg-transparent">
                  <Settings className="w-4 h-4 mr-2" />
                  Go to Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Section */}
        {profile && (
          <Card className="mb-8 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardHeader className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32 border-4 border-white dark:border-slate-700 shadow-lg">
                  <AvatarImage
                    src={profile.picture || "/placeholder.svg"}
                    alt={profile.name || profile.display_name || "Profile"}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {(profile.name || profile.display_name || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {profile.display_name || profile.name || "Anonymous"}
                  </h1>
                  {profile.name && profile.display_name && profile.name !== profile.display_name && (
                    <p className="text-slate-600 dark:text-slate-400">@{profile.name}</p>
                  )}
                  {profile.about && (
                    <p className="text-slate-700 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
                      {profile.about}
                    </p>
                  )}
                  {profile.website && (
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      {profile.website}
                    </a>
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700">
              {filteredPosts.length} posts
            </Badge>
          </div>
        </div>

        {/* Posts */}
        {filteredPosts.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No posts found</h3>
              <p className="text-slate-500 dark:text-slate-400">
                {searchTerm ? "Try adjusting your search terms." : "No posts available yet."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge
                      variant={post.kind === 30023 ? "default" : "secondary"}
                      className={
                        post.kind === 30023 ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : ""
                      }
                    >
                      {post.kind === 30023 ? (
                        <>
                          <FileText className="w-3 h-3 mr-1" />
                          Article
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Note
                        </>
                      )}
                    </Badge>
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(post.published_at || post.created_at)}
                    </div>
                  </div>

                  {post.title && (
                    <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
                      {post.title}
                    </CardTitle>
                  )}

                  {post.summary && (
                    <CardDescription className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {post.summary}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      {truncateContent(post.content)}
                    </p>
                  </div>

                  {post.content.length > 200 && (
                    <Link href={`/blog/${post.id}`}>
                      <Button
                        variant="ghost"
                        className="mt-4 p-0 h-auto text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Read more →
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
