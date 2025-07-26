export interface AppSettings {
  npub: string
  relays: string[]
  maxPosts: number
  selectedPosts: string[] // For future use, e.g., specific posts to highlight
  enableComments: boolean
  enableViews: boolean
}

const SETTINGS_KEY = "nostr_blog_settings"

export function getSettings(): AppSettings {
  if (typeof window === "undefined") {
    // Return default settings for server-side rendering
    return {
      npub: "",
      relays: ["wss://relay.damus.io", "wss://relay.snort.social", "wss://nostr.wine"],
      maxPosts: 10,
      selectedPosts: [],
      enableComments: true,
      enableViews: true,
    }
  }
  try {
    const storedSettings = localStorage.getItem(SETTINGS_KEY)
    if (storedSettings) {
      return JSON.parse(storedSettings)
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage:", error)
  }
  // Default settings if nothing is found or an error occurs
  return {
    npub: "",
    relays: ["wss://relay.damus.io", "wss://relay.snort.social", "wss://nostr.wine"],
    maxPosts: 10,
    selectedPosts: [],
    enableComments: true,
    enableViews: true,
  }
}

export function saveSettings(settings: AppSettings): void {
  if (typeof window === "undefined") {
    return // Do not save on server
  }
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error)
  }
}
