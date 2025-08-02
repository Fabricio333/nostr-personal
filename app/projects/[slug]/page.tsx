import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import fs from "fs/promises"
import path from "path"
import { marked } from "marked"

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), "public", "en", "projects")
  const files = await fs.readdir(dir)
  return files
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ slug: f.replace(/\.md$/, "") }))
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const cookieStore = cookies()
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as "en" | "es") || "en"
  const filePath = path.join(process.cwd(), "public", locale, "projects", `${params.slug}.md`)

  let markdown: string
  try {
    markdown = await fs.readFile(filePath, "utf8")
  } catch {
    notFound()
  }
  const html = marked.parse(markdown || "")

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <article className="prose dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  )
}
