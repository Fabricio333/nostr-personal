import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cookies, headers } from 'next/headers'
import type { Metadata } from 'next'
import { getAllNotes } from '@/lib/digital-garden'
import { getSiteName } from '@/lib/settings'
import { slugify } from '@/lib/slugify'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const translations = { en, es } as const

export const revalidate = 60 * 60 * 24

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getSiteName()
  const cookieStore = cookies()
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'en') as 'en' | 'es'
  const headersList = headers()
  const host =
    headersList.get('x-forwarded-host') ||
    headersList.get('host') ||
    'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'https'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`
  const url =
    locale === 'es'
      ? `${siteUrl}/es/digital-garden/graph`
      : `${siteUrl}/digital-garden/graph`
  const title = `${siteName}'s ${translations.en.navbar.garden} – ${translations[locale].digital_garden.garden_graph}`
  return {
    title,
    alternates: {
      canonical: url,
      languages: {
        en: `${siteUrl}/digital-garden/graph`,
        es: `${siteUrl}/es/digital-garden/graph`,
      },
    },
    openGraph: {
      title,
      url,
      type: 'website',
      images: ['/digital-garden.png'],
    },
    twitter: {
      title,
      images: ['/digital-garden.png'],
    },
  }
}

function getT(locale: keyof typeof translations) {
  return (key: string) =>
    key.split('.').reduce((o: any, k) => (o ? o[k] : undefined), translations[locale]) || key
}

const GraphWithSettings = dynamic(() => import('@/components/graph-with-settings'), { ssr: false })

export default async function DigitalGardenGraphPage() {
  const locale = (cookies().get('NEXT_LOCALE')?.value || 'en') as 'en' | 'es'
  const t = getT(locale)
  const notes = await getAllNotes(locale)
  const nodes = notes.map((n) => ({ id: n.slug, title: n.title, tags: n.tags }))
  const links: { source: string; target: string }[] = []
  const linkRegex = /\[\[([^\]]+)\]\]/g
  for (const note of notes) {
    let match: RegExpExecArray | null
    while ((match = linkRegex.exec(note.content)) !== null) {
      const target = slugify(match[1])
      if (nodes.find((n) => n.id === target)) {
        links.push({ source: note.slug, target })
      }
    }
  }
  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags))).sort()
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-center text-3xl font-bold">{t('digital_garden.garden_graph')}</h1>
      <GraphWithSettings data={{ nodes, links }} tags={allTags} />
      <div className="mt-4 text-center">
        <Button asChild variant="outline">
          <Link href={locale === 'es' ? '/es/digital-garden' : '/digital-garden'}>
            {t('digital_garden.back')}
          </Link>
        </Button>
      </div>
    </div>
  )
}
