import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { marked } from "marked"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), "nostr-translations")
  let files: string[] = []
  try {
    files = fs.readdirSync(dir)
  } catch {
    return []
  }
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({ note_id: file.replace(/\.md$/, "") }))
}

export default function SpanishNotePage({
  params,
}: {
  params: { note_id: string }
}) {
  const filePath = path.join(
    process.cwd(),
    "nostr-translations",
    `${params.note_id}.md`
  )
  const file = fs.readFileSync(filePath, "utf8")
  const { data, content } = matter(file)
  const html = marked.parse(content)

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-3xl border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {data.publishing_date && (
            <p className="text-sm text-muted-foreground mb-4">
              {new Date(data.publishing_date).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          <article
            className="prose dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div className="mt-8">
            <Link
              href={`/blog/${params.note_id}`}
              className="text-blue-600 hover:underline"
            >
              View original post
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
