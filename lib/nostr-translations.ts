import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export interface NostrTranslation {
  id: string
  lang: string
  publishing_date?: string
  type?: string
  kind?: number
  tags?: string[]
  title?: string
  summary?: string
  content: string
}

const translationsDir = path.join(process.cwd(), 'nostr-translations')

export async function getAllTranslations(): Promise<NostrTranslation[]> {
  try {
    const files = await fs.readdir(translationsDir)
    const translations: NostrTranslation[] = []
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      const id = file.replace(/\.md$/, '')
      const raw = await fs.readFile(path.join(translationsDir, file), 'utf8')
      const { data, content } = matter(raw)
      const tagsRaw = (data as any).tags
      const tags = Array.isArray(tagsRaw)
        ? tagsRaw.map(String)
        : tagsRaw
        ? [String(tagsRaw)]
        : []
      const translation: NostrTranslation = {
        id,
        lang: (data as any).lang || 'es',
        publishing_date: (data as any).publishing_date,
        type: (data as any).type,
        kind: (data as any).kind ? Number((data as any).kind) : undefined,
        tags,
        title: (data as any).title,
        summary: (data as any).summary,
        content,
      }
      translations.push(translation)
    }
    return translations
  } catch {
    return []
  }
}

export async function getTranslation(id: string): Promise<NostrTranslation | null> {
  const filePath = path.join(translationsDir, `${id}.md`)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    const { data, content } = matter(raw)
    const tagsRaw = (data as any).tags
    const tags = Array.isArray(tagsRaw)
      ? tagsRaw.map(String)
      : tagsRaw
      ? [String(tagsRaw)]
      : []
    return {
      id,
      lang: (data as any).lang || 'es',
      publishing_date: (data as any).publishing_date,
      type: (data as any).type,
      kind: (data as any).kind ? Number((data as any).kind) : undefined,
      tags,
      title: (data as any).title,
      summary: (data as any).summary,
      content,
    }
  } catch {
    return null
  }
}
