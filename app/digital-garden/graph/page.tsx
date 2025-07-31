import { getAllNotes } from '@/lib/digital-garden'
import GardenGraph from '@/components/garden-graph'

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default async function GardenGraphPage() {
  const notes = await getAllNotes()
  const nodes = notes.map((note) => ({ id: note.slug, name: note.title }))
  const noteSlugs = new Set(notes.map((n) => n.slug))
  const links: { source: string; target: string }[] = []
  for (const note of notes) {
    const matches = note.content.match(/\[\[([^\]]+)\]\]/g) || []
    for (const m of matches) {
      const linkText = m.slice(2, -2)
      const targetSlug = slugify(linkText)
      if (noteSlugs.has(targetSlug)) {
        links.push({ source: note.slug, target: targetSlug })
      }
    }
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-center text-3xl font-bold">Garden Graph</h1>
      <GardenGraph graph={{ nodes, links }} />
    </div>
  )
}
