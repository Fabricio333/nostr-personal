export interface NostrPost {
  id: string
  content: string
  title?: string
  created_at: number
  tags?: string[]
  views?: number
  comments?: number
  pubkey: string
  sig: string
  kind: number
  d_tag?: string
  image?: string
  summary?: string
  published_at?: number
}

export interface NostrEvent {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
}

export interface NostrProfile {
  name?: string
  display_name?: string
  about?: string
  picture?: string
  nip05?: string
  banner?: string
  website?: string
  lud16?: string
}

// Bech32 decoding for npub
const BECH32_CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"

function bech32Polymod(values: number[]): number {
  let chk = 1
  for (const value of values) {
    const top = chk >> 25
    chk = ((chk & 0x1ffffff) << 5) ^ value
    for (let i = 0; i < 5; i++) {
      chk ^= (top >> i) & 1 ? [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3][i] : 0
    }
  }
  return chk
}

function bech32HrpExpand(hrp: string): number[] {
  const ret = []
  for (let p = 0; p < hrp.length; p++) {
    ret.push(hrp.charCodeAt(p) >> 5)
  }
  ret.push(0)
  for (let p = 0; p < hrp.length; p++) {
    ret.push(hrp.charCodeAt(p) & 31)
  }
  return ret
}

function bech32VerifyChecksum(hrp: string, data: number[]): boolean {
  return bech32Polymod(bech32HrpExpand(hrp).concat(data)) === 1
}

function bech32Decode(bechString: string): { hrp: string; data: number[] } {
  if (bechString.length < 8 || bechString.length > 90) {
    throw new Error("Invalid bech32 string length")
  }

  const pos = bechString.lastIndexOf("1")
  if (pos < 1 || pos + 7 > bechString.length) {
    throw new Error("Invalid bech32 separator position")
  }

  const hrp = bechString.substring(0, pos)
  const data = []

  for (let p = pos + 1; p < bechString.length; p++) {
    const d = BECH32_CHARSET.indexOf(bechString.charAt(p))
    if (d === -1) {
      throw new Error("Invalid bech32 character")
    }
    data.push(d)
  }

  if (!bech32VerifyChecksum(hrp, data)) {
    throw new Error("Invalid bech32 checksum")
  }

  return { hrp, data: data.slice(0, -6) }
}

function convertBits(data: number[], fromBits: number, toBits: number, pad: boolean): number[] {
  let acc = 0
  let bits = 0
  const ret = []
  const maxv = (1 << toBits) - 1

  for (const value of data) {
    if (value < 0 || value >> fromBits !== 0) {
      throw new Error("Invalid data for base conversion")
    }
    acc = (acc << fromBits) | value
    bits += fromBits
    while (bits >= toBits) {
      bits -= toBits
      ret.push((acc >> bits) & maxv)
    }
  }

  if (pad) {
    if (bits > 0) {
      ret.push((acc << (toBits - bits)) & maxv)
    }
  } else if (bits >= fromBits || (acc << (toBits - bits)) & maxv) {
    throw new Error("Invalid padding in base conversion")
  }

  return ret
}

export function npubToHex(npub: string): string {
  if (!npub.startsWith("npub1")) {
    throw new Error("Invalid npub format - must start with npub1")
  }

  try {
    const { hrp, data } = bech32Decode(npub)
    if (hrp !== "npub") {
      throw new Error("Invalid npub prefix")
    }

    const converted = convertBits(data, 5, 8, false)
    return Array.from(converted, (byte) => byte.toString(16).padStart(2, "0")).join("")
  } catch (error) {
    throw new Error(`Failed to decode npub: ${error.message}`)
  }
}

// More reliable Nostr relays
const NOSTR_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://nostr.wine",
  "wss://relay.nostr.info",
]

// NostrClient class for managing connections and caching
class NostrClient {
  private profileCache: Map<string, { profile: NostrProfile; timestamp: number }> = new Map()
  private postCache: Map<string, { posts: NostrPost[]; timestamp: number }> = new Map()

  async fetchProfile(npub: string): Promise<NostrProfile | null> {
    return fetchNostrProfile(npub)
  }

  async fetchPosts(npub: string): Promise<NostrPost[]> {
    return fetchNostrPosts(npub)
  }

  async fetchPost(id: string): Promise<NostrPost | null> {
    return fetchNostrPost(id)
  }

  clearCache() {
    this.profileCache.clear()
    this.postCache.clear()
    // Clear localStorage cache as well
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith("nostr_")) {
        localStorage.removeItem(key)
      }
    })
  }
}

// Export the client instance
export const nostrClient = new NostrClient()

