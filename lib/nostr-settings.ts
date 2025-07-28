export interface NostrSettings {
  ownerNpub: string
  relays: string[]
  noteEventIds: string[]
  articleEventIds: string[]
  maxPosts: number
  enableComments: boolean
  enableViews: boolean
}

const NOSTR_SETTINGS_KEY = "nostr_blog_settings"

export function getNostrSettings(): NostrSettings {
  if (typeof window === "undefined") {
    // Return default settings for server-side rendering
    return {
      ownerNpub: "",
      relays: ["wss://relay.damus.io", "wss://relay.snort.social", "wss://nostr.wine"],
      noteEventIds: [],
      articleEventIds: [],
      maxPosts: 10,
      enableComments: true,
      enableViews: true,
    }
  }

  try {
    const storedSettings = localStorage.getItem(NOSTR_SETTINGS_KEY)
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings)
      // Ensure all required fields exist with defaults
      return {
        ownerNpub: parsed.ownerNpub || parsed.npub || "",
        relays: parsed.relays || ["wss://relay.damus.io", "wss://relay.snort.social", "wss://nostr.wine"],
        noteEventIds: parsed.noteEventIds || [],
        articleEventIds: parsed.articleEventIds || [],
        maxPosts: parsed.maxPosts || 10,
        enableComments: parsed.enableComments !== undefined ? parsed.enableComments : true,
        enableViews: parsed.enableViews !== undefined ? parsed.enableViews : true,
      }
    }
  } catch (error) {
    console.error("Failed to load Nostr settings from localStorage:", error)
  }

  // Default settings if nothing is found or an error occurs
  return {
    ownerNpub: "",
    relays: ["wss://relay.damus.io", "wss://relay.snort.social", "wss://nostr.wine"],
    noteEventIds: [],
    articleEventIds: [],
    maxPosts: 10,
    enableComments: true,
    enableViews: true,
  }
}

export function saveNostrSettings(settings: NostrSettings): void {
  if (typeof window === "undefined") {
    return // Do not save on server
  }

  try {
    localStorage.setItem(NOSTR_SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error("Failed to save Nostr settings to localStorage:", error)
  }
}
