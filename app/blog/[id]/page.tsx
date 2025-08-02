import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { nostrClient, type NostrPost } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"
import BlogPostClient from "@/components/blog-post-client"
import { Card, CardContent } from "@/components/ui/card"

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

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  try {
    const post = await nostrClient.fetchPost(params.id)
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

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const { id } = params
  const settings = getNostrSettings()

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
    post = await nostrClient.fetchPost(id)
  } catch (error) {
    console.error("Error fetching blog post:", error)
  }

  if (!post) {
    notFound()
  }
  return <BlogPostClient initialPost={post} />
}
