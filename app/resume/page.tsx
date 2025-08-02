import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Linkedin, Github } from "lucide-react"
import { getSiteName } from "@/lib/settings"
import { cookies } from "next/headers"
import fs from "fs/promises"
import path from "path"
import { marked } from "marked"

export default async function ResumePage() {
  const name = await getSiteName()
  const cookieStore = cookies()
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as "en" | "es") || "en"
  const filePath = path.join(process.cwd(), "public", locale, "resume.md")

  let markdown = ""
  try {
    markdown = await fs.readFile(filePath, "utf8")
  } catch {
    markdown = "Resume not available."
  }
  const html = marked.parse(markdown)

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
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        </CardContent>
      </Card>
    </div>
  )
}
