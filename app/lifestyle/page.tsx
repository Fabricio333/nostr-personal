"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import enLifestyle from "@/locales/en/lifestyle.json"
import esLifestyle from "@/locales/es/lifestyle.json"
import { fetchNostrPosts } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"
import { useI18n } from "@/components/locale-provider"

interface NostrProfile {
  name?: string
  display_name?: string
  about?: string
  picture?: string
  banner?: string
  nip05?: string
  lud16?: string
  website?: string
}

interface NostrPost {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
  profile?: NostrProfile
  type: "note" | "article"
  title?: string
  summary?: string
  image?: string
  published_at?: number
}

export default function LifestylePage() {
  const { locale } = useI18n()
  const { workouts, nutrition, biohacks, routines } =
    (locale === "es" ? esLifestyle : enLifestyle) as {
      workouts: string[]
      nutrition: string[]
      biohacks: string[]
      routines: string[]
    }

  const [posts, setPosts] = useState<NostrPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const settings = getNostrSettings()
        if (!settings.ownerNpub) {
          setLoadingPosts(false)
          return
        }

        const allPosts = await fetchNostrPosts(
          settings.ownerNpub,
          20,
          locale,
          {
            noteIds: settings.noteEventIds,
            articleIds: settings.articleEventIds,
          },
        )
        const lifestylePosts = allPosts.filter(
          (post) =>
            post.tags.some(
              (t) => t[0] === "t" && t[1]?.toLowerCase() === "lifestyle",
            ) || post.content.toLowerCase().includes("#lifestyle"),
        )

        setPosts(lifestylePosts)
      } catch (error) {
        console.error("Failed to load lifestyle posts", error)
      } finally {
        setLoadingPosts(false)
      }
    }

    loadPosts()
  }, [locale])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Lifestyle</h1>
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="posts">#lifestyle</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="biohacks">Biohacks</TabsTrigger>
          <TabsTrigger value="routines">Routines</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-6">
          <div className="space-y-4">
            {loadingPosts ? (
              <p className="text-center text-muted-foreground">Loading...</p>
            ) : posts.length === 0 ? (
              <p className="text-center text-muted-foreground">No posts found.</p>
            ) : (
              posts.map((post) => (
                <Card key={post.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {post.title || "Note"}
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {new Date(post.created_at * 1000).toLocaleDateString(
                          locale === "es" ? "es-ES" : "en-US",
                        )}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>
                      {post.content.length > 200
                        ? post.content.slice(0, 200) + "..."
                        : post.content}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="workouts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {workouts.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Nutrition</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {nutrition.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="biohacks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Biohacks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {biohacks.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="routines" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Routines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {routines.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

