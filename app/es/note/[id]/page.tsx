import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const dir = path.join(process.cwd(), "nostr-translations");
  const files = fs.readdirSync(dir);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({ id: file.replace(".md", "") }));
}

export default function SpanishNotePage({ params }: { params: { id: string } }) {
  const { id } = params;
  const filePath = path.join(process.cwd(), "nostr-translations", `${id}.md`);
  if (!fs.existsSync(filePath)) {
    notFound();
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const html = marked.parse(content);
  const publishDate = data.publishing_date;

  return (
    <div className="container mx-auto px-4 py-8">
      {publishDate && (
        <p className="text-sm text-slate-500 mb-4">{publishDate}</p>
      )}
      <article
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="mt-4">
        <Link href={`/blog/${id}`} className="text-blue-600 hover:underline">
          View original post
        </Link>
      </div>
    </div>
  );
}
