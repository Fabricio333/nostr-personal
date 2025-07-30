import fs from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'

export interface DigitalGardenNote {
  slug: string
  title: string
}

const notesDir = path.join(process.cwd(), 'digital-garden')

export async function getAllNotes(): Promise<DigitalGardenNote[]> {
  const files = await fs.readdir(notesDir)
  const notes: DigitalGardenNote[] = []
  for (const file of files) {
    if (!file.endsWith('.md')) continue
    const slug = file.replace(/\.md$/, '')
    const content = await fs.readFile(path.join(notesDir, file), 'utf8')
    const { data } = matter(content)
    notes.push({ slug, title: (data as any).title || slug })
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
