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
    if (!/^[0-9a-f]{64}$/.test(id)) {
      try {
        const decoded = nip19.decode(id);
        if (typeof decoded.data === "string") id = decoded.data;
      } catch {
        // If decoding fails, the id will remain unchanged
      }
    }

    const filePath = path.join(
      process.cwd(),
      "nostr-translations",
      `${id}.md`,
    );
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    return NextResponse.json({ data, content });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
