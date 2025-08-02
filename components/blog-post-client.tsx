"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useI18n } from "@/components/locale-provider"
import { nostrClient, type NostrPost } from "@/lib/nostr"
import { marked } from "marked"
import { nip19 } from "nostr-tools"

export default function BlogPostClient({ initialPost }: { initialPost: NostrPost }) {
  const { locale } = useI18n()
  const [post, setPost] = useState<NostrPost>(initialPost)

  useEffect(() => {
    async function load() {
      const fetched = await nostrClient.fetchPost(initialPost.id, locale)
      if (fetched) {
        setPost(fetched)
      }
    }
    load()
  }, [initialPost.id, locale])

  const renderedContent = marked.parse(post.content || "")
  const formatDate = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

  const authorName = post.profile?.display_name || post.profile?.name || "Anonymous"
  const profilePic = post.profile?.picture || "/placeholder-user.jpg"
  const displayDate = formatDate(post.published_at || post.created_at)

  const tags = post.tags.filter((t) => t[0] === "t" && t[1]).map((t) => t[1]!)
  const nevent = nip19.neventEncode({ id: post.id })
  const njumpUrl = `https://njump.me/${nevent}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/blog" className="text-blue-600 hover:underline">
            ← Back to Blog
          </Link>
        </div>
        <Card className="mx-auto max-w-3xl border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="mb-6 flex items-center gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={profilePic} alt={authorName} />
                <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{authorName}</p>
                <p className="text-xs text-muted-foreground">{displayDate}</p>
              </div>
            </div>

            <article
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />

            {tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-purple-500 text-purple-500">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
