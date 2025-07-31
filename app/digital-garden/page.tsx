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

export default async function DigitalGardenPage() {
  const [notes, siteName] = await Promise.all([
    getAllNotes(),
    getSiteName(),
  ])
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">
        {siteName}&apos;s Garden
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Link key={note.slug} href={`/digital-garden/${note.slug}`} className="block">
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
