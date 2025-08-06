import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Linkedin, Github } from "lucide-react"
import { getSettings } from "@/lib/settings"
import type { Metadata } from "next"
import { getCanonicalUrl } from "@/utils/getCanonicalUrl"
import { getLocaleFromPath } from "@/utils/getLocaleFromPath"
import fs from "fs/promises"
import path from "path"
import { marked } from "marked"
import matter from "gray-matter"

export const revalidate = 60 * 60 * 24

export async function generateMetadata(): Promise<Metadata> {
  const { siteName } = getSettings()
  const locale = getLocaleFromPath()
  const dirPath = path.join(process.cwd(), "public", locale, "resume")

  let description = ""
  try {
    const files = await fs.readdir(dirPath)
    const mdFiles = files.filter((f) => f.endsWith(".md"))
    const parsed = await Promise.all(
      mdFiles.map(async (file) => {
        const raw = await fs.readFile(path.join(dirPath, file), "utf8")
        const { data, content } = matter(raw)
        return {
          order: (data.order as number) || 0,
          content,
        }
      })
    )
    const first = parsed.sort((a, b) => a.order - b.order)[0]
    if (first?.content) {
      const firstParagraph = first.content
        .trim()
        .split(/\n\s*\n/)[0]
        .replace(/\n/g, " ")
        .trim()
      description = firstParagraph
    }
  } catch {
    description = ""
  }

  const title = siteName
  const image = "/linkedin-picture.jpeg"
  const siteUrl = getCanonicalUrl()
  const url = `${siteUrl}${locale === "es" ? "/es" : ""}/resume`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  }
}

export default async function ResumePage() {
  const { siteName: name } = getSettings()
  const locale = getLocaleFromPath()
  const dirPath = path.join(process.cwd(), "public", locale, "resume")

  let sections: { title: string; order: number; html: string }[] = []
  try {
    const files = await fs.readdir(dirPath)
    const mdFiles = files.filter((f) => f.endsWith(".md"))
    const parsed = await Promise.all(
      mdFiles.map(async (file) => {
        const raw = await fs.readFile(path.join(dirPath, file), "utf8")
        const { data, content } = matter(raw)
        return {
          title: (data.title as string) || file,
          order: (data.order as number) || 0,
          html: marked.parse(content),
        }
      })
    )
    sections = parsed.sort((a, b) => a.order - b.order)
  } catch {
    sections = []
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold mb-2">{name}</CardTitle>
          <p className="text-lg text-muted-foreground">
            Finance Student | Economics &amp; Business Enthusiast
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Buenos Aires, Argentina</span>
            </div>
            <div className="flex items-center gap-1">
              <Linkedin className="h-4 w-4" />
              <a
                href="https://linkedin.com/in/fabricio-acosta-ok"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                LinkedIn
              </a>
            </div>
            <div className="flex items-center gap-1">
              <Github className="h-4 w-4" />
              <a
                href="https://github.com/Fabricio333"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                GitHub
              </a>
            </div>
          </div>
        </CardHeader>

        <Separator className="my-8" />

        <CardContent>
          <article className="prose dark:prose-invert">
            {sections.length ? (
              sections.map((section) => (
                <section key={section.title} className="mb-8">
                  <h2>{section.title}</h2>
                  <div dangerouslySetInnerHTML={{ __html: section.html }} />
                </section>
              ))
            ) : (
              <p>Resume not available.</p>
            )}
          </article>
        </CardContent>
      </Card>
    </div>
  )
}
