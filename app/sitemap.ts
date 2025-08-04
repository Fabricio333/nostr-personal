import type { MetadataRoute } from "next"
import { getNostrSettings } from "@/lib/nostr-settings"
import { fetchNostrPosts } from "@/lib/nostr"
import { getAllNotes } from "@/lib/digital-garden"
import fs from "fs/promises"
import path from "path"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fabri.lat"
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      alternates: { languages: { es: `${siteUrl}/es` } },
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      alternates: { languages: { es: `${siteUrl}/es/blog` } },
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: new Date(),
      alternates: { languages: { es: `${siteUrl}/es/projects` } },
    },
    {
      url: `${siteUrl}/resume`,
      lastModified: new Date(),
      alternates: { languages: { es: `${siteUrl}/es/resume` } },
    },
    {
      url: `${siteUrl}/digital-garden`,
      lastModified: new Date(),
      alternates: { languages: { es: `${siteUrl}/es/digital-garden` } },
    },
  ]

  routes.push(
    { url: `${siteUrl}/es`, lastModified: new Date(), alternates: { languages: { en: siteUrl } } },
    {
      url: `${siteUrl}/es/blog`,
      lastModified: new Date(),
      alternates: { languages: { en: `${siteUrl}/blog` } },
    },
    {
      url: `${siteUrl}/es/projects`,
      lastModified: new Date(),
      alternates: { languages: { en: `${siteUrl}/projects` } },
    },
    {
      url: `${siteUrl}/es/resume`,
      lastModified: new Date(),
      alternates: { languages: { en: `${siteUrl}/resume` } },
    },
    {
      url: `${siteUrl}/es/digital-garden`,
      lastModified: new Date(),
      alternates: { languages: { en: `${siteUrl}/digital-garden` } },
    },
  )

  try {
    const settings = getNostrSettings()
    if (settings.ownerNpub) {
      const [postsEn, postsEs] = await Promise.all([
        fetchNostrPosts(settings.ownerNpub, undefined, "en"),
        fetchNostrPosts(settings.ownerNpub, undefined, "es"),
      ])
      const esMap = new Map(postsEs.map((p) => [p.id, p]))
      postsEn.forEach((post) => {
        const lastModified = new Date((post.published_at || post.created_at) * 1000)
        routes.push({
          url: `${siteUrl}/blog/${post.id}`,
          lastModified,
          ...(esMap.has(post.id)
            ? { alternates: { languages: { es: `${siteUrl}/es/blog/${post.id}` } } }
            : {}),
        })
      })
      postsEs.forEach((post) => {
        routes.push({
          url: `${siteUrl}/es/blog/${post.id}`,
          lastModified: new Date((post.published_at || post.created_at) * 1000),
          alternates: { languages: { en: `${siteUrl}/blog/${post.id}` } },
        })
      })
    }
  } catch {
    // Ignore errors fetching posts
  }

  try {
    const [notesEn, notesEs] = await Promise.all([
      getAllNotes("en"),
      getAllNotes("es"),
    ])
    const esSet = new Set(notesEs.map((n) => n.slug))
    notesEn.forEach((note) => {
      routes.push({
        url: `${siteUrl}/digital-garden/${note.slug}`,
        lastModified: note.date ? new Date(note.date) : new Date(),
        ...(esSet.has(note.slug)
          ? {
              alternates: {
                languages: { es: `${siteUrl}/es/digital-garden/${note.slug}` },
              },
            }
          : {}),
      })
    })
    notesEs.forEach((note) => {
      routes.push({
        url: `${siteUrl}/es/digital-garden/${note.slug}`,
        lastModified: note.date ? new Date(note.date) : new Date(),
        alternates: { languages: { en: `${siteUrl}/digital-garden/${note.slug}` } },
      })
    })
  } catch {
    // Ignore digital garden errors
  }

  try {
    const [enFiles, esFiles] = await Promise.all([
      fs.readdir(path.join(process.cwd(), "public", "en", "projects")),
      fs.readdir(path.join(process.cwd(), "public", "es", "projects")),
    ])
    const esSet = new Set(
      esFiles.filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, "")),
    )
    enFiles
      .filter((f) => f.endsWith(".md"))
      .forEach((file) => {
        const slug = file.replace(/\.md$/, "")
        routes.push({
          url: `${siteUrl}/projects/${slug}`,
          lastModified: new Date(),
          ...(esSet.has(slug)
            ? { alternates: { languages: { es: `${siteUrl}/es/projects/${slug}` } } }
            : {}),
        })
      })
    esSet.forEach((slug) => {
      routes.push({
        url: `${siteUrl}/es/projects/${slug}`,
        lastModified: new Date(),
        alternates: { languages: { en: `${siteUrl}/projects/${slug}` } },
      })
    })
  } catch {
    // Ignore project errors
  }

  return routes
}
