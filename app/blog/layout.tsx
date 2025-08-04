import type React from "react"
import type { Metadata } from "next"
import { cookies } from "next/headers"
import en from "@/locales/en.json"
import es from "@/locales/es.json"
import { fetchNostrPosts } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"

export const revalidate = 60 * 60 * 24

export async function generateMetadata(): Promise<Metadata> {
  const settings = getNostrSettings()
  const cookieStore = cookies()
  const locale = (cookieStore.get("NEXT_LOCALE")?.value as "en" | "es") || "en"
  const dict = locale === "es" ? es : en

  let description = dict.blog.subtitle

  try {
    if (settings.ownerNpub) {
      const posts = await fetchNostrPosts(
        settings.ownerNpub,
        3,
        locale,
        {
          noteIds: settings.noteEventIds,
          articleIds: settings.articleEventIds,
        },
      )
      const titles = posts
        .map((p) => p.title || p.content.slice(0, 50))
        .filter(Boolean)
        .slice(0, 3)
      if (titles.length > 0) {
        const prefix = locale === "es" ? "Últimas publicaciones: " : "Latest posts: "
        description = `${prefix}${titles.join(", ")}`
      }
    }
  } catch (error) {
    // Ignore errors and keep default description
    console.error("Error generating blog metadata:", error)
  }

  const title = dict.blog.title

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  }
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

