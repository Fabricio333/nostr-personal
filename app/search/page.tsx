import Link from "next/link"
import { getNostrSettings } from "@/lib/nostr-settings"
import { fetchNostrPosts, type NostrPost } from "@/lib/nostr"
import { getAllNotes, getNote } from "@/lib/digital-garden"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; source?: string }
}) {
  const query = (searchParams.q || "").toLowerCase()
  const source = searchParams.source || "all"

  const settings = getNostrSettings()
  const npub = settings.ownerNpub

  const shouldFetchNostr = source === "all" || source === "nostr" || source === "article"
  const shouldFetchNotes = source === "all" || source === "garden"

  let posts: NostrPost[] = []
  if (npub && shouldFetchNostr) {
    posts = await fetchNostrPosts(npub, settings.maxPosts || 100)
  }

  let notes: { slug: string; title: string; content: string }[] = []
  if (shouldFetchNotes) {
    const meta = await getAllNotes()
    notes = await Promise.all(
      meta.map(async (m) => {
        const n = await getNote(m.slug)
        return { slug: m.slug, title: n?.title || m.title, content: n?.content || "" }
      }),
    )
  }

  const match = (text?: string) => text?.toLowerCase().includes(query)

  const nostrNotes = posts.filter(
    (p) => p.type === "note" && (!query || match(p.content))
  )
  const articles = posts.filter(
    (p) =>
      p.type === "article" &&
      (!query || match(p.title) || match(p.content) || match(p.summary))
  )
  const gardenResults = notes.filter(
    (n) => !query || match(n.title) || match(n.content)
  )

  const truncate = (text: string, max = 160) =>
    text.length > max ? text.slice(0, max) + "…" : text

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Search Results</h1>
      {(source === "all" || source === "nostr") && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Nostr Notes</h2>
          {nostrNotes.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-300">No results.</p>
          ) : (
            <div className="space-y-4">
              {nostrNotes.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <CardTitle>
                      <Link href={`/blog/${post.id}`}>{truncate(post.content)}</Link>
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {(source === "all" || source === "article") && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Articles</h2>
          {articles.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-300">No results.</p>
          ) : (
            <div className="space-y-4">
              {articles.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <CardTitle>
                      <Link href={`/blog/${post.id}`}>{post.title || truncate(post.content)}</Link>
                    </CardTitle>
                  </CardHeader>
                  {post.summary && (
                    <CardContent>{post.summary}</CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      {(source === "all" || source === "garden") && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">Garden Notes</h2>
          {gardenResults.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-300">No results.</p>
          ) : (
            <div className="space-y-4">
              {gardenResults.map((note) => (
                <Card key={note.slug}>
                  <CardHeader>
                    <CardTitle>
                      <Link href={`/digital-garden/${note.slug}`}>{note.title}</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 dark:text-slate-300">
                      {truncate(note.content)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}

