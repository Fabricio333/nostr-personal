import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export interface DigitalGardenNote {
  slug: string
  title: string
  content?: string
}

const notesDir = path.join(process.cwd(), 'digital-garden')

export async function getAllNotes(includeContent = false): Promise<DigitalGardenNote[]> {
  const files = await fs.readdir(notesDir)
  const notes: DigitalGardenNote[] = []
  for (const file of files) {
    if (!file.endsWith('.md')) continue
    const slug = file.replace(/\.md$/, '')
    const raw = await fs.readFile(path.join(notesDir, file), 'utf8')
    const { data, content } = matter(raw)
    notes.push({
      slug,
      title: (data as any).title || slug,
      ...(includeContent ? { content } : {}),
    })
  }
  return notes
}

export async function getNote(slug: string): Promise<{ title: string; content: string } | null> {
  const filePath = path.join(notesDir, `${slug}.md`)
  try {
    const content = await fs.readFile(filePath, 'utf8')
    const { data, content: body } = matter(content)
    return { title: (data as any).title || slug, content: body }
  } catch {
    return null
  }
}
