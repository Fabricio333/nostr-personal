import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import fs from "fs/promises"
import path from "path"
import { marked } from "marked"
import matter from "gray-matter"
import type { Metadata } from "next"
import { getSettings } from "@/lib/settings"
import en from "@/locales/en.json"
import es from "@/locales/es.json"

export const revalidate = 60 * 60 * 24

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), "public", "en", "projects")
  const files = await fs.readdir(dir)
  return files
    .filter((f) => f.endsWith(".md"))
    .map((f) => ({ slug: f.replace(/\.md$/, "") }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const cookieStore = cookies()
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as "en" | "es") || "en"
  const filePath = path.join(process.cwd(), "public", locale, "projects", `${params.slug}.md`)

  try {
    const markdown = await fs.readFile(filePath, "utf8")
    const { data } = matter(markdown)
    const { siteName } = getSettings()
    const translations: Record<string, any> = { en, es }
    const shortDescription =
      translations[locale]?.projects?.list?.[params.slug]?.short_description as string | undefined

    return {
      title: `${data.title as string} - ${siteName}`,
      description: shortDescription || (data.description as string | undefined),
    }
  } catch {
    return {}
  }
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

  const { content, data } = matter(markdown || "")
  const html = marked.parse(content || "")
  const links = (data as any).links as {
    demo?: string
    source?: string
    website?: string
  }

  const linkLabels = {
    demo: locale === "es" ? "Demo en vivo" : "Live Demo",
    source: locale === "es" ? "Código fuente" : "Source Code",
    website: locale === "es" ? "Sitio web" : "Website",
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <article className="prose dark:prose-invert">
        {data.title && <h1>{data.title as string}</h1>}
        {data.description && <p>{data.description as string}</p>}
        {links && (
          <ul>
            {links.demo && (
              <li>
                <a href={links.demo} target="_blank" rel="noopener noreferrer">
                  {linkLabels.demo}
                </a>
              </li>
            )}
            {links.source && (
              <li>
                <a href={links.source} target="_blank" rel="noopener noreferrer">
                  {linkLabels.source}
                </a>
              </li>
            )}
            {links.website && (
              <li>
                <a href={links.website} target="_blank" rel="noopener noreferrer">
                  {linkLabels.website}
                </a>
              </li>
            )}
          </ul>
        )}
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  )
}
