import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Linkedin, Github } from "lucide-react"
import { getSiteName } from "@/lib/settings"
import { cookies } from "next/headers"
import fs from "fs/promises"
import path from "path"
import { marked } from "marked"
import matter from "gray-matter"

export default async function ResumePage() {
  const name = await getSiteName()
  const cookieStore = cookies()
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as "en" | "es") || "en"
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
