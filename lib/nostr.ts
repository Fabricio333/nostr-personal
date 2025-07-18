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

function npubToHex(npub: string): string {
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

// Reliable Nostr relays (removed brb.io and added more stable ones)
const NOSTR_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://relay.current.fyi",
  "wss://nostr.wine",
  "wss://relay.nostr.info",
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
      return JSON.parse(cached)
    }
  }

  try {
    const hexPubkey = npubToHex(npub)
    console.log("🔑 Converted npub to hex pubkey:", hexPubkey)

    const events = await fetchEventsFromRelays(hexPubkey)
    console.log("📡 Fetched", events.length, "events from relays")

    const posts = events
      .filter((event) => event.kind === 1 && event.content.trim().length > 0)
      .map(eventToPost)
      .filter(Boolean) as NostrPost[]

    // Sort by creation time (newest first)
    posts.sort((a, b) => b.created_at - a.created_at)

    console.log("✅ Processed", posts.length, "valid posts")

    // Cache the results
    localStorage.setItem(cacheKey, JSON.stringify(posts))
    localStorage.setItem(`${cacheKey}_time`, Date.now().toString())

    return posts
  } catch (error) {
    console.error("❌ Failed to fetch Nostr posts:", error)
    throw error
  }
}

async function fetchEventsFromRelays(hexPubkey: string): Promise<NostrEvent[]> {
  console.log("🌐 Connecting to", NOSTR_RELAYS.length, "relays...")

  const allEvents: NostrEvent[] = []

  // Connect to relays with proper error handling
  const relayPromises = NOSTR_RELAYS.map(async (relay) => {
    try {
      const events = await fetchFromRelay(relay, hexPubkey)
      if (events.length > 0) {
        console.log(`✅ ${relay}: ${events.length} events`)
      } else {
        console.log(`⚪ ${relay}: no events`)
      }
      return events
    } catch (error) {
      console.warn(`⚠️ Relay ${relay} failed:`, error.message)
      return []
    }
  })

  const results = await Promise.allSettled(relayPromises)
  let successfulRelays = 0

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      const events = result.value
      if (events.length > 0) {
        allEvents.push(...events)
        successfulRelays++
      }
    } else {
      console.log(`❌ ${NOSTR_RELAYS[index]}: ${result.reason}`)
    }
  })

  // Remove duplicates based on event id
  const uniqueEvents = allEvents.filter((event, index, self) => index === self.findIndex((e) => e.id === event.id))

  console.log(`🔄 Results: ${successfulRelays}/${NOSTR_RELAYS.length} relays successful`)
  console.log(`📊 Events: ${allEvents.length} total → ${uniqueEvents.length} unique`)

  return uniqueEvents
}

async function fetchFromRelay(relayUrl: string, hexPubkey: string): Promise<NostrEvent[]> {
  return new Promise((resolve, reject) => {
    console.log("🔌 Connecting to relay:", relayUrl)

    let ws: WebSocket
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
          // Send CLOSE message before closing
          ws.send(JSON.stringify(["CLOSE", subscriptionId]))
          ws.close()
        } catch (e) {
          // Ignore errors when closing
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
    }, 10000) // Reduced to 10 seconds

    try {
      ws = new WebSocket(relayUrl)
    } catch (error) {
      console.error("❌ Failed to create WebSocket for", relayUrl + ":", error.message)
      cleanup()
      resolve([])
      return
    }

    ws.onopen = () => {
      if (isResolved) return
      console.log("🟢 Connected to relay:", relayUrl)

      try {
        // Subscribe to text notes (kind 1) from the specified pubkey
        const subscription = [
          "REQ",
          subscriptionId,
          {
            authors: [hexPubkey],
            kinds: [1], // Text notes only
            limit: 50, // Reasonable limit
            since: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, // Last 30 days
          },
        ]

        console.log("📤 Sending subscription to", relayUrl)
        ws.send(JSON.stringify(subscription))
      } catch (error) {
        console.error("❌ Failed to send subscription to", relayUrl + ":", error.message)
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
            if (nostrEvent && nostrEvent.kind === 1 && nostrEvent.pubkey === hexPubkey) {
              events.push(nostrEvent)
              console.log("📝 Got event from", relayUrl + ":", nostrEvent.id.substring(0, 8) + "...")
            }
          } else if (message[0] === "EOSE") {
            console.log("🏁 End of stored events for:", relayUrl, "- got", events.length, "events")
            resolveWithEvents()
          } else if (message[0] === "NOTICE") {
            console.log("📢 Notice from", relayUrl + ":", message[1])
          } else if (message[0] === "OK") {
            console.log("✅ OK from", relayUrl + ":", message[1])
          }
        }
      } catch (error) {
        console.error("❌ Error parsing message from", relayUrl + ":", error.message)
      }
    }

    ws.onerror = (error) => {
      console.error("❌ WebSocket error for", relayUrl + ":", error.type || "Connection failed")
      resolveWithEvents()
    }

    ws.onclose = (event) => {
      console.log("🔴 Connection closed for", relayUrl, "- code:", event.code, "reason:", event.reason || "Unknown")
      resolveWithEvents()
    }
  })
}

function eventToPost(event: NostrEvent): NostrPost | null {
  if (!event || event.kind !== 1 || !event.content.trim()) {
    return null
  }

  // Extract title from content (first line if it looks like a title)
  const lines = event.content.split("\n").filter((line) => line.trim())
  let title: string | undefined
  let content = event.content

  // Try to extract title from first line if it's short and looks like a title
  if (lines.length > 1 && lines[0].length < 100 && lines[0].length > 5) {
    const firstLine = lines[0].trim()
    // Check if first line looks like a title (no periods, not too long)
    if (!firstLine.includes(".") || firstLine.endsWith("...")) {
      title = firstLine
      content = lines.slice(1).join("\n").trim()
    }
  }

  // If no title extracted, use first 50 chars as title
  if (!title && content.length > 50) {
    title = content.substring(0, 50).trim() + "..."
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
