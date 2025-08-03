import { promises as fs } from "fs"
import path from "path"
import sharp from "sharp"
import { fetchNostrProfile } from "./nostr"

const CACHE_BASENAME = "profile-picture"
const CACHE_DIR = path.join(process.cwd(), "public")
const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

async function getExistingCache(): Promise<string | null> {
  try {
    const filePath = path.join(CACHE_DIR, `${CACHE_BASENAME}.png`)
    const stats = await fs.stat(filePath)
    if (Date.now() - stats.mtimeMs < MAX_AGE) {
      return `/${CACHE_BASENAME}.png`
    }
  } catch {
    // Ignore missing file or access issues
  }
  return null
}

export async function cacheProfilePicture(npub: string): Promise<string | null> {
  const cached = await getExistingCache()
  if (cached) return cached

  try {
    const profile = await fetchNostrProfile(npub)
    const url = profile?.picture
    if (!url) return null

    const res = await fetch(url)
    if (!res.ok) return null

    const contentType = res.headers.get("content-type") || ""
    if (
      !contentType.includes("png") &&
      !contentType.includes("jpeg") &&
      !contentType.includes("jpg")
    ) {
      // Unsupported format like webp or gif — skip caching
      return null
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    const pngBuffer = await sharp(buffer).png().toBuffer()

    // Remove old cached file
    try {
      await fs.unlink(path.join(CACHE_DIR, `${CACHE_BASENAME}.png`))
    } catch {
      // Ignore errors removing old file
    }

    const fileName = `${CACHE_BASENAME}.png`
    await fs.writeFile(path.join(CACHE_DIR, fileName), pngBuffer)
    return `/${fileName}`
  } catch {
    return null
  }
}
