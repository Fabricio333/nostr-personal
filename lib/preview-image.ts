import fs from "fs"
import path from "path"
import sharp from "sharp"
import config from "../settings.json"
import { fetchNostrProfile } from "./nostr"

const PREVIEW_PATH = path.join(process.cwd(), "public", "preview.webp")
const FALLBACK_IMAGE = "/icon.svg"

export async function ensurePreviewImage(): Promise<string> {
  try {
    await fs.promises.access(PREVIEW_PATH)
    return "/preview.webp"
  } catch {}

  try {
    const npub = (config as any).nostr?.ownerNpub
    if (!npub) return FALLBACK_IMAGE

    const profile = await fetchNostrProfile(npub)
    const picture = profile?.picture
    if (!picture) return FALLBACK_IMAGE

    const res = await fetch(picture)
    if (!res.ok) return FALLBACK_IMAGE

    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const webp = await sharp(buffer).webp({ quality: 80 }).toBuffer()
    await fs.promises.writeFile(PREVIEW_PATH, webp)

    return "/preview.webp"
  } catch (error) {
    console.error("Failed to cache preview image", error)
    return FALLBACK_IMAGE
  }
}

export const PREVIEW_IMAGE_PATH = "/preview.webp"
