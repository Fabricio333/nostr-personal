import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { nostrClient, type NostrPost } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"
import { marked } from "marked" // For Markdown rendering
import { nip19 } from "nostr-tools"

export async function generateStaticParams() {
  const settings = getNostrSettings()
  if (!settings.ownerNpub) return []
  try {
    const posts = await nostrClient.fetchPosts(settings.ownerNpub, settings.maxPosts || 50)
    return posts.map((post) => ({ id: post.id }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { locale?: string }
}): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  try {
    const cookieStore = cookies()
    const locale =
      (searchParams.locale as "en" | "es") ||
      (cookieStore.get("NEXT_LOCALE")?.value as "en" | "es") ||
      "en"
    const post = await nostrClient.fetchPost(params.id, locale)
    if (!post) {
      return { title: "Post not found" }
    }
    const title = post.title || `${post.content.slice(0, 60)}…`
    const description = post.summary || post.content.slice(0, 160)
    const url = `${siteUrl}/blog/${post.id}`
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: {
        title,
        description,
        url,
        type: "article",
      },
    }
  } catch {
    return { title: "Blog Post" }
  }
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { locale?: string }
}) {
  const { id } = params
  const settings = getNostrSettings()
  const cookieStore = cookies()
  const cookieLocale =
    (cookieStore.get("NEXT_LOCALE")?.value as "en" | "es") || "en"
  const localeParam = searchParams.locale as "en" | "es" | undefined
  const locale = localeParam || cookieLocale

  if (cookieLocale === "es" && !localeParam) {
    redirect(`/blog/${id}?locale=es`)
  }

  if (!settings.ownerNpub || !settings.ownerNpub.startsWith("npub1")) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-destructive mb-2">Configuration Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No valid Nostr public key configured. Please update settings.json to set it up.
            </p>
            
          </CardContent>
        </Card>
      </div>
    )
  }

  let post: NostrPost | null = null
  try {
    post = await nostrClient.fetchPost(id, locale)
  } catch (error) {
    console.error("Error fetching blog post:", error)
  }

  if (!post) {
    notFound()
  }

  // Render markdown content
  const renderedContent = marked.parse(post.content || "")

  const formatDate = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleDateString(
      locale === "es" ? "es-ES" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    )

  const authorName =
    post.profile?.display_name || post.profile?.name || "Anonymous"
  const profilePic = post.profile?.picture || "/placeholder-user.jpg"
  const displayDate = formatDate(post.published_at || post.created_at)

  // Extract 't' tags
  const tags = post.tags
    .filter((t) => t[0] === "t" && t[1])
    .map((t) => t[1]!)

  const nevent = nip19.neventEncode({ id: post.id })
  const njumpUrl = `https://njump.me/${nevent}`

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-4">
            <Link
              href="/blog"
              className="text-blue-600 hover:underline"
            >
              ← Back to Blog
            </Link>
          </div>
          <Card className="mx-auto max-w-3xl border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profilePic} alt={authorName} />
                <AvatarFallback>
                  {authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{authorName}</p>
                <p className="text-xs text-muted-foreground">{displayDate}</p>
              </div>
            </div>

            <article
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />

            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-purple-500 text-purple-500">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-8">
              <Button asChild>
                <a href={njumpUrl} target="_blank" rel="noopener noreferrer">
                  Watch on your favorite Nostr clients
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
