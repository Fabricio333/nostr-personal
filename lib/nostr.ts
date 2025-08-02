import { SimplePool, type Event, type Filter, nip19 } from "nostr-tools"

// Default relays
const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://relay.nostr.band",
  "wss://nostr.wine",
]

// Cache for storing fetched data
const cache = new Map<string, any>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

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
  translation?: any
}

// Initialize pool
let pool: SimplePool | null = null

function getPool(): SimplePool {
  if (!pool) {
    pool = new SimplePool()
  }
  return pool
}

function getCacheKey(type: string, identifier: string): string {
  return `${type}:${identifier}`
}

function getCachedData(key: string): any | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })

  // Also store in localStorage for persistence
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    )
  } catch (error) {
    console.warn("Failed to store in localStorage:", error)
  }
}

function getStoredData(key: string): any | null {
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed.data
      }
    }
  } catch (error) {
    console.warn("Failed to retrieve from localStorage:", error)
  }
  return null
}

export async function fetchNostrProfile(npub: string): Promise<NostrProfile | null> {
  try {
    const cacheKey = getCacheKey("profile", npub)

    // Check cache first
    let cached = getCachedData(cacheKey)
    if (!cached && typeof window !== "undefined") {
      cached = getStoredData(cacheKey)
      if (cached) {
        setCachedData(cacheKey, cached) // Restore to memory cache
      }
    }
    if (cached) {
      return cached
    }

    // Decode npub to hex
    let pubkeyHex: string
    try {
      if (npub.startsWith("npub")) {
        const decoded = nip19.decode(npub)
        if (decoded.type === "npub") {
          pubkeyHex = decoded.data
        } else {
          throw new Error("Invalid npub format")
        }
      } else {
        // Assume it's already hex
        pubkeyHex = npub
      }
    } catch (error) {
      console.error("Failed to decode npub:", error)
      return null
    }

    const currentPool = getPool()

    // Fetch profile metadata (kind 0)
    const filter: Filter = {
      kinds: [0],
      authors: [pubkeyHex],
      limit: 1,
    }

    const events = await currentPool.querySync(DEFAULT_RELAYS, filter)

    if (events.length === 0) {
      return null
    }

    const profileEvent = events[0]
    let profile: NostrProfile = {}

    try {
      profile = JSON.parse(profileEvent.content)
    } catch (error) {
      console.error("Failed to parse profile content:", error)
      profile = {}
    }

    setCachedData(cacheKey, profile)
    return profile
  } catch (error) {
    console.error("Error fetching Nostr profile:", error)
    return null
  }
}

export async function fetchNostrPosts(
  npub: string,
  limit = 50,
  locale = "en"
): Promise<NostrPost[]> {
  try {
    const cacheKey = getCacheKey("posts", `${npub}:${limit}:${locale}`)

    // Check cache first
    let cached = getCachedData(cacheKey)
    if (!cached && typeof window !== "undefined") {
      cached = getStoredData(cacheKey)
      if (cached) {
        setCachedData(cacheKey, cached) // Restore to memory cache
      }
    }
    if (cached) {
      return cached
    }

    // Decode npub to hex
    let pubkeyHex: string
    try {
      if (npub.startsWith("npub")) {
        const decoded = nip19.decode(npub)
        if (decoded.type === "npub") {
          pubkeyHex = decoded.data
        } else {
          throw new Error("Invalid npub format")
        }
      } else {
        // Assume it's already hex
        pubkeyHex = npub
      }
    } catch (error) {
      console.error("Failed to decode npub:", error)
      return []
    }

    const currentPool = getPool()

    // Fetch both notes (kind 1) and long-form articles (kind 30023)
    const filters: Filter[] = [
      {
        kinds: [1], // Notes
        authors: [pubkeyHex],
        limit: Math.ceil(limit / 2),
      },
      {
        kinds: [30023], // Long-form articles
        authors: [pubkeyHex],
        limit: Math.ceil(limit / 2),
      },
    ]

    const allEvents: Event[] = []

    for (const filter of filters) {
      try {
        const events = await currentPool.querySync(DEFAULT_RELAYS, filter)
        allEvents.push(...events)
      } catch (error) {
        console.error("Error fetching events with filter:", filter, error)
      }
    }

    // Get profile for the author
    const profile = await fetchNostrProfile(npub)

    // Convert events to posts
    let posts: NostrPost[] = allEvents.map((event) => {
      const post: NostrPost = {
        id: event.id,
        pubkey: event.pubkey,
        created_at: event.created_at,
        kind: event.kind,
        tags: event.tags,
        content: event.content,
        sig: event.sig,
        profile,
        type: event.kind === 30023 ? "article" : "note",
      }

      // For long-form articles, extract metadata from tags
      if (event.kind === 30023) {
        const titleTag = event.tags.find((tag) => tag[0] === "title")
        const summaryTag = event.tags.find((tag) => tag[0] === "summary")
        const imageTag = event.tags.find((tag) => tag[0] === "image")
        const publishedAtTag = event.tags.find((tag) => tag[0] === "published_at")

        if (titleTag && titleTag[1]) {
          post.title = titleTag[1]
        }
        if (summaryTag && summaryTag[1]) {
          post.summary = summaryTag[1]
        }
        if (imageTag && imageTag[1]) {
          post.image = imageTag[1]
        }
        if (publishedAtTag && publishedAtTag[1]) {
          post.published_at = Number.parseInt(publishedAtTag[1])
        }
      }

      return post
    })

    // If Spanish locale, filter posts by available translations
    if (locale === "es") {
      const translated: NostrPost[] = []
      const baseUrl =
        typeof window === "undefined"
          ? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          : ""
      await Promise.all(
        posts.map(async (post) => {
          try {
            const res = await fetch(
              `${baseUrl}/api/nostr-translations/${post.id}`
            )
            if (!res.ok) return
            const data = await res.json()
            post.content = data.content
            post.translation = data.data
            translated.push(post)
          } catch {
            // ignore missing translations
          }
        })
      )
      posts = translated
    }

    // Remove any duplicate posts that might come from multiple relays
    const uniquePosts = Array.from(new Map(posts.map((p) => [p.id, p])).values())

    // Sort by creation time (newest first)
    uniquePosts.sort((a, b) => b.created_at - a.created_at)

    // Limit results
    const limitedPosts = uniquePosts.slice(0, limit)

    setCachedData(cacheKey, limitedPosts)
    return limitedPosts
  } catch (error) {
    console.error("Error fetching Nostr posts:", error)
    return []
  }
}

