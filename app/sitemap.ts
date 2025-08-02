import type { MetadataRoute } from "next"
import fs from "fs"
import path from "path"
import { getNostrSettings } from "@/lib/nostr-settings"
import { fetchNostrPosts } from "@/lib/nostr"

export const revalidate = 60 * 60 * 24 // regenerate daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"
  const now = new Date()

  const routes: MetadataRoute.Sitemap = [
    { url: siteUrl, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/projects`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${siteUrl}/lifestyle`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/digital-garden`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteUrl}/digital-garden/graph`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${siteUrl}/search`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/resume`, lastModified: now, changeFrequency: "yearly", priority: 0.8 },
  ]

  // Project detail pages
  const projectSlugs = ["passwordmanagerweb", "webworkouttimer", "wearebitcoin"]
  projectSlugs.forEach((slug) => {
    routes.push({
      url: `${siteUrl}/projects/${slug}`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.6,
    })
  })

  // Digital garden notes
  const gardenDir = path.join(process.cwd(), "digital-garden")
  if (fs.existsSync(gardenDir)) {
    const files = fs.readdirSync(gardenDir)
    files.forEach((file) => {
      if (file.endsWith(".md")) {
        const slug = file.replace(/\.md$/, "")
        const stats = fs.statSync(path.join(gardenDir, file))
        routes.push({
          url: `${siteUrl}/digital-garden/${slug}`,
          lastModified: stats.mtime,
          changeFrequency: "monthly",
          priority: 0.6,
        })
      }
    })
  }

  try {
    const settings = getNostrSettings()
    if (settings.ownerNpub) {
      const posts = await fetchNostrPosts(settings.ownerNpub, settings.maxPosts || 50)
      posts.forEach((post) => {
        routes.push({
          url: `${siteUrl}/blog/${post.id}`,
          lastModified: new Date((post.published_at || post.created_at) * 1000),
          changeFrequency: "never",
          priority: 0.5,
        })
      })
    }
  } catch {
    // Ignore errors fetching posts
  }

  return routes
}
