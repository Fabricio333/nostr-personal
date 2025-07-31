import Link from 'next/link'
import { getAllNotes } from '@/lib/digital-garden'
import GraphView from './graph-view'

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default async function DigitalGardenGraphPage() {
  const notes = await getAllNotes()
  const slugs = new Set(notes.map((n) => n.slug))
  const nodes = notes.map((n) => ({ id: n.slug, name: n.title }))
  const links: { source: string; target: string }[] = []
  for (const note of notes) {
    const regex = /\[\[([^\]]+)\]\]/g
    let match: RegExpExecArray | null
    while ((match = regex.exec(note.content)) !== null) {
      const target = slugify(match[1])
      if (slugs.has(target)) {
        links.push({ source: note.slug, target })
      }
    }
  }
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">Garden Graph</h1>
      <GraphView nodes={nodes} links={links} />
      <div className="mt-8">
        <Link href="/digital-garden" className="text-blue-600 hover:underline">
          ← Back to Garden
        </Link>
      </div>
    </div>
  )
}

