import { notFound } from 'next/navigation'
import Link from 'next/link'
import { marked } from 'marked'
import { getNote } from '@/lib/digital-garden'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold">{note.title}</h1>
          {note.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <article className="prose dark:prose-invert">
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        </CardContent>
      </Card>
      <div className="mt-8">
        <Link href="/digital-garden" className="text-blue-600 hover:underline">
          ← Back to Garden
        </Link>
      </div>
    </div>
  )
}
