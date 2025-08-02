import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";
import { nip19 } from "nostr-tools";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    let id = params.id;
    if (id.startsWith("note")) {
      try {
        const decoded = nip19.decode(id);
        if (decoded.type === "note") {
          id = decoded.data as string;
        }
      } catch {
        // ignore decode errors and try as-is
      }
    }

    const filePath = path.join(process.cwd(), "nostr-translations", `${id}.md`);
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    return NextResponse.json({ data, content });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
