import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import matter from "gray-matter";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const filePath = path.join(process.cwd(), "nostr-translations", `${params.id}.md`);
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    return NextResponse.json({ data, content });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
