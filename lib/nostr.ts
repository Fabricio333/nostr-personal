import { SimplePool, type Event, type Filter, nip19 } from "nostr-tools"
import { bech32Decode } from "./bech32"

// Define interfaces for our data structures
export interface NostrProfile {
  name?: string
  display_name?: string
  about?: string
  picture?: string
  banner?: string
  nip05?: string
  lud16?: string
  website?: string
}

export interface NostrPost {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
  profile?: NostrProfile
  title?: string
  summary?: string
  image?: string
  published_at?: number
}

// Cache for profiles and posts
const profileCache = new Map<string, NostrProfile>()
const postCache = new Map<string, NostrPost[]>()
const singlePostCache = new Map<string, NostrPost>()

// Default relays
const DEFAULT_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://relay.nostr.band",
  "wss://nostr.wine",
]

// Create a simple pool for managing relay connections
let pool: SimplePool | null = null

function getPool(): SimplePool {
  if (!pool) {
    pool = new SimplePool()
  }
  return pool
}

// Helper function to get cached data from localStorage
function getCachedData<T>(key: string): T | null {
  if (typeof window === "undefined") return null

  try {
    const cached = localStorage.getItem(key)
    if (cached) {
      const parsed = JSON.parse(cached)
      // Check if cache is less than 1 hour old
      if (Date.now() - parsed.timestamp < 3600000) {
        return parsed.data
      }
    }
  } catch (error) {
    console.error("Error reading from cache:", error)
  }
  return null
}

// Helper function to set cached data in localStorage
function setCachedData<T>(key: string, data: T): void {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    )
  } catch (error) {
    console.error("Error writing to cache:", error)
  }
}

// Convert npub to hex pubkey
function npubToHex(npub: string): string {
  try {
    if (npub.startsWith("npub1")) {
      const decoded = nip19.decode(npub)
      if (decoded.type === "npub") {
        return decoded.data
      }
    }
    // Fallback to custom bech32 decoder
    return bech32Decode(npub)
  } catch (error) {
    console.error("Error decoding npub:", error)
    throw new Error("Invalid npub format")
  }
}

// Fetch profile information for a given npub
export async function fetchNostrProfile(npub: string): Promise<NostrProfile | null> {
  try {
    // Check memory cache first
    if (profileCache.has(npub)) {
      return profileCache.get(npub) || null
    }

    // Check localStorage cache
    const cacheKey = `nostr_profile_${npub}`
    const cached = getCachedData<NostrProfile>(cacheKey)
    if (cached) {
      profileCache.set(npub, cached)
      return cached
    }

    const pubkey = npubToHex(npub)
    const currentPool = getPool()

    const filter: Filter = {
      kinds: [0],
      authors: [pubkey],
      limit: 1,
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(null)
      }, 10000) // 10 second timeout

      const sub = currentPool.subscribeMany(DEFAULT_RELAYS, [filter], {
        onevent(event: Event) {
          try {
            const profile: NostrProfile = JSON.parse(event.content)
            profileCache.set(npub, profile)
            setCachedData(cacheKey, profile)
            clearTimeout(timeout)
            sub.close()
            resolve(profile)
          } catch (error) {
            console.error("Error parsing profile:", error)
          }
        },
        oneose() {
          clearTimeout(timeout)
          sub.close()
          resolve(null)
        },
      })
    })
  } catch (error) {
    console.error("Error fetching Nostr profile:", error)
    return null
  }
}

