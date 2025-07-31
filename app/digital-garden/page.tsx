import Link from 'next/link'
import { getAllNotes } from '@/lib/digital-garden'
import { getSiteName } from '@/lib/settings'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import GardenGraph from '@/components/garden-graph'

export default async function DigitalGardenPage({
  searchParams,
}: {
  searchParams: { tag?: string }
}) {
  const [notes, siteName] = await Promise.all([getAllNotes(), getSiteName()])
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags))).sort()
  const activeTag = searchParams.tag
  const filteredNotes = activeTag
    ? notes.filter((n) => n.tags.includes(activeTag))
    : notes

  function slugify(text: string) {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  const nodes = filteredNotes.map((n) => ({ id: n.slug, name: n.title }))
  const links: { source: string; target: string }[] = []
  for (const note of filteredNotes) {
    const matches = note.content.match(/\[\[([^\]]+)\]\]/g) || []
    for (const match of matches) {
      const targetSlug = slugify(match.slice(2, -2))
      if (filteredNotes.some((n) => n.slug === targetSlug)) {
        links.push({ source: note.slug, target: targetSlug })
      }
    }
  }

  const graphData = { nodes, links }
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">
        {siteName}&apos;s Garden
      </h1>
      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <Link href="/digital-garden">
            <Badge variant={activeTag ? 'outline' : 'default'}>All</Badge>
          </Link>
          {allTags.map((tag) => (
            <Link
              key={tag}
              href={{ pathname: '/digital-garden', query: { tag } }}
            >
              <Badge variant={activeTag === tag ? 'default' : 'outline'}>
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}
      <GardenGraph data={graphData} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map((note) => (
          <Link
            key={note.slug}
            href={`/digital-garden/${note.slug}`}
            className="block"
          >
            <Card className="h-full transition-colors hover:bg-muted">
              <CardHeader>
                <CardTitle>{note.title}</CardTitle>
              </CardHeader>
              {note.tags.length > 0 && (
                <CardContent className="pt-0">
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
