import { CardDescription } from "@/components/ui/card"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MessageCircle, Eye, ExternalLink } from "lucide-react"
import Link from "next/link"
import { nostrClient, type NostrArticle, npubToHex } from "@/lib/nostr"
import { getSettings } from "@/lib/settings"
import { marked } from "marked" // For Markdown rendering

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const { id } = params
  const settings = getSettings()

  if (!settings.npub || !settings.npub.startsWith("npub1")) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-destructive max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="text-destructive text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-destructive mb-2">Configuration Required</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No valid Nostr public key configured. Please go to settings to set it up.
            </p>
            <Button asChild>
              <Link href="/settings">Configure Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  let post: NostrArticle | null = null
  try {
    await nostrClient.connect()
    const pubkeyHex = npubToHex(settings.npub)
    if (pubkeyHex) {
      const event = await nostrClient.fetchEventById(id, pubkeyHex)
      if (event) {
        post = nostrClient.parseArticleMetadata(event)
      }
    }
  } catch (error) {
    console.error("Error fetching blog post:", error)
  } finally {
    nostrClient.disconnect()
  }

  if (!post) {
    notFound()
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Render markdown content
  const renderedContent = marked.parse(post.content || "")

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant={post.kind === 30023 ? "default" : "secondary"}>
              {post.kind === 30023 ? "Article" : "Note"}
            </Badge>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {formatDate(post.created_at)}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">{post.title || "Untitled Post"}</CardTitle>
          {post.summary && <CardDescription className="text-lg">{post.summary}</CardDescription>}
        </CardHeader>
        <CardContent>
          {post.image && (
            <img
              src={post.image || "/placeholder.png"}
              alt={post.title || "Post image"}
              className="w-full h-64 object-cover rounded-md mb-6"
            />
          )}
          <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderedContent }} />

          <div className="mt-8 flex items-center justify-between border-t pt-4">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Eye className="mr-1 h-4 w-4" />
                {post.views} views
              </div>
              <div className="flex items-center">
                <MessageCircle className="mr-1 h-4 w-4" />
                {post.comments} comments
              </div>
            </div>
            {post.url && (
              <Button variant="outline" size="sm" asChild>
                <a href={post.url} target="_blank" rel="noopener noreferrer">
                  View on Nostr
                  <ExternalLink className="ml-2 h-3 w-3" />
                </a>
              </Button>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
