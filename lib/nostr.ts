import { convertBits, npubToHex } from "./bech32"

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
  about?: string
  picture?: string
  nip05?: string
  banner?: string
  website?: string
  lud16?: string
}

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

export interface NostrArticle extends NostrEvent {
  title?: string
  summary?: string
  image?: string
  published_at?: number
  d?: string
}

// More reliable Nostr relays with better error handling
const NOSTR_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://nostr.wine",
  "wss://relay.nostr.info",
  "wss://relay.nostrich.de",
]

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

  if (uniqueEvents.length === 0) {
    console.log("⚠️ No events found from any relay. This could mean:")
    console.log("   - The npub hasn't posted any text notes or articles")
    console.log("   - Posts are older than 30 days")
    console.log("   - The npub is incorrect")
    console.log("   - Network connectivity issues")
  }

  return uniqueEvents
}

async function fetchFromRelay(relayUrl: string, hexPubkey: string): Promise<NostrEvent[]> {
  return new Promise((resolve) => {
    console.log("🔌 Connecting to relay:", relayUrl)

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
      console.log("⏰ Timeout for relay:", relayUrl)
      resolveWithEvents()
    }, 8000) // 8 second timeout

    try {
      ws = new WebSocket(relayUrl)

      ws.onopen = () => {
        if (isResolved) return
        console.log("🟢 Connected to relay:", relayUrl)

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
          console.error("❌ Failed to send subscription to", relayUrl)
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
                console.log("📝 Got event from", relayUrl + ":", nostrEvent.id.substring(0, 8) + "...")
              }
            } else if (message[0] === "EOSE") {
              console.log("🏁 EOSE for:", relayUrl, "- got", events.length, "events")
              resolveWithEvents()
            } else if (message[0] === "NOTICE") {
              console.log("📢 Notice from", relayUrl + ":", message[1])
            }
          }
        } catch (error) {
          console.error("❌ Error parsing message from", relayUrl)
        }
      }

      ws.onerror = () => {
        console.warn("⚠️ Connection issue with", relayUrl, "- continuing with other relays")
        resolveWithEvents()
      }

      ws.onclose = (event) => {
        if (event.code !== 1000) {
          console.log("🔴 Unexpected close for", relayUrl, "- code:", event.code)
        }
        resolveWithEvents()
      }
    } catch (error) {
      console.error("❌ Failed to create WebSocket for", relayUrl)
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
            console.log(`📦 Found ${posts.length} cached posts from ${key}`)
          } else {
            console.warn(`⚠️ Cached data for ${key} is not an array:`, typeof posts)
            // Clear corrupted cache entry
            localStorage.removeItem(key)
          }
        }
      } catch (error) {
        console.error(`❌ Error parsing cached posts from ${key}:`, error)
        // Clear corrupted cache entry
        localStorage.removeItem(key)
      }
    }
  }

  console.log(`🔍 Searching through ${allCachedPosts.length} total cached posts`)

  const post = allCachedPosts.find((p) => p && p.id === id)

  if (post) {
    console.log("✅ Found post:", post.title || "Untitled")
  } else {
    console.log("❌ Post not found in cache")
  }

  return post || null
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

async function fetchProfileFromRelay(relayUrl: string, hexPubkey: string): Promise<NostrEvent[]> {
  return new Promise((resolve) => {
    console.log("🔌 Connecting to relay for profile:", relayUrl)

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
      console.log("⏰ Timeout for profile relay:", relayUrl)
      resolveWithEvents()
    }, 5000) // 5 second timeout for profiles

    try {
      ws = new WebSocket(relayUrl)

      ws.onopen = () => {
        if (isResolved) return
        console.log("🟢 Connected to profile relay:", relayUrl)

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
          console.error("❌ Failed to send profile subscription to", relayUrl)
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
                console.log("👤 Got profile from", relayUrl + ":", nostrEvent.id.substring(0, 8) + "...")
              }
            } else if (message[0] === "EOSE") {
              console.log("🏁 Profile EOSE for:", relayUrl, "- got", events.length, "events")
              resolveWithEvents()
            }
          }
        } catch (error) {
          console.error("❌ Error parsing profile message from", relayUrl)
        }
      }

      ws.onerror = () => {
        console.warn("⚠️ Profile connection issue with", relayUrl)
        resolveWithEvents()
      }

      ws.onclose = () => {
        resolveWithEvents()
      }
    } catch (error) {
      console.error("❌ Failed to create profile WebSocket for", relayUrl)
      resolveWithEvents()
    }
  })
}

// Helper function to convert hex to npub
export function hexToNpub(hex: string): string | null {
  try {
    const data = Buffer.from(hex, "hex")
    const words = convertBits(Array.from(data), 8, 5, true)
    return bech32Encode("npub", words)
  } catch (error) {
    return null
  }
}

function bech32Encode(hrp: string, data: number[]): string {
  const combined = data.concat(createChecksum(hrp, data))
  const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l"

  let result = hrp + "1"
  for (const d of combined) {
    result += CHARSET[d]
  }
  return result
}

function createChecksum(hrp: string, data: number[]): number[] {
  const values = hrpExpand(hrp).concat(data).concat([0, 0, 0, 0, 0, 0])
  const polymod = bech32Polymod(values) ^ 1
  const checksum = []
  for (let i = 0; i < 6; i++) {
    checksum.push((polymod >> (5 * (5 - i))) & 31)
  }
  return checksum
}

function hrpExpand(hrp: string): number[] {
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
