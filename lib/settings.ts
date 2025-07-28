export interface Settings {
  showResume: boolean
  showEvents: boolean
  showLifestyle: boolean
  siteName: string
  siteDescription: string
  contactEmail: string
  socialLinks: {
    twitter: string
    github: string
    linkedin: string
  }
}

const SETTINGS_KEY = "personal_blog_settings"

export function getSettings(): Settings {
  if (typeof window === "undefined") {
    // Return default settings for server-side rendering
    return {
      showResume: true,
      showEvents: true,
      showLifestyle: true,
      siteName: "My Personal Blog",
      siteDescription: "A personal blog powered by Nostr",
      contactEmail: "",
      socialLinks: {
        twitter: "",
        github: "",
        linkedin: "",
      },
    }
  }

  try {
    const storedSettings = localStorage.getItem(SETTINGS_KEY)
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings)
      // Ensure all required fields exist with defaults
      return {
        showResume: parsed.showResume !== undefined ? parsed.showResume : true,
        showEvents: parsed.showEvents !== undefined ? parsed.showEvents : true,
        showLifestyle: parsed.showLifestyle !== undefined ? parsed.showLifestyle : true,
        siteName: parsed.siteName || "My Personal Blog",
        siteDescription: parsed.siteDescription || "A personal blog powered by Nostr",
        contactEmail: parsed.contactEmail || "",
        socialLinks: {
          twitter: parsed.socialLinks?.twitter || "",
          github: parsed.socialLinks?.github || "",
          linkedin: parsed.socialLinks?.linkedin || "",
        },
      }
    }
  } catch (error) {
    console.error("Failed to load settings from localStorage:", error)
  }

  // Default settings if nothing is found or an error occurs
  return {
    showResume: true,
    showEvents: true,
    showLifestyle: true,
    siteName: "My Personal Blog",
    siteDescription: "A personal blog powered by Nostr",
    contactEmail: "",
    socialLinks: {
      twitter: "",
      github: "",
      linkedin: "",
    },
  }
}

export function saveSettings(settings: Settings): void {
  if (typeof window === "undefined") {
    return // Do not save on server
  }

  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (error) {
    console.error("Failed to save settings to localStorage:", error)
  }
}
