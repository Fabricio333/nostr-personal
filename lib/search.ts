import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { fetchNostrPosts } from '@/lib/nostr'
import { getNostrSettings } from '@/lib/nostr-settings'

export type SearchSource = 'all' | 'nostr' | 'article' | 'garden'

export interface SearchResult {
  type: Exclude<SearchSource, 'all'>
  title: string
  url: string
  snippet: string
}

export async function searchContent(query: string, source?: SearchSource): Promise<SearchResult[]> {
  const q = query.toLowerCase()
  const results: SearchResult[] = []

  const settings = getNostrSettings()

  const includeNostr =
    !source || source === 'all' || source === 'nostr' || source === 'article'
  const includeGarden = !source || source === 'all' || source === 'garden'

  if (includeNostr && settings.ownerNpub) {
    try {
      const posts = await fetchNostrPosts(settings.ownerNpub, settings.maxPosts)
      for (const post of posts) {
        const postType: Exclude<SearchSource, 'all'> =
          post.type === 'article' ? 'article' : 'nostr'
        if (source && source !== 'all' && source !== postType) continue
        const text = `${post.title ?? ''} ${post.summary ?? ''} ${post.content}`.toLowerCase()
        if (!q || text.includes(q)) {
          results.push({
            type: postType,
            title: post.title || (post.content.length > 60 ? post.content.slice(0, 60) + '…' : post.content),
            url: `/blog/${post.id}`,
            snippet: post.summary || post.content.slice(0, 200),
          })
        }
      }
    } catch (error) {
      console.error('Failed to search Nostr posts', error)
    }
  }

  if (includeGarden) {
    const baseDir = path.join(process.cwd(), 'digital-garden')
    try {
      const locales = await fs.readdir(baseDir)
      const seen = new Set<string>()
      for (const locale of locales) {
        const localePath = path.join(baseDir, locale)
        const stat = await fs.stat(localePath)
        if (!stat.isDirectory()) continue
        const files = await fs.readdir(localePath)
        for (const file of files) {
          if (!file.endsWith('.md')) continue
          const slug = file.replace(/\.md$/, '')
          if (seen.has(slug)) continue
          const raw = await fs.readFile(path.join(localePath, file), 'utf8')
          const { data, content } = matter(raw)
          const title = (data as any).title || slug
          const text = `${title} ${content}`.toLowerCase()
          if (!q || text.includes(q)) {
            results.push({
              type: 'garden',
              title,
              url: `/digital-garden/${slug}`,
              snippet: content.slice(0, 200),
            })
            seen.add(slug)
          }
        }
      }
    } catch (error) {
      console.error('Failed to search digital garden notes', error)
    }
  }

  return results
}

