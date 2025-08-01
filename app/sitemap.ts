import type { MetadataRoute } from "next"
import { getNostrSettings } from "@/lib/nostr-settings"
import { fetchNostrPosts } from "@/lib/nostr"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  const routes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: new Date() },
    { url: `${siteUrl}/blog`, lastModified: new Date() },
    { url: `${siteUrl}/projects`, lastModified: new Date() },
    { url: `${siteUrl}/resume`, lastModified: new Date() },
  ]

  try {
    const settings = getNostrSettings()
    if (settings.ownerNpub) {
      const posts = await fetchNostrPosts(settings.ownerNpub, settings.maxPosts || 50)
      posts.forEach((post) => {
        routes.push({
          url: `${siteUrl}/blog/${post.id}`,
          lastModified: new Date((post.published_at || post.created_at) * 1000),
        })
      })
    }
  } catch {
    // Ignore errors fetching posts
  }

  return routes
}
