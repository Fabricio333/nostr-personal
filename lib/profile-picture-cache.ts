import { promises as fs } from "fs"
import path from "path"
import { fetchNostrProfile } from "./nostr"

const CACHE_PATH = path.join(process.cwd(), "public", "profile-picture.jpg")
const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

export async function cacheProfilePicture(npub: string): Promise<string | null> {
  try {
    const stats = await fs.stat(CACHE_PATH)
    if (Date.now() - stats.mtimeMs < MAX_AGE) {
      return "/profile-picture.jpg"
    }
  } catch {
    // File doesn't exist or cannot be accessed
  }

  try {
    const profile = await fetchNostrProfile(npub)
    const url = profile?.picture
    if (!url) return null

    const res = await fetch(url)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    await fs.writeFile(CACHE_PATH, buffer)
    return "/profile-picture.jpg"
  } catch {
    return null
  }
}
