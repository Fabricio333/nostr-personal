import type { Metadata } from "next"
import { nostrClient } from "@/lib/nostr"

export { generateStaticParams } from "../[id]/page"
export { default } from "../[id]/page"

export const dynamic = "force-static"

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  try {
    const post = await nostrClient.fetchPost(params.id, "es")
    if (!post) {
      return { title: "Post not found" }
    }
    const title = post.title || `${post.content.slice(0, 60)}…`
    const description = post.summary || post.content.slice(0, 160)
    const url = `${siteUrl}/blog/${post.translation ? `es/${post.id}` : post.id}`
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
