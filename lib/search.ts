import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { fetchNostrPosts } from '@/lib/nostr'
import { getNostrSettings } from '@/lib/nostr-settings'

export type SearchSource = 'nostr' | 'article' | 'garden'

export interface SearchResult {
  type: SearchSource
  title: string
  url: string
  snippet: string
}

export async function searchContent(
  query: string,
  source?: SearchSource,
  locale: 'en' | 'es' = 'en',
): Promise<SearchResult[]> {
  const q = query.toLowerCase()
  const results: SearchResult[] = []

  const settings = getNostrSettings()

  const includeNostr = !source || source === 'nostr' || source === 'article'
  const includeGarden = !source || source === 'garden'

  if (includeNostr && settings.ownerNpub) {
    try {
      const posts = await fetchNostrPosts(settings.ownerNpub, settings.maxPosts, locale)
      for (const post of posts) {
        const postType: SearchSource = post.type === 'article' ? 'article' : 'nostr'
        if (source && source !== postType) continue
        const text = `${post.title ?? ''} ${post.summary ?? ''} ${post.content}`.toLowerCase()
        if (!q || text.includes(q)) {
          results.push({
            type: postType,
            title: post.title || (post.content.length > 60 ? post.content.slice(0, 60) + '…' : post.content),
            url: `/blog/${post.id}${locale === 'es' ? '?lang=es' : ''}`,
            snippet: post.summary || post.content.slice(0, 200),
          })
        }
      }
    } catch (error) {
      console.error('Failed to search Nostr posts', error)
    }
  }

  if (includeGarden) {
    const notesDir = path.join(process.cwd(), 'digital-garden')
    try {
      const files = await fs.readdir(notesDir)
      for (const file of files) {
        if (!file.endsWith('.md')) continue
        const slug = file.replace(/\.md$/, '')
        const raw = await fs.readFile(path.join(notesDir, file), 'utf8')
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
        }
      }
    } catch (error) {
      console.error('Failed to search digital garden notes', error)
    }
  }

  return results
}

