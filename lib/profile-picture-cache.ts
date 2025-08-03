import { promises as fs } from "fs"
import path from "path"
import { fetchNostrProfile } from "./nostr"

const CACHE_BASENAME = "profile-picture"
const CACHE_DIR = path.join(process.cwd(), "public")
const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

async function getExistingCache(): Promise<string | null> {
  try {
    const files = await fs.readdir(CACHE_DIR)
    const file = files.find((f) => f.startsWith(`${CACHE_BASENAME}.`))
    if (!file) return null
    const stats = await fs.stat(path.join(CACHE_DIR, file))
    if (Date.now() - stats.mtimeMs < MAX_AGE) {
      return `/${file}`
    }
  } catch {
    // Ignore missing directory or file access issues
  }
  return null
}

export async function cacheProfilePicture(npub: string): Promise<string | null> {
  const cached = await getExistingCache()
  if (cached) return cached

  try {
    // Ensure the cache directory exists so writes don't fail at runtime
    await fs.mkdir(CACHE_DIR, { recursive: true })

    const profile = await fetchNostrProfile(npub)
    const url = profile?.picture
    if (!url) return null

    const res = await fetch(url)
    if (!res.ok) return null

    const contentType = res.headers.get("content-type") || ""
    let ext = ".jpg"
    if (contentType.includes("png")) ext = ".png"
    else if (contentType.includes("webp")) ext = ".webp"
    else if (contentType.includes("jpeg")) ext = ".jpg"

    const buffer = Buffer.from(await res.arrayBuffer())

    // Remove old cached files
    try {
      const files = await fs.readdir(CACHE_DIR)
      await Promise.all(
        files
          .filter((f) => f.startsWith(`${CACHE_BASENAME}.`))
          .map((f) => fs.unlink(path.join(CACHE_DIR, f))),
      )
    } catch {
      // Ignore errors removing old files
    }

    const fileName = `${CACHE_BASENAME}${ext}`
    await fs.writeFile(path.join(CACHE_DIR, fileName), buffer)
    return `/${fileName}`
  } catch {
    return null
  }
}
