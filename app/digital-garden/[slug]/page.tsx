import Link from 'next/link'
import type { Metadata } from 'next'
import { cookies, headers } from 'next/headers'
import { marked } from 'marked'
import { getAllNotes, getNote } from '@/lib/digital-garden'
import { getSiteName } from '@/lib/settings'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { slugify } from '@/lib/slugify'
import MissingNote from '@/components/MissingNote'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const translations = { en, es } as const

export const revalidate = 60 * 60 * 24

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const siteName = await getSiteName()
  const cookieStore = cookies()
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as 'en' | 'es'
  const gardenTitle = `${siteName}'s ${translations.en.navbar.garden}`
  const note = await getNote(params.slug, locale)
  if (!note) {
    return { title: gardenTitle, robots: { index: false, follow: true } }
  }
  const headersList = headers()
  const host =
    headersList.get('x-forwarded-host') ||
    headersList.get('host') ||
    'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
  const url =
    locale === 'es'
      ? `${siteUrl}/es/digital-garden/${params.slug}`
      : `${siteUrl}/digital-garden/${params.slug}`
  const title = `${note.title} – ${gardenTitle}`
  const description = note.content
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\s+/g, ' ')
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/digital-garden/${params.slug}`,
        es: `${siteUrl}/es/digital-garden/${params.slug}`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: ['/digital-garden.png'],
    },
    twitter: {
      title,
      description,
      images: ['/digital-garden.png'],
    },
  }
}

function getT(locale: keyof typeof translations) {
  return (key: string) =>
    key.split('.').reduce((o: any, k) => (o ? o[k] : undefined), translations[locale]) || key
}

export default async function DigitalGardenNotePage({ params }: { params: { slug: string } }) {
  const locale = (cookies().get('NEXT_LOCALE')?.value || 'en') as 'en' | 'es'
  const t = getT(locale)
  const [note, notes] = await Promise.all([
    getNote(params.slug, locale),
    getAllNotes(locale),
  ])
  if (!note) {
    return <MissingNote slug={params.slug} locale={locale} />
  }
  const existingSlugs = new Set(notes.map((n) => n.slug))
  let content = note.content.replace(/\[\[([^\]]+)\]\]/g, (_match, p1) => {
    const slug = slugify(p1)
    const base = locale === 'es' ? '/es/digital-garden' : '/digital-garden'
    if (!existingSlugs.has(slug)) {
      return `<span class="wikilink-missing">[[${p1}]]</span>`
    }
    return `[${p1}](${base}/${slug})`
  })
  const renderer = new marked.Renderer()
  const originalImage = renderer.image.bind(renderer)
  renderer.image = (href, title, text) => {
    const size = text.match(/^(\d+)x(\d+)$/)
    if (size) {
      const [_, width, height] = size
      return `<img src="${href}" width="${width}" height="${height}" alt="" />`
    }
    return originalImage(href, title, text)
  }
  const html = marked.parse(content, { renderer })
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <article className="prose dark:prose-invert [&_img]:h-auto">
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
        <Button asChild variant="outline">
          <Link href={locale === 'es' ? '/es/digital-garden' : '/digital-garden'}>
            {t('digital_garden.back')}
          </Link>
        </Button>
      </div>
    </div>
  )
}
