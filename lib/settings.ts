export interface Settings {
  npub: string
  selectedPosts: string[]
  postsPerPage: number
  showComments: boolean
  autoRefresh: boolean
  refreshInterval: number
  theme: string
  blogTitle: string
  blogDescription: string
}

const defaultSettings: Settings = {
  npub: "",
  selectedPosts: [],
  postsPerPage: 10,
  showComments: true,
  autoRefresh: true,
  refreshInterval: 30,
  theme: "system",
  blogTitle: "My Personal Blog",
  blogDescription: "Welcome to my personal blog and portfolio",
}

export function getSettings(): Settings {
  if (typeof window === "undefined") return defaultSettings

  const saved = localStorage.getItem("blog_settings")
  if (saved) {
    try {
      return { ...defaultSettings, ...JSON.parse(saved) }
    } catch (error) {
      console.error("Failed to parse settings:", error)
      return defaultSettings
    }
  }
  return defaultSettings
}

export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") return
  localStorage.setItem("blog_settings", JSON.stringify(settings))
}