export async function fetchNostrPosts(npub: string): Promise<NostrPost[]> {
  console.log("🔍 Starting to fetch posts for npub:", npub)

  if (!npub || !npub.startsWith("npub1")) {
    throw new Error("Invalid npub provided - must start with npub1")
  }

  // Check cache first
  const cacheKey = `nostr_posts_${npub}`
  const cached = localStorage.getItem(cacheKey)
  const cacheTime = localStorage.getItem(`${cacheKey}_time`)

  if (cached && cacheTime) {
    const age = Date.now() - Number.parseInt(cacheTime)
    if (age < 5 * 60 * 1000) {
      // 5 minutes cache
      console.log("📦 Using cached posts")
      try {
        return JSON.parse(cached)
      } catch (error) {
        console.warn("⚠️ Failed to parse cached posts, fetching fresh data")
        localStorage.removeItem(cacheKey)
        localStorage.removeItem(`${cacheKey}_time`)
      }
    }
  }

  try {
    const hexPubkey = npubToHex(npub)
    console.log("🔑 Converted npub to hex pubkey:", hexPubkey)

    const events = await fetchEventsFromRelays(hexPubkey)
    console.log("📡 Fetched", events.length, "events from relays")

    const posts = events
      .filter((event) => (event.kind === 1 || event.kind === 30023) && event.content.trim().length > 0)
      .map(eventToPost)
      .filter(Boolean) as NostrPost[]

    // Sort by creation time (newest first)
    posts.sort((a, b) => b.created_at - a.created_at)

    console.log("✅ Processed", posts.length, "valid posts")

    // Cache the results
    try {
      localStorage.setItem(cacheKey, JSON.stringify(posts))
      localStorage.setItem(`${cacheKey}_time`, Date.now().toString())
    } catch (error) {
      console.warn("⚠️ Failed to cache posts:", error)
    }

    return posts
  } catch (error) {
    console.error("❌ Failed to fetch Nostr posts:", error)
    throw error
  }
}

export async function fetchNostrProfile(npub: string): Promise<NostrProfile | null> {
  console.log("🔍 Fetching profile for npub:", npub)

  if (!npub || !npub.startsWith("npub1")) {
    throw new Error("Invalid npub provided - must start with npub1")
  }

  // Check cache first (1 hour cache)
  const cacheKey = `nostr_profile_${npub}`
  const cached = localStorage.getItem(cacheKey)
  const cacheTime = localStorage.getItem(`${cacheKey}_time`)

  if (cached && cacheTime) {
    const age = Date.now() - Number.parseInt(cacheTime)
    if (age < 60 * 60 * 1000) {
      // 1 hour cache
      console.log("📦 Using cached profile")
      try {
        return JSON.parse(cached)
      } catch (error) {
        console.warn("⚠️ Failed to parse cached profile, fetching fresh data")
        localStorage.removeItem(cacheKey)
        localStorage.removeItem(`${cacheKey}_time`)
      }
    }
  }

  try {
    const hexPubkey = npubToHex(npub)
    console.log("🔑 Converted npub to hex pubkey:", hexPubkey)

    const events = await fetchProfileFromRelays(hexPubkey)
    console.log("📡 Fetched", events.length, "profile events from relays")

    if (events.length > 0) {
      // Get the most recent profile event
      const latestEvent = events.sort((a, b) => b.created_at - a.created_at)[0]
      const profile = JSON.parse(latestEvent.content) as NostrProfile

      console.log("✅ Processed profile:", profile.name || "Unnamed")

      // Cache the results
      try {
        localStorage.setItem(cacheKey, JSON.stringify(profile))
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString())
      } catch (error) {
        console.warn("⚠️ Failed to cache profile:", error)
      }

      return profile
    }

    return null
  } catch (error) {
    console.error("❌ Failed to fetch Nostr profile:", error)
    return null
  }
}

async function fetchEventsFromRelays(hexPubkey: string): Promise<NostrEvent[]> {
  console.log("🌐 Connecting to", NOSTR_RELAYS.length, "relays...")

  const allEvents: NostrEvent[] = []
  let successfulRelays = 0

  // Use Promise.allSettled to handle all relay connections
  const relayPromises = NOSTR_RELAYS.map(async (relay) => {
    try {
      const events = await fetchFromRelay(relay, hexPubkey)
      if (events.length > 0) {
        console.log(`✅ ${relay}: ${events.length} events`)
        successfulRelays++
        return events
      } else {
        console.log(`⚪ ${relay}: no events`)
        return []
      }
    } catch (error) {
      console.warn(`⚠️ Relay ${relay} failed silently`)
      return []
    }
  })

  const results = await Promise.allSettled(relayPromises)

  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value.length > 0) {
      allEvents.push(...result.value)
    }
  })

  // Remove duplicates based on event id
  const uniqueEvents = allEvents.filter((event, index, self) => index === self.findIndex((e) => e.id === event.id))

  console.log(`🔄 Results: ${successfulRelays}/${NOSTR_RELAYS.length} relays successful`)
  console.log(`📊 Events: ${allEvents.length} total → ${uniqueEvents.length} unique`)

  return uniqueEvents
}

