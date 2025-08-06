import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { marked } from 'marked'
import { getNote } from '@/lib/digital-garden'
import { Badge } from '@/components/ui/badge'
import { slugify } from '@/lib/slugify'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const translations = { en, es } as const

export const revalidate = 60 * 60 * 24

function getT(locale: keyof typeof translations) {
  return (key: string) =>
    key.split('.').reduce((o: any, k) => (o ? o[k] : undefined), translations[locale]) || key
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const locale = (cookies().get('NEXT_LOCALE')?.value || 'en') as 'en' | 'es'
  const note = await getNote(params.slug, locale)
  const suffix = locale === 'es' ? 'Jardin de Fabricio' : "Fabricio's Garden"
  const baseTitle = note?.title || params.slug
  const title = `${baseTitle} - ${suffix}`
  return {
    title,
    openGraph: { title },
    twitter: { title },
  }
}

export default async function DigitalGardenNotePage({ params }: { params: { slug: string } }) {
  const locale = (cookies().get('NEXT_LOCALE')?.value || 'en') as 'en' | 'es'
  const t = getT(locale)
  const note = await getNote(params.slug, locale)
  if (!note) {
    notFound()
  }
  let content = note.content.replace(/\[\[([^\]]+)\]\]/g, (_match, p1) => {
    const slug = slugify(p1)
    const base = locale === 'es' ? '/es/digital-garden' : '/digital-garden'
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
        <Link
          href={locale === 'es' ? '/es/digital-garden' : '/digital-garden'}
          className="text-blue-600 hover:underline"
        >
          {t('digital_garden.back')}
        </Link>
      </div>
    </div>
  )
}
