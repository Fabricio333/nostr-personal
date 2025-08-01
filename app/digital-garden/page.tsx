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
import { cn } from '@/lib/utils'

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
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">
        {siteName}&apos;s Garden
      </h1>
      <div className="mb-4 text-center">
        <Link href="/digital-garden/graph" className="text-blue-600 hover:underline">
          Graph View
        </Link>
      </div>
      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <Link href="/digital-garden">
            <Badge
              variant="outline"
              className={cn(
                'border-green-500 text-green-500',
                !activeTag && 'bg-green-500 text-white',
              )}
            >
              All
            </Badge>
          </Link>
          {allTags.map((tag) => (
            <Link
              key={tag}
              href={{ pathname: '/digital-garden', query: { tag } }}
            >
              <Badge
                variant="outline"
                className={cn(
                  'border-green-500 text-green-500',
                  activeTag === tag && 'bg-green-500 text-white',
                )}
              >
                {tag}
              </Badge>
            </Link>
          ))}
        </div>
      )}
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
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-green-100 text-green-700"
                      >
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
