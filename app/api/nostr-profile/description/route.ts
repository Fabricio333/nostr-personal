import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const locale = searchParams.get("locale") || "en";
    const filePath = path.join(
      process.cwd(),
      "public",
      locale,
      "nostr",
      "description.md"
    );
    const content = await fs.readFile(filePath, "utf8");
    return new NextResponse(content, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
