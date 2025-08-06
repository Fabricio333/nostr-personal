import Link from 'next/link'
import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
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
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const translations = { en, es } as const

export const revalidate = 60 * 60 * 24

function getT(locale: keyof typeof translations) {
  return (key: string) =>
    key.split('.').reduce((o: any, k) => (o ? o[k] : undefined), translations[locale]) || key
}

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName()
  const cookieStore = cookies()
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as 'en' | 'es'
  const t = getT(locale)
  const headersList = headers()
  const host =
    headersList.get('x-forwarded-host') || headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
  const url = locale === 'es' ? `${siteUrl}/es/digital-garden` : `${siteUrl}/digital-garden`
  const title = `${siteName}'s ${t('navbar.garden')}`
  return {
    title,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/digital-garden`,
        es: `${siteUrl}/es/digital-garden`,
      },
    },
    openGraph: {
      title,
      url,
      images: ['/digital-garden.png'],
    },
    twitter: {
      title,
      images: ['/digital-garden.png'],
    },
  }
}

export default async function DigitalGardenPage({
  searchParams,
}: {
  searchParams: { tag?: string }
}) {
  const locale = (cookies().get('NEXT_LOCALE')?.value || 'en') as 'en' | 'es'
  const t = getT(locale)
  const [notes, siteName] = await Promise.all([
    getAllNotes(locale),
    getSiteName(),
  ])
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags))).sort()
  const activeTag = searchParams.tag
  const filteredNotes = activeTag
    ? notes.filter((n) => n.tags.includes(activeTag))
    : notes
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">
        {siteName}&apos;s {t('navbar.garden')}
      </h1>
      <div className="mb-4 text-center">
        <Link
          href={locale === 'es' ? '/es/digital-garden/graph' : '/digital-garden/graph'}
          className="text-blue-600 hover:underline"
        >
          {t('digital_garden.graph_view')}
        </Link>
      </div>
      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          <Link href={locale === 'es' ? '/es/digital-garden' : '/digital-garden'}>
            <Badge
              variant="outline"
              className={cn(
                'border-green-500 text-green-500',
                !activeTag && 'bg-green-500 text-white',
              )}
            >
              {t('digital_garden.all')}
            </Badge>
          </Link>
          {allTags.map((tag) => (
            <Link
              key={tag}
              href={{
                pathname: locale === 'es' ? '/es/digital-garden' : '/digital-garden',
                query: { tag },
              }}
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
            href={
              locale === 'es'
                ? `/es/digital-garden/${note.slug}`
                : `/digital-garden/${note.slug}`
            }
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
