import Link from 'next/link'
import { searchContent, SearchSource } from '@/lib/search'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; source?: SearchSource }
}) {
  const query = searchParams.q ?? ''
  const source = (searchParams.source as SearchSource) ?? 'all'
  const results = await searchContent(query, source)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Search Results</h1>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <ul className="space-y-4">
          {results.map((res, idx) => (
            <li key={idx} className="rounded border p-4">
              <div className="mb-1 text-sm capitalize text-muted-foreground">{res.type}</div>
              <Link href={res.url} className="font-semibold hover:underline">
                {res.title}
              </Link>
              <p className="text-sm text-muted-foreground">{res.snippet}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

