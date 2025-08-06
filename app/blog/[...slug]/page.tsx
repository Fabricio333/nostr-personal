import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { nostrClient, type NostrPost } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"
import { marked } from "marked" // For Markdown rendering
import { nip19 } from "nostr-tools"
import { isImageUrl } from "@/lib/utils"
import { getCanonicalUrl } from "@/utils/getCanonicalUrl"

export const revalidate = 60 * 60 * 24

export async function generateStaticParams() {
  const settings = getNostrSettings()
  if (!settings.ownerNpub) return []
  try {
    const [postsEn, postsEs] = await Promise.all([
      nostrClient.fetchPosts(
        settings.ownerNpub,
        settings.maxPosts || 50,
        "en",
        {
          noteIds: settings.noteEventIds,
          articleIds: settings.articleEventIds,
        },
      ),
      nostrClient.fetchPosts(
        settings.ownerNpub,
        settings.maxPosts || 50,
        "es",
        {
          noteIds: settings.noteEventIds,
          articleIds: settings.articleEventIds,
        },
      ),
    ])
    const ids = new Set([...postsEn, ...postsEs].map((p) => p.id))
    return Array.from(ids).map((id) => ({ slug: [id] }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug: string[] }
  searchParams: { [key: string]: string | string[] | undefined }
}): Promise<Metadata> {
  const siteUrl = getCanonicalUrl()
  try {
    const slug = params.slug
    const id = slug[0]
    const forcedLocale =
      typeof searchParams?.forceLocale === "string"
        ? (searchParams.forceLocale as "en" | "es")
        : undefined
    const cookieStore = cookies()
    const locale =
      forcedLocale || (cookieStore.get("NEXT_LOCALE")?.value as "en" | "es") || "en"
    const post = await nostrClient.fetchPost(id, locale)
    if (!post) {
      return { title: "Post not found" }
    }
    const title = post.title || `${post.content.slice(0, 60)}…`
    const description = post.summary || post.content.slice(0, 160)
    const url =
      locale === "es" && post.translation
        ? `${siteUrl}/es/blog/${post.id}`
        : `${siteUrl}/blog/${post.id}`
    const languageAlternates = post.translation
      ? {
          en: `${siteUrl}/blog/${post.id}`,
          es: `${siteUrl}/es/blog/${post.id}`,
        }
      : {
          en: `${siteUrl}/blog/${post.id}`,
        }
    const ogLocale = locale === "es" ? "es_ES" : "en_US"
    return {
      title,
      description,
      alternates: { canonical: url, languages: languageAlternates },
      openGraph: {
        title,
        description,
        url,
        type: "article",
        locale: ogLocale,
        ...(post.translation
          ? { alternateLocale: ogLocale === "es_ES" ? ["en_US"] : ["es_ES"] }
          : {}),
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
  params: { slug: string[] }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const slug = params.slug
  const id = slug[0]
  const settings = getNostrSettings()
  const forcedLocale =
    typeof searchParams?.forceLocale === "string"
      ? (searchParams.forceLocale as "en" | "es")
      : undefined
  const cookieStore = cookies()
  const locale =
    forcedLocale || (cookieStore.get("NEXT_LOCALE")?.value as "en" | "es") || "en"

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

  if (locale === "es" && !post.translation) {
    redirect(`/blog/${id}?forceLocale=en`)
  }

  // Render markdown content and convert image links to images
  const renderer = new marked.Renderer()
  const originalLink = renderer.link.bind(renderer)
  renderer.link = (href, title, text) => {
    if (href && isImageUrl(href)) {
      return `<img src="${href}" alt="${text || ""}" />`
    }
    return originalLink(href, title, text)
  }
  const renderedContent = marked.parse(post.content || "", { renderer })

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
              href={locale === "es" ? "/es/blog" : "/blog"}
              className="text-blue-600 hover:underline"
              prefetch={false}
            >
              ← Back to Blog
            </Link>
          </div>
          <Card className="mx-auto max-w-3xl border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm break-words">
            {post.image && (
              <Image
                src={post.image}
                alt={post.title || "Cover image"}
                width={1200}
                height={630}
                className="w-full h-auto rounded-t-lg object-cover"
              />
            )}
            <CardContent className="p-6 break-words">
            {post.title && (
              <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent break-words">
                {post.title}
              </h1>
            )}
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
              className="prose dark:prose-invert max-w-none break-words"
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
