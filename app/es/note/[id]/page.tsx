import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { marked } from "marked"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), "nostr-translations")
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({ id: file.replace(".md", "") }))
}

export default function TranslatedNotePage({ params }: { params: { id: string } }) {
  const { id } = params
  const filePath = path.join(process.cwd(), "nostr-translations", `${id}.md`)
  if (!fs.existsSync(filePath)) {
    notFound()
  }
  const file = fs.readFileSync(filePath, "utf8")
  const { data, content } = matter(file)
  const html = marked.parse(content)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <Card className="mx-auto max-w-3xl border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            {data.publishing_date && (
              <p className="text-xs text-muted-foreground mb-4">{data.publishing_date}</p>
            )}
            <article
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
            <div className="mt-8">
              <a
                href={`https://njump.me/${id}`}
                className="text-blue-600 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver publicación original
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
