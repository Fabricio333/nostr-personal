import type { MetadataRoute } from "next"
import { getNostrSettings } from "@/lib/nostr-settings"
import { fetchNostrPosts } from "@/lib/nostr"
import { getAllNotes } from "@/lib/digital-garden"
import fs from "fs/promises"
import path from "path"
import { getCanonicalUrl } from "@/utils/getCanonicalUrl"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getCanonicalUrl()
  const now = new Date()
  const staticPaths = ["", "/blog", "/projects", "/resume", "/digital-garden"]
  const routes: MetadataRoute.Sitemap = []

  staticPaths.forEach((p) => {
    const enUrl = `${siteUrl}${p}`
    const esUrl = `${siteUrl}/es${p}`
    routes.push({
      url: enUrl,
      lastModified: now,
      alternates: { languages: { es: esUrl } },
    })
    routes.push({
      url: esUrl,
      lastModified: now,
      alternates: { languages: { en: enUrl } },
    })
  })

  try {
    const settings = getNostrSettings()
    if (settings.ownerNpub) {
      const [postsEn, postsEs] = await Promise.all([
        fetchNostrPosts(
          settings.ownerNpub,
          undefined,
          "en",
          {
            noteIds: settings.noteEventIds,
            articleIds: settings.articleEventIds,
          },
        ),
        fetchNostrPosts(
          settings.ownerNpub,
          undefined,
          "es",
          {
            noteIds: settings.noteEventIds,
            articleIds: settings.articleEventIds,
          },
        ),
      ])
      const blacklist = new Set(settings.blacklistEventIds || [])
      const filteredEn = postsEn.filter((p) => !blacklist.has(p.id))
      const filteredEs = postsEs.filter((p) => !blacklist.has(p.id))
      const esMap = new Map(filteredEs.map((p) => [p.id, p]))
      filteredEn.forEach((post) => {
        const lastModified = new Date((post.published_at || post.created_at) * 1000)
        routes.push({
          url: `${siteUrl}/blog/${post.id}`,
          lastModified,
          ...(esMap.has(post.id)
            ? { alternates: { languages: { es: `${siteUrl}/es/blog/${post.id}` } } }
            : {}),
        })
      })
      filteredEs.forEach((post) => {
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
