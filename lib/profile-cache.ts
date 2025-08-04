import { promises as fs } from "fs"
import path from "path"
import sharp from "sharp"
import { fetchNostrProfile, type NostrProfile } from "./nostr"

const IMAGE_NAME = "profile-image.png"
const CACHE_DIR = path.join(process.cwd(), "public")

let cachedProfile: NostrProfile | null = null

export function getCachedProfile(): NostrProfile | null {
  return cachedProfile
}

export async function getCachedProfileImage(): Promise<string> {
  try {
    await fs.access(path.join(CACHE_DIR, IMAGE_NAME))
    return `/${IMAGE_NAME}`
  } catch {
    return "/profile-picture.png"
  }
}

export async function initProfileCache(npub: string): Promise<void> {
  try {
    cachedProfile = await fetchNostrProfile(npub)
    const url = cachedProfile?.picture
    if (!url) return

    const res = await fetch(url)
    if (!res.ok) return

    const contentType = res.headers.get("content-type") || ""
    if (
      !contentType.includes("png") &&
      !contentType.includes("jpeg") &&
      !contentType.includes("jpg")
    ) {
      return
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    const pngBuffer = await sharp(buffer).png().toBuffer()

    try {
      await fs.unlink(path.join(CACHE_DIR, IMAGE_NAME))
    } catch {
      // ignore
    }

    await fs.writeFile(path.join(CACHE_DIR, IMAGE_NAME), pngBuffer)
  } catch {
    // ignore
  }
}