async function fetchProfileFromRelays(hexPubkey: string): Promise<NostrEvent[]> {
  console.log("🌐 Connecting to", NOSTR_RELAYS.length, "relays for profile...")

  const allEvents: NostrEvent[] = []

  // Use Promise.allSettled to handle all relay connections
  const relayPromises = NOSTR_RELAYS.map(async (relay) => {
    try {
      const events = await fetchProfileFromRelay(relay, hexPubkey)
      if (events.length > 0) {
        console.log(`✅ ${relay}: ${events.length} profile events`)
        return events
      } else {
        console.log(`⚪ ${relay}: no profile events`)
        return []
      }
    } catch (error) {
      console.warn(`⚠️ Relay ${relay} failed silently`)
      return []
    }
  })

  const results = await Promise.allSettled(relayPromises)

  results.forEach((result) => {
    if (result.status === "fulfilled" && result.value.length > 0) {
      allEvents.push(...result.value)
    }
  })

  // Remove duplicates based on event id
  const uniqueEvents = allEvents.filter((event, index, self) => index === self.findIndex((e) => e.id === event.id))

  console.log(`📊 Profile Events: ${allEvents.length} total → ${uniqueEvents.length} unique`)

  return uniqueEvents
}

async function fetchFromRelay(relayUrl: string, hexPubkey: string): Promise<NostrEvent[]> {
  return new Promise((resolve) => {
    let ws: WebSocket | null = null
    const events: NostrEvent[] = []
    let timeoutId: NodeJS.Timeout
    const subscriptionId = "posts_" + Math.random().toString(36).substr(2, 9)
    let isResolved = false

    const cleanup = () => {
      if (isResolved) return
      isResolved = true

      clearTimeout(timeoutId)
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(["CLOSE", subscriptionId]))
          ws.close()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }

    const resolveWithEvents = () => {
      cleanup()
      resolve(events)
    }

    // Set timeout for the connection
    timeoutId = setTimeout(() => {
      resolveWithEvents()
    }, 8000) // 8 second timeout

    try {
      ws = new WebSocket(relayUrl)

      ws.onopen = () => {
        if (isResolved) return

        try {
          const subscription = [
            "REQ",
            subscriptionId,
            {
              authors: [hexPubkey],
              kinds: [1, 30023], // Include both notes and long-form articles
              limit: 50,
              since: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, // Last 30 days
            },
          ]

          ws?.send(JSON.stringify(subscription))
        } catch (error) {
          resolveWithEvents()
        }
      }

      ws.onmessage = (event) => {
        if (isResolved) return

        try {
          const message = JSON.parse(event.data)

          if (Array.isArray(message)) {
            if (message[0] === "EVENT" && message[2]) {
              const nostrEvent = message[2] as NostrEvent
              if (
                nostrEvent &&
                (nostrEvent.kind === 1 || nostrEvent.kind === 30023) &&
                nostrEvent.pubkey === hexPubkey
              ) {
                events.push(nostrEvent)
              }
            } else if (message[0] === "EOSE") {
              resolveWithEvents()
            }
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }

      ws.onerror = () => {
        resolveWithEvents()
      }

      ws.onclose = () => {
        resolveWithEvents()
      }
    } catch (error) {
      resolveWithEvents()
    }
  })
}

async function fetchProfileFromRelay(relayUrl: string, hexPubkey: string): Promise<NostrEvent[]> {
  return new Promise((resolve) => {
    let ws: WebSocket | null = null
    const events: NostrEvent[] = []
    let timeoutId: NodeJS.Timeout
    const subscriptionId = "profile_" + Math.random().toString(36).substr(2, 9)
    let isResolved = false

    const cleanup = () => {
      if (isResolved) return
      isResolved = true

      clearTimeout(timeoutId)
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify(["CLOSE", subscriptionId]))
          ws.close()
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }

    const resolveWithEvents = () => {
      cleanup()
      resolve(events)
    }

    // Set timeout for the connection
    timeoutId = setTimeout(() => {
      resolveWithEvents()
    }, 5000) // 5 second timeout for profiles

    try {
      ws = new WebSocket(relayUrl)

      ws.onopen = () => {
        if (isResolved) return

        try {
          const subscription = [
            "REQ",
            subscriptionId,
            {
              authors: [hexPubkey],
              kinds: [0], // Profile metadata
              limit: 1,
            },
          ]

          ws?.send(JSON.stringify(subscription))
        } catch (error) {
          resolveWithEvents()
        }
      }

      ws.onmessage = (event) => {
        if (isResolved) return

        try {
          const message = JSON.parse(event.data)

          if (Array.isArray(message)) {
            if (message[0] === "EVENT" && message[2]) {
              const nostrEvent = message[2] as NostrEvent
              if (nostrEvent && nostrEvent.kind === 0 && nostrEvent.pubkey === hexPubkey) {
                events.push(nostrEvent)
              }
            } else if (message[0] === "EOSE") {
              resolveWithEvents()
            }
          }
        } catch (error) {
          // Ignore parsing errors
        }
      }

      ws.onerror = () => {
        resolveWithEvents()
      }

      ws.onclose = () => {
        resolveWithEvents()
      }
    } catch (error) {
      resolveWithEvents()
    }
  })
}

