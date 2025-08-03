import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"
import matter from "gray-matter"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get("locale") || "es"
    const dir = path.join(process.cwd(), "public", locale, "nostr")
    const files = await fs.readdir(dir)
    const results: Array<{ id: string; data: any; content: string }> = []
    for (const file of files) {
      if (!file.endsWith(".md") || file === "description.md") continue
      try {
        const raw = await fs.readFile(path.join(dir, file), "utf8")
        const { data, content } = matter(raw)
        const id = (data.id || data.note || data.event || file.replace(/\.md$/, "")) as string
        results.push({ id, data, content })
      } catch {
        // skip files with invalid front matter
      }
    }
    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
