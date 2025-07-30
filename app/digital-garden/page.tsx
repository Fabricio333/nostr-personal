import Link from 'next/link'
import { getAllNotes } from '@/lib/digital-garden'

export default async function DigitalGardenPage() {
  const notes = await getAllNotes()
  return (
    <div className="w-full px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Digital Garden</h1>
      <ul className="list-disc pl-5 space-y-2">
        {notes.map((note) => (
          <li key={note.slug}>
            <Link href={`/digital-garden/${note.slug}`} className="text-blue-600 hover:underline">
              {note.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