function eventToPost(event: NostrEvent): NostrPost | null {
  if (!event || (event.kind !== 1 && event.kind !== 30023) || !event.content.trim()) {
    return null
  }

  let title: string | undefined
  let content = event.content
  let image: string | undefined
  let summary: string | undefined
  let published_at: number | undefined
  let d_tag: string | undefined

  // Handle NIP-23 long-form content (kind 30023)
  if (event.kind === 30023) {
    // Extract metadata from tags
    event.tags.forEach((tag) => {
      if (tag[0] === "title" && tag[1]) {
        title = tag[1]
      } else if (tag[0] === "image" && tag[1]) {
        image = tag[1]
      } else if (tag[0] === "summary" && tag[1]) {
        summary = tag[1]
      } else if (tag[0] === "published_at" && tag[1]) {
        published_at = Number.parseInt(tag[1])
      } else if (tag[0] === "d" && tag[1]) {
        d_tag = tag[1]
      }
    })
  } else {
    // Handle regular notes (kind 1) - extract title from content
    const lines = content.split("\n").filter((line) => line.trim())

    if (lines.length > 1 && lines[0].length < 100 && lines[0].length > 5) {
      const firstLine = lines[0].trim()
      if (!firstLine.includes(".") || firstLine.endsWith("...")) {
        title = firstLine
        content = lines.slice(1).join("\n").trim()
      }
    }

    // If no title extracted, use first 50 chars as title
    if (!title && content.length > 50) {
      title = content.substring(0, 50).trim() + "..."
    }
  }

  // Extract hashtags from content and tags
  const hashtags: string[] = []

  // From content
  const hashtagMatches = content.match(/#\w+/g)
  if (hashtagMatches) {
    hashtags.push(...hashtagMatches.map((tag) => tag.slice(1)))
  }

  // From tags array
  event.tags.forEach((tag) => {
    if (tag[0] === "t" && tag[1]) {
      hashtags.push(tag[1])
    }
  })

  return {
    id: event.id,
    content: content,
    title: title,
    created_at: event.created_at,
    tags: [...new Set(hashtags)], // Remove duplicates
    views: Math.floor(Math.random() * 100), // Mock view count for now
    comments: 0, // Start with 0 comments
    pubkey: event.pubkey,
    sig: event.sig,
    kind: event.kind,
    d_tag: d_tag,
    image: image,
    summary: summary,
    published_at: published_at,
  }
}

export async function fetchNostrPost(id: string): Promise<NostrPost | null> {
  console.log("🔍 Looking for post with ID:", id)

  // Try to find in cached posts first
  const allCachedPosts: NostrPost[] = []

  // Check all cached npubs
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith("nostr_posts_npub")) {
      try {
        const cached = localStorage.getItem(key)
        if (cached) {
          const posts = JSON.parse(cached)

          // Ensure posts is an array before spreading
          if (Array.isArray(posts)) {
            allCachedPosts.push(...posts)
          } else {
            // Clear corrupted cache entry
            localStorage.removeItem(key)
          }
        }
      } catch (error) {
        // Clear corrupted cache entry
        localStorage.removeItem(key)
      }
    }
  }

  const post = allCachedPosts.find((p) => p && p.id === id)

  if (post) {
    console.log("✅ Found post:", post.title || "Untitled")
  } else {
    console.log("❌ Post not found in cache")
  }

  return post || null
}
