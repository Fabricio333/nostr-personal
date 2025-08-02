import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export interface DigitalGardenNote {
  slug: string
  title: string
  tags: string[]
  date?: string
  content: string
}

// Notes are stored in the public folder under locale-specific directories:
//   public/en/digital-garden
//   public/es/digital-garden
// Using the public folder allows the same markdown files to be served
// statically while also being accessible via the filesystem for parsing.
const baseDir = path.join(process.cwd(), 'public')

export async function getAllNotes(locale: string = 'en'): Promise<DigitalGardenNote[]> {
  const notesDir = path.join(baseDir, locale, 'digital-garden')
  const files = await fs.readdir(notesDir)
  const notes: DigitalGardenNote[] = []
  for (const file of files) {
    if (!file.endsWith('.md')) continue
    const slug = file.replace(/\.md$/, '')
    const raw = await fs.readFile(path.join(notesDir, file), 'utf8')
    const { data, content } = matter(raw)
    const title = (data as any).title || slug
    const rawTags = (data as any).tags
    const tags = Array.isArray(rawTags)
      ? rawTags.map(String)
      : rawTags
      ? [String(rawTags)]
      : []
    const date = (data as any).date as string | undefined
    notes.push({ slug, title, tags, date, content })
  }
  return notes
}

export async function getNote(
  slug: string,
  locale: string = 'en'
): Promise<{ title: string; tags: string[]; content: string } | null> {
  const filePath = path.join(baseDir, locale, 'digital-garden', `${slug}.md`)
  try {
    const content = await fs.readFile(filePath, 'utf8')
    const { data, content: body } = matter(content)
    const title = (data as any).title || slug
    const rawTags = (data as any).tags
    const tags = Array.isArray(rawTags)
      ? rawTags.map(String)
      : rawTags
      ? [String(rawTags)]
      : []
    return { title, tags, content: body }
  } catch {
    return null
  }
}
