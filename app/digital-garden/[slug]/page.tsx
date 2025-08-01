import { notFound } from 'next/navigation'
import Link from 'next/link'
import { marked } from 'marked'
import { getNote } from '@/lib/digital-garden'
import { Badge } from '@/components/ui/badge'
import { slugify } from '@/lib/slugify'

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
      <article className="prose dark:prose-invert [&_img]:h-auto [&_img]:w-16">
        <h1>{note.title}</h1>
        {note.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
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
