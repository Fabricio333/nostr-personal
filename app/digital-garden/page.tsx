import Link from 'next/link'
import { getAllNotes } from '@/lib/digital-garden'

export default async function DigitalGardenPage() {
  const notes = await getAllNotes()
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">Garden</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Link
            key={note.slug}
            href={`/digital-garden/${note.slug}`}
            className="rounded-lg border p-4 transition-colors hover:bg-muted"
          >
            <h2 className="text-xl font-semibold">{note.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">Read more →</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
