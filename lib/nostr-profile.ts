import { npubToHex, type NostrProfile } from "./nostr"

const NOSTR_RELAYS = [
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.snort.social",
  "wss://relay.nostr.band",
  "wss://nostr-pub.wellorder.net",
  "wss://nostr.wine",
  "wss://relay.nostr.info",
]

export async function fetchNostrProfile(pubkey: string): Promise<NostrProfile | null> {
  console.log("🔍 Fetching profile for pubkey:", pubkey)

  if (!pubkey || !pubkey.startsWith("npub1")) {
    throw new Error("Invalid pubkey provided")
  }

  // Check cache first
  const cacheKey = `nostr_profile_${pubkey}`
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
        console.warn("⚠️ Failed to parse cached profile")
        localStorage.removeItem(cacheKey)
        localStorage.removeItem(`${cacheKey}_time`)
      }
    }
  }

  try {
    const hexPubkey = npubToHex(pubkey)
    console.log("🔑 Converted pubkey to hex pubkey:", hexPubkey)

    const profile = await fetchProfileFromRelays(hexPubkey)

    if (profile) {
      console.log("✅ Found profile:", profile.name || profile.display_name || "Unknown")

      // Cache the result
      try {
        localStorage.setItem(cacheKey, JSON.stringify(profile))
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString())
      } catch (error) {
        console.warn("⚠️ Failed to cache profile:", error)
      }
    }

    return profile
  } catch (error) {
    console.error("❌ Failed to fetch Nostr profile:", error)
    return null
  }
}

async function fetchProfileFromRelays(hexPubkey: string): Promise<NostrProfile | null> {
  console.log("🌐 Fetching profile from relays...")

  const relayPromises = NOSTR_RELAYS.map(async (relay) => {
    try {
      const profile = await fetchProfileFromRelay(relay, hexPubkey)
      if (profile) {
        console.log(`✅ ${relay}: found profile`)
        return profile
      }
      return null
    } catch (error) {
      console.warn(`⚠️ Relay ${relay} failed for profile fetch`)
      return null
    }
  })

  const results = await Promise.allSettled(relayPromises)

  // Return the first successful profile
  for (const result of results) {
    if (result.status === "fulfilled" && result.value) {
      return result.value
    }
  }

  return null
}

async function fetchProfileFromRelay(relayUrl: string, hexPubkey: string): Promise<NostrProfile | null> {
  return new Promise((resolve) => {
    console.log("🔌 Fetching profile from relay:", relayUrl)

    let ws: WebSocket | null = null
    let profile: NostrProfile | null = null
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

    const resolveWithProfile = () => {
      cleanup()
      resolve(profile)
    }

    // Set timeout for the connection
    timeoutId = setTimeout(() => {
      console.log("⏰ Timeout for profile fetch from relay:", relayUrl)
      resolveWithProfile()
    }, 5000) // 5 second timeout for profile

    try {
      ws = new WebSocket(relayUrl)

      ws.onopen = () => {
        if (isResolved) return
        console.log("🟢 Connected to relay for profile:", relayUrl)

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
          resolveWithProfile()
        }
      }

      ws.onmessage = (event) => {
        if (isResolved) return

        try {
          const message = JSON.parse(event.data)

          if (Array.isArray(message)) {
            if (message[0] === "EVENT" && message[2]) {
              const nostrEvent = message[2]
              if (nostrEvent && nostrEvent.kind === 0 && nostrEvent.pubkey === hexPubkey) {
                try {
                  profile = JSON.parse(nostrEvent.content)
                  console.log("📝 Got profile from", relayUrl)
                } catch (error) {
                  console.error("❌ Failed to parse profile content")
                }
              }
            } else if (message[0] === "EOSE") {
              console.log("🏁 EOSE for profile from:", relayUrl)
              resolveWithProfile()
            }
          }
        } catch (error) {
          console.error("❌ Error parsing profile message from", relayUrl)
        }
      }

      ws.onerror = () => {
        console.warn("⚠️ Profile connection issue with", relayUrl)
        resolveWithProfile()
      }

      ws.onclose = () => {
        resolveWithProfile()
      }
    } catch (error) {
      console.error("❌ Failed to create WebSocket for profile from", relayUrl)
      resolveWithProfile()
    }
  })
}

export function getProfileDisplayName(profile: NostrProfile | null): string {
  if (!profile) return "Anonymous User"
  return profile.name || profile.nip05?.split("@")[0] || "Anonymous User"
}

export function getProfilePicture(profile: NostrProfile | null): string | null {
  return profile?.picture || null
}

export function getProfileBio(profile: NostrProfile | null): string {
  return profile?.about || "Welcome to my decentralized blog powered by Nostr!"
}

export function getProfileWebsite(profile: NostrProfile | null): string | null {
  return profile?.website || null
}

export function getProfileNip05(profile: NostrProfile | null): string | null {
  return profile?.nip05 || null
}
