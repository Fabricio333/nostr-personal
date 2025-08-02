import dynamic from 'next/dynamic'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { getAllNotes } from '@/lib/digital-garden'
import { slugify } from '@/lib/slugify'
import en from '@/locales/en.json'
import es from '@/locales/es.json'

const translations = { en, es } as const

function getT(locale: keyof typeof translations) {
  return (key: string) =>
    key.split('.').reduce((o: any, k) => (o ? o[k] : undefined), translations[locale]) || key
}

const WikiGraph = dynamic(() => import('@/components/wiki-graph'), { ssr: false })

export default async function DigitalGardenGraphPage() {
  const locale = (cookies().get('NEXT_LOCALE')?.value || 'en') as 'en' | 'es'
  const t = getT(locale)
  const notes = await getAllNotes(locale)
  const nodes = notes.map((n) => ({ id: n.slug, title: n.title }))
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
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-4 text-center text-3xl font-bold">{t('digital_garden.garden_graph')}</h1>
      <WikiGraph data={{ nodes, links }} />
      <div className="mt-4 text-center">
        <Link href="/digital-garden" className="text-blue-600 hover:underline">
          {t('digital_garden.back')}
        </Link>
      </div>
    </div>
  )
}
