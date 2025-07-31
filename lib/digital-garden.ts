import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export interface DigitalGardenNote {
  slug: string
  title: string
  tags: string[]
  content?: string
}

const notesDir = path.join(process.cwd(), 'digital-garden')

export async function getAllNotes(
  includeContent = false,
): Promise<DigitalGardenNote[]> {
  const files = await fs.readdir(notesDir)
  const notes: DigitalGardenNote[] = []
  for (const file of files) {
    if (!file.endsWith('.md')) continue
    const slug = file.replace(/\.md$/, '')
    const fileContent = await fs.readFile(path.join(notesDir, file), 'utf8')
    const { data, content } = matter(fileContent)
    const title = (data as any).title || slug
    const rawTags = (data as any).tags
    const tags = Array.isArray(rawTags)
      ? rawTags.map(String)
      : rawTags
      ? [String(rawTags)]
      : []
    const note: DigitalGardenNote = { slug, title, tags }
    if (includeContent) {
      note.content = content
    }
    notes.push(note)
  }
  return notes
}

export async function getNote(
  slug: string
): Promise<{ title: string; tags: string[]; content: string } | null> {
  const filePath = path.join(notesDir, `${slug}.md`)
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
