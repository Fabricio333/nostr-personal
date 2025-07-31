import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { nostrClient, type NostrPost } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"
import { marked } from "marked" // For Markdown rendering
import { nip19 } from "nostr-tools"

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const { id } = params
  const settings = getNostrSettings()

  if (!settings.ownerNpub || !settings.ownerNpub.startsWith("npub1")) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-destructive mb-2">Configuration Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No valid Nostr public key configured. Please update settings.json to set it up.
            </p>
            
          </CardContent>
        </Card>
      </div>
    )
  }

  let post: NostrPost | null = null
  try {
    post = await nostrClient.fetchPost(id)
  } catch (error) {
    console.error("Error fetching blog post:", error)
  }

  if (!post) {
    notFound()
  }

  // Render markdown content
  const renderedContent = marked.parse(post.content || "")

  // Extract 't' tags
  const tags = post.tags
    .filter((t) => t[0] === "t" && t[1])
    .map((t) => t[1]!)

  const nevent = nip19.neventEncode({ id: post.id })
  const njumpUrl = `https://njump.me/${nevent}`

  return (
    <div className="container mx-auto px-4 py-8">
      <div
        className="prose dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: renderedContent }}
      />

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge key={tag} variant="outline">
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Button asChild>
          <a href={njumpUrl} target="_blank" rel="noopener noreferrer">
            Watch on your favorite Nostr clients
          </a>
        </Button>
      </div>
    </div>
  )
}
