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

export interface GardenGraph {
  nodes: { id: string; title: string }[]
  links: { source: string; target: string }[]
}

const notesDir = path.join(process.cwd(), 'digital-garden')
const wikilinkRegex = /\[\[([^\]]+)\]\]/g

export async function getAllNotes(): Promise<DigitalGardenNote[]> {
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

function slugify(text: string) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
}

export function buildGraph(notes: DigitalGardenNote[]): GardenGraph {
  const nodes = notes.map((n) => ({ id: n.slug, title: n.title }))
  const slugs = new Set(notes.map((n) => n.slug))
  const links: { source: string; target: string }[] = []
  const seen = new Set<string>()
  for (const note of notes) {
    const matches = note.content.matchAll(wikilinkRegex)
    for (const match of matches) {
      const target = slugify(match[1])
      if (slugs.has(target)) {
        const key = `${note.slug}->${target}`
        if (!seen.has(key)) {
          seen.add(key)
          links.push({ source: note.slug, target })
        }
      }
    }
  }
  return { nodes, links }
}
