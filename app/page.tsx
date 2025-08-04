"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, extractImageUrl } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  MessageSquare,
  Calendar,
  ExternalLink,
  RefreshCw,
  Leaf,
  List,
} from "lucide-react"
import { fetchNostrProfile, fetchNostrPosts } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"
import Link from "next/link"
import Image from "next/image"
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

interface Post {
  id: string
  content: string
  title?: string
  summary?: string
  published_at?: number
  created_at: number
  type: "nostr" | "article" | "garden"
  translation?: any
  image?: string
}

export default function HomePage() {
  const [profile, setProfile] = useState<NostrProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<
    "all" | "nostr" | "article" | "garden"
  >("all")
  const { t, locale } = useI18n()

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const settings = getNostrSettings()
      if (!settings.ownerNpub) {
        setError(t("home.no_npub"))
        return
      }

      // Fetch profile, nostr posts, and garden notes
      const [profileData, nostrData, gardenData] = await Promise.all([
        fetchNostrProfile(settings.ownerNpub, locale),
        fetchNostrPosts(
          settings.ownerNpub,
          settings.maxPosts,
          locale,
          {
            noteIds: settings.noteEventIds,
            articleIds: settings.articleEventIds,
          },
        ),
        fetch("/api/digital-garden").then((res) => res.json()),
      ])

      const nostrPosts: Post[] = nostrData.map((p: NostrPost) => ({
        id: p.id,
        content: p.content,
        title: p.title,
        summary: p.summary,
        published_at: p.published_at,
        created_at: p.created_at,
        type: p.type === "note" ? "nostr" : "article",
        translation: p.translation,
        image: p.image,
      }))

      const gardenPosts: Post[] = gardenData.map((n: any) => {
        const ts = n.date ? Math.floor(new Date(n.date).getTime() / 1000) : 0
        return {
          id: n.slug,
          content: n.content,
          title: n.title,
          created_at: ts,
          published_at: ts,
          type: "garden",
        }
      })

      let combined = [...nostrPosts, ...gardenPosts]

      if (locale === "es") {
        combined = combined.filter(
          (post) => post.type === "garden" || post.translation,
        )
      }

      combined.sort((a, b) => {
        const aDate = a.published_at ?? a.created_at
        const bDate = b.published_at ?? b.created_at
        return bDate - aDate
      })

      setProfile(profileData)
      setPosts(combined)
      setFilteredPosts(combined)
    } catch (err) {
      console.error("Error loading data:", err)
      setError(t("home.failed_load"))
    } finally {
      setLoading(false)
    }
  }, [locale, t])

  useEffect(() => {
    loadData()
  }, [loadData])

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
    return new Date(timestamp * 1000).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const truncateContent = (content: string, maxLength = 300) => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + "…"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
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
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <div className="flex gap-2">
                <Button onClick={loadData} size="sm" variant="outline">
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
                  {profile.display_name || profile.name || t("home.anonymous")}
                  </h1>
                  {profile.about && (
                    <div className="text-slate-600 dark:text-slate-300 mb-4 leading-relaxed prose prose-slate dark:prose-invert max-w-none">
                      <p className="whitespace-pre-line">{profile.about}</p>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    {profile.website && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={profile.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t("home.website")}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Posts */}
        <h2 className="text-2xl font-bold mb-4">{t("home.latest_posts")}</h2>
        <div className="flex gap-2 mb-4">
          {["all", "nostr", "article", "garden"].map((type) => {
            const isActive = selectedType === type
            const color =
              type === "nostr"
                ? "purple"
                : type === "article"
                ? "orange"
                : type === "garden"
                ? "green"
                : "blue"
            return (
              <Button
                key={type}
                variant="outline"
                size="sm"
                onClick={() =>
                  setSelectedType(
                    selectedType === type
                      ? "all"
                      : (type as "all" | "nostr" | "article" | "garden"),
                  )
                }
                className={cn(
                  `border-${color}-500 text-${color}-500`,
                  isActive && `bg-${color}-500 text-white`,
                )}
              >
                {type === "nostr" ? (
                  <>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t("home.type_nostr")}
                  </>
                ) : type === "article" ? (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    {t("home.type_article")}
                  </>
                ) : type === "garden" ? (
                  <>
                    <Leaf className="h-4 w-4 mr-2" />
                    {t("home.type_garden")}
                  </>
                ) : (
                  <>
                    <List className="h-4 w-4 mr-2" />
                    {t("home.type_all")}
                  </>
                )}
              </Button>
            )
          })}
        </div>
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <p className="text-slate-600 dark:text-slate-300">
                  {posts.length === 0 ? t("home.no_posts") : t("home.no_posts_match")}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post) => {
              const imageUrl = post.image || extractImageUrl(post.content)
              return (
                <Link
                  key={post.id}
                  href={
                    post.type === "garden"
                      ? locale === "es"
                        ? `/es/digital-garden/${post.id}`
                        : `/digital-garden/${post.id}`
                      : locale === "es" && post.translation
                      ? `/es/blog/${post.id}`
                      : `/blog/${post.id}`
                  }
                  className="group block"
                >
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={post.title || "Post image"}
                        width={600}
                        height={300}
                        className="h-48 w-full object-cover rounded-t-lg"
                      />
                    )}
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={cn(
                            post.type === "article"
                              ? "bg-orange-100 text-orange-700"
                              : post.type === "garden"
                              ? "bg-green-100 text-green-700"
                              : "bg-purple-100 text-purple-700",
                          )}
                        >
                          {post.type === "article" ? (
                            <>
                              <FileText className="h-3 w-3 mr-1" />
                              {t("home.type_article")}
                            </>
                          ) : post.type === "garden" ? (
                            <>
                              <Leaf className="h-3 w-3 mr-1" />
                              {t("home.type_garden")}
                            </>
                          ) : (
                            <>
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {t("home.type_nostr")}
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
                      <div className="prose prose-slate dark:prose-invert max-w-none w-full">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed break-words overflow-hidden line-clamp-3">
                          {truncateContent(post.content)}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}
