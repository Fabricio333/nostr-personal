import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), 'nostr-translations')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => ({ id: file.replace('.md', '') }))
}

export default function SpanishNotePage({ params }: { params: { id: string } }) {
  const filePath = path.join(
    process.cwd(),
    'nostr-translations',
    `${params.id}.md`,
  )
  if (!fs.existsSync(filePath)) {
    notFound()
  }
  const file = fs.readFileSync(filePath, 'utf8')
  const { content, data } = matter(file)
  const html = marked.parse(content)
  const publishDate = data.publishing_date
    ? new Date(data.publishing_date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''
  const njumpUrl = `https://njump.me/${params.id}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href={`/blog/${params.id}`} className="text-blue-600 hover:underline">
            ← Ver original
          </Link>
        </div>
        {publishDate && (
          <p className="text-sm text-slate-500 mb-4">{publishDate}</p>
        )}
        <article
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        <div className="mt-8">
          <Link href={njumpUrl} className="text-blue-600 hover:underline">
            Ver publicación original
          </Link>
        </div>
      </div>
    </div>
  )
}
