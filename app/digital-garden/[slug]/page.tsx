import { notFound } from 'next/navigation'
import Link from 'next/link'
import { marked } from 'marked'
import { getNote } from '@/lib/digital-garden'

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default async function DigitalGardenNotePage({ params }: { params: { slug: string } }) {
  const note = await getNote(params.slug)
  if (!note) {
    notFound()
  }
  let content = note.content.replace(/\[\[([^\]]+)\]\]/g, (_match, p1) => {
    const slug = slugify(p1)
    return `[${p1}](/digital-garden/${slug})`
  })
  const html = marked.parse(content)
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <article className="prose dark:prose-invert">
        <h1>{note.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      <div className="mt-8">
        <Link href="/digital-garden" className="text-blue-600 hover:underline">
          ← Back to Garden
        </Link>
      </div>
    </div>
  )
}
