import { NextResponse } from "next/server"
import path from "path"
import { promises as fs } from "fs"
import matter from "gray-matter"
import { nip19 } from "nostr-tools"

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    let id = params.id
    if (id.startsWith("note")) {
      try {
        const decoded = nip19.decode(id)
        if (decoded.type === "note") {
          id = decoded.data as string
        }
      } catch {
        // ignore decode errors and try as-is
      }
    }

    const dir = path.join(process.cwd(), "public", "es", "nostr")
    const directPath = path.join(dir, `${id}.md`)
    try {
      const raw = await fs.readFile(directPath, "utf8")
      const { data, content } = matter(raw)
      return NextResponse.json({ data, content })
    } catch {
      // fall back to scanning files
    }

    try {
      const files = await fs.readdir(dir)
      for (const file of files) {
        if (!file.endsWith(".md") || file === "description.md") continue
        try {
          const raw = await fs.readFile(path.join(dir, file), "utf8")
          const { data, content } = matter(raw)
          let fileId =
            data.id || data.note || data.event || file.replace(/\.md$/, "")
          if (typeof fileId === "string" && fileId.startsWith("note")) {
            try {
              const decoded = nip19.decode(fileId)
              if (decoded.type === "note") {
                fileId = decoded.data as string
              }
            } catch {
              continue
            }
          }
          if (fileId === id) {
            return NextResponse.json({ data, content })
          }
        } catch {
          // ignore invalid files
        }
      }
    } catch {
      // ignore directory errors
    }

    return new NextResponse("Not Found", { status: 404 })
  } catch {
    return new NextResponse("Not Found", { status: 404 })
  }
}
