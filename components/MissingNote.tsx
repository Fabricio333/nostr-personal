import Link from 'next/link'

interface MissingNoteProps {
  slug: string
  locale: 'en' | 'es'
}

export default function MissingNote({ slug, locale }: MissingNoteProps) {
  const base = locale === 'es' ? '/es/digital-garden' : '/digital-garden'
  const title = slug.replace(/-/g, ' ')
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <article className="prose dark:prose-invert">
        <h1>{title}</h1>
        <p>This note has not been created yet.</p>
        <Link href={base} className="text-blue-600 hover:underline">
          Back to the garden
        </Link>
      </article>
    </div>
  )
}
