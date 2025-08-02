"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, FileText, MessageSquare, Calendar, RefreshCw } from "lucide-react"
import { fetchNostrPosts } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"
import Link from "next/link"
import { useI18n } from "@/components/locale-provider"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<"all" | "note" | "article">("all")
  const { locale, t } = useI18n()

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const settings = getNostrSettings()
      if (!settings.ownerNpub) {
        setError(t("home.no_npub"))
        return
      }

      const postsData = await fetchNostrPosts(settings.ownerNpub, 100, locale)
      setPosts(postsData)
      setFilteredPosts(postsData)
    } catch (err) {
      console.error("Error loading posts:", err)
      setError(t("home.failed_load"))
    } finally {
      setLoading(false)
    }
  }, [locale, t])

  useEffect(() => {
    loadPosts()
  }, [loadPosts])

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
    return new Date(timestamp * 1000).toLocaleDateString(
      locale === "es" ? "es-ES" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    )
  }

  const truncateContent = (content: string, maxLength = 300) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + "…"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              {t("blog.title")}
            </h1>
            <p className="text-slate-600 dark:text-slate-300">{t("blog.subtitle")}</p>
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
              {t("blog.title")}
            </h1>
          </div>

          <Alert className="max-w-2xl mx-auto">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <div className="flex gap-2">
                <Button onClick={loadPosts} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("home.retry")}
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
            {t("blog.title")}
          </h1>
          <p className="text-slate-600 dark:text-slate-300">{t("blog.subtitle")}</p>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder={t("blog.search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-0 bg-slate-100 dark:bg-slate-700"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedType("all")}
                  className={cn(
                    selectedType === "all" && "bg-slate-200 dark:bg-slate-700",
                  )}
                >
                  {t("blog.all")} ({posts.length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedType("note")}
                  className={cn(
                    "border-purple-500 text-purple-500",
                    selectedType === "note" && "bg-purple-500 text-white",
                  )}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {t("blog.notes")} ({posts.filter((p) => p.type === "note").length})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedType("article")}
                  className={cn(
                    "border-orange-500 text-orange-500",
                    selectedType === "article" && "bg-orange-500 text-white",
                  )}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {t("blog.articles")} ({posts.filter((p) => p.type === "article").length})
                </Button>
              </div>
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
                    {posts.length === 0 ? t("home.no_posts") : t("home.no_posts_match")}
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group block"
              >
                <Card
                  className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          post.type === "article"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-purple-100 text-purple-700",
                        )}
                      >
                        {post.type === "article" ? (
                          <>
                            <FileText className="h-3 w-3 mr-1" />
                          {t("blog.article")}
                        </>
                      ) : (
                        <>
                          <MessageSquare className="h-3 w-3 mr-1" />
                          {t("blog.note")}
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
                    <div className="prose prose-slate dark:prose-invert max-w-none w-full">
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed break-words overflow-hidden line-clamp-3">
                        {truncateContent(post.content)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