export async function fetchNostrPost(
  id: string,
  locale = "en"
): Promise<NostrPost | null> {
  try {
    let eventId = id
    if (id.startsWith("note")) {
      try {
        const decoded = nip19.decode(id)
        if (decoded.type === "note") {
          eventId = decoded.data as string
        }
      } catch {
        // ignore decode errors and use id as-is
      }
    }

    const cacheKey = getCacheKey("post", `${eventId}:${locale}`)

    // Check cache first
    let cached = getCachedData(cacheKey)
    if (!cached && typeof window !== "undefined") {
      cached = getStoredData(cacheKey)
      if (cached) {
        setCachedData(cacheKey, cached) // Restore to memory cache
      }
    }
    if (cached) {
      return cached
    }

    const currentPool = getPool()

    // Try to fetch by event ID
    const filter: Filter = {
      ids: [eventId],
      limit: 1,
    }

    const events = await currentPool.querySync(DEFAULT_RELAYS, filter)

    if (events.length === 0) {
      return null
    }

    const event = events[0]

    // Get profile for the author
    const profile = await fetchNostrProfile(event.pubkey)

    const post: NostrPost = {
      id: event.id,
      pubkey: event.pubkey,
      created_at: event.created_at,
      kind: event.kind,
      tags: event.tags,
      content: event.content,
      sig: event.sig,
      profile,
      type: event.kind === 30023 ? "article" : "note",
    }

    // For long-form articles, extract metadata from tags
    if (event.kind === 30023) {
      const titleTag = event.tags.find((tag) => tag[0] === "title")
      const summaryTag = event.tags.find((tag) => tag[0] === "summary")
      const imageTag = event.tags.find((tag) => tag[0] === "image")
      const publishedAtTag = event.tags.find((tag) => tag[0] === "published_at")

      if (titleTag && titleTag[1]) {
        post.title = titleTag[1]
      }
      if (summaryTag && summaryTag[1]) {
        post.summary = summaryTag[1]
      }
      if (imageTag && imageTag[1]) {
        post.image = imageTag[1]
      }
      if (publishedAtTag && publishedAtTag[1]) {
        post.published_at = Number.parseInt(publishedAtTag[1])
      }
    }

    if (locale === "es") {
      const baseUrl =
        typeof window === "undefined"
          ? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
          : ""
      try {
        const res = await fetch(`${baseUrl}/api/nostr-translations/${eventId}`)
        if (!res.ok) return null
        const data = await res.json()
        post.content = data.content
        post.translation = data.data
      } catch {
        return null
      }
    }

    setCachedData(cacheKey, post)
    return post
  } catch (error) {
    console.error("Error fetching Nostr post:", error)
    return null
  }
}

// NostrClient class for compatibility
export class NostrClient {
  async fetchProfile(npub: string): Promise<NostrProfile | null> {
    return fetchNostrProfile(npub)
  }

  async fetchPosts(
    npub: string,
    limit?: number,
    locale?: string
  ): Promise<NostrPost[]> {
    return fetchNostrPosts(npub, limit, locale)
  }

  async fetchPost(id: string, locale?: string): Promise<NostrPost | null> {
    return fetchNostrPost(id, locale)
  }

  clearCache(): void {
    cache.clear()
    if (typeof window !== "undefined") {
      try {
        const keys = Object.keys(localStorage)
        keys.forEach((key) => {
          if (key.startsWith("profile:") || key.startsWith("posts:") || key.startsWith("post:")) {
            localStorage.removeItem(key)
          }
        })
      } catch (error) {
        console.warn("Failed to clear localStorage:", error)
      }
    }
  }
}

// Export singleton instance
export const nostrClient = new NostrClient()

// Cleanup function
export function cleanup(): void {
  if (pool) {
    pool.close(DEFAULT_RELAYS)
    pool = null
  }
}