// Fetch posts for a given npub
export async function fetchNostrPosts(npub: string): Promise<NostrPost[]> {
  try {
    // Check memory cache first
    if (postCache.has(npub)) {
      return postCache.get(npub) || []
    }

    // Check localStorage cache
    const cacheKey = `nostr_posts_${npub}`
    const cached = getCachedData<NostrPost[]>(cacheKey)
    if (cached) {
      postCache.set(npub, cached)
      return cached
    }

    const pubkey = npubToHex(npub)
    const currentPool = getPool()

    // Fetch both short notes (kind 1) and long-form articles (kind 30023)
    const filters: Filter[] = [
      {
        kinds: [1],
        authors: [pubkey],
        limit: 50,
      },
      {
        kinds: [30023],
        authors: [pubkey],
        limit: 20,
      },
    ]

    return new Promise((resolve) => {
      const posts: NostrPost[] = []
      const timeout = setTimeout(() => {
        const sortedPosts = posts.sort((a, b) => b.created_at - a.created_at)
        postCache.set(npub, sortedPosts)
        setCachedData(cacheKey, sortedPosts)
        resolve(sortedPosts)
      }, 10000) // 10 second timeout

      const sub = currentPool.subscribeMany(DEFAULT_RELAYS, filters, {
        onevent(event: Event) {
          try {
            const post: NostrPost = {
              id: event.id,
              pubkey: event.pubkey,
              created_at: event.created_at,
              kind: event.kind,
              tags: event.tags,
              content: event.content,
              sig: event.sig,
            }

            // For long-form articles (kind 30023), extract metadata
            if (event.kind === 30023) {
              const titleTag = event.tags.find((tag) => tag[0] === "title")
              const summaryTag = event.tags.find((tag) => tag[0] === "summary")
              const imageTag = event.tags.find((tag) => tag[0] === "image")
              const publishedAtTag = event.tags.find((tag) => tag[0] === "published_at")

              if (titleTag && titleTag[1]) post.title = titleTag[1]
              if (summaryTag && summaryTag[1]) post.summary = summaryTag[1]
              if (imageTag && imageTag[1]) post.image = imageTag[1]
              if (publishedAtTag && publishedAtTag[1]) {
                post.published_at = Number.parseInt(publishedAtTag[1])
              }
            }

            posts.push(post)
          } catch (error) {
            console.error("Error processing post:", error)
          }
        },
        oneose() {
          clearTimeout(timeout)
          sub.close()
          const sortedPosts = posts.sort((a, b) => b.created_at - a.created_at)
          postCache.set(npub, sortedPosts)
          setCachedData(cacheKey, sortedPosts)
          resolve(sortedPosts)
        },
      })
    })
  } catch (error) {
    console.error("Error fetching Nostr posts:", error)
    return []
  }
}

// Fetch a single post by ID
export async function fetchNostrPost(id: string): Promise<NostrPost | null> {
  try {
    // Check memory cache first
    if (singlePostCache.has(id)) {
      return singlePostCache.get(id) || null
    }

    // Check localStorage cache
    const cacheKey = `nostr_post_${id}`
    const cached = getCachedData<NostrPost>(cacheKey)
    if (cached) {
      singlePostCache.set(id, cached)
      return cached
    }

    const currentPool = getPool()

    const filter: Filter = {
      ids: [id],
      limit: 1,
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(null)
      }, 10000) // 10 second timeout

      const sub = currentPool.subscribeMany(DEFAULT_RELAYS, [filter], {
        onevent(event: Event) {
          try {
            const post: NostrPost = {
              id: event.id,
              pubkey: event.pubkey,
              created_at: event.created_at,
              kind: event.kind,
              tags: event.tags,
              content: event.content,
              sig: event.sig,
            }

            // For long-form articles (kind 30023), extract metadata
            if (event.kind === 30023) {
              const titleTag = event.tags.find((tag) => tag[0] === "title")
              const summaryTag = event.tags.find((tag) => tag[0] === "summary")
              const imageTag = event.tags.find((tag) => tag[0] === "image")
              const publishedAtTag = event.tags.find((tag) => tag[0] === "published_at")

              if (titleTag && titleTag[1]) post.title = titleTag[1]
              if (summaryTag && summaryTag[1]) post.summary = summaryTag[1]
              if (imageTag && imageTag[1]) post.image = imageTag[1]
              if (publishedAtTag && publishedAtTag[1]) {
                post.published_at = Number.parseInt(publishedAtTag[1])
              }
            }

            singlePostCache.set(id, post)
            setCachedData(cacheKey, post)
            clearTimeout(timeout)
            sub.close()
            resolve(post)
          } catch (error) {
            console.error("Error processing post:", error)
            resolve(null)
          }
        },
        oneose() {
          clearTimeout(timeout)
          sub.close()
          resolve(null)
        },
      })
    })
  } catch (error) {
    console.error("Error fetching Nostr post:", error)
    return null
  }
}

// NostrClient class for the required export
export class NostrClient {
  async fetchProfile(npub: string): Promise<NostrProfile | null> {
    return fetchNostrProfile(npub)
  }

  async fetchPosts(npub: string): Promise<NostrPost[]> {
    return fetchNostrPosts(npub)
  }

  async fetchPost(id: string): Promise<NostrPost | null> {
    return fetchNostrPost(id)
  }

  clearCache(): void {
    profileCache.clear()
    postCache.clear()
    singlePostCache.clear()

    if (typeof window !== "undefined") {
      // Clear localStorage cache
      const keys = Object.keys(localStorage)
      keys.forEach((key) => {
        if (key.startsWith("nostr_")) {
          localStorage.removeItem(key)
        }
      })
    }
  }
}

// Export the client instance
export const nostrClient = new NostrClient()

// Cleanup function to close connections
export function cleanup(): void {
  if (pool) {
    pool.close(DEFAULT_RELAYS)
    pool = null
  }
}
