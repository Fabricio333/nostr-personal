"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, FileText, MessageSquare, Calendar, ExternalLink, RefreshCw } from "lucide-react"
import { fetchNostrProfile, fetchNostrPosts } from "@/lib/nostr"
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

export default function HomePage() {
  const [profile, setProfile] = useState<NostrProfile | null>(null)
  const [posts, setPosts] = useState<NostrPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<NostrPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<"all" | "note" | "article">("all")
  const [notes, setNotes] = useState<{ slug: string; title: string }[]>([])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const settings = getNostrSettings()
      if (!settings.ownerNpub) {
        setError("No Nostr public key configured. Please update settings.json to add your npub.")
        return
      }

      // Fetch profile and posts
      const [profileData, postsData] = await Promise.all([
        fetchNostrProfile(settings.ownerNpub),
        fetchNostrPosts(settings.ownerNpub, settings.maxPosts),
      ])

      setProfile(profileData)
      setPosts(postsData)
      setFilteredPosts(postsData)
    } catch (err) {
      console.error("Error loading data:", err)
      setError("Failed to load data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    fetch('/api/digital-garden')
      .then((res) => res.json())
      .then((data) => setNotes(data))
      .catch((err) => console.error('Failed to load notes', err))
  }, [])

  useEffect(() => {
    let filtered = posts

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((post) => post.type === selectedType)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (post) =>
          post.content.toLowerCase().includes(term) ||
          post.title?.toLowerCase().includes(term) ||
          post.summary?.toLowerCase().includes(term),
      )
    }

    setFilteredPosts(filtered)
  }, [posts, searchTerm, selectedType])

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
        <div className="w-full px-4 py-8">
          {/* Profile skeleton */}
          <Card className="mb-8 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-8">
                <Skeleton className="h-48 w-48 rounded-full" />
                <div className="flex-1 space-y-4 text-center md:text-left">
                  <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
                  <Skeleton className="h-4 w-full max-w-md mx-auto md:mx-0" />
                  <Skeleton className="h-4 w-3/4 max-w-sm mx-auto md:mx-0" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Posts skeleton */}
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
        <div className="w-full px-4 py-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <div className="flex gap-2">
                <Button onClick={loadData} size="sm" variant="outline">
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
      <div className="w-full px-4 py-8">
        {/* Profile Section */}
        {profile && (
          <Card className="mb-8 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-8">
                <Avatar className="h-48 w-48 border-4 border-white dark:border-slate-700 shadow-lg">
                  <AvatarImage
                    src={profile.picture || "/placeholder.svg"}
                    alt={profile.name || profile.display_name || "Profile"}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {(profile.name || profile.display_name || "U")[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {profile.display_name || profile.name || "Anonymous"}
                  </h1>
                  {profile.about && (
                    <div className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed prose prose-slate dark:prose-invert max-w-none">
                      <p>{profile.about}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    {profile.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={profile.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Website
                        </a>
                      </Button>
                    )}
                    {profile.nip05 && (
                      <Badge variant="secondary" className="px-3 py-1">
                        ✓ {profile.nip05}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-slate-100 dark:bg-slate-700"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={selectedType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("all")}
                >
                  All
                </Button>
                <Button
                  variant={selectedType === "note" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("note")}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Notes
                </Button>
                <Button
                  variant={selectedType === "article" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType("article")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Articles
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Posts */}
        <h2 className="text-2xl font-bold mb-4">Latest Posts</h2>
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <p className="text-slate-600 dark:text-slate-300">
                  {posts.length === 0 ? "No posts found." : "No posts match your search criteria."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => (
              <Card
                key={post.id}
                className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
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
                    <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(post.published_at || post.created_at)}
                    </div>
                  </div>
                  {post.title && (
                    <CardTitle className="text-xl bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                      {post.title}
                    </CardTitle>
                  )}
                  {post.summary && (
                    <CardDescription className="text-slate-600 dark:text-slate-300 leading-relaxed">
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
                  <div className="mt-4 flex justify-between items-center">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/blog/${post.id}`}>Read More</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Digital Garden */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Digital Garden</h2>
          {notes.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-300">No notes found.</p>
          ) : (
            <ul className="list-disc pl-5 space-y-1">
              {notes.map((note) => (
                <li key={note.slug}>
                  <Link href={`/digital-garden/${note.slug}`} className="text-blue-600 hover:underline">
                    {note.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
