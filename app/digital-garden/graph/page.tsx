import dynamic from 'next/dynamic'
import Link from 'next/link'
import { getAllNotes } from '@/lib/digital-garden'
import { slugify } from '@/lib/slugify'

const WikiGraph = dynamic(() => import('@/components/wiki-graph'), { ssr: false })

export default async function DigitalGardenGraphPage() {
  const notes = await getAllNotes()
  const nodes = notes.map((n) => ({ id: n.slug, title: n.title }))
  const links: { source: string; target: string }[] = []
  const linkRegex = /\[\[([^\]]+)\]\]/g
  for (const note of notes) {
    let match: RegExpExecArray | null
    while ((match = linkRegex.exec(note.content)) !== null) {
      const target = slugify(match[1])
      if (nodes.find((n) => n.id === target)) {
        links.push({ source: note.slug, target })
      }
    }
  }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-center text-3xl font-bold">Garden Graph</h1>
      <WikiGraph data={{ nodes, links }} />
      <div className="mt-4 text-center">
        <Link href="/digital-garden" className="text-blue-600 hover:underline">
          ← Back to Garden
        </Link>
      </div>
    </div>
  )
}
