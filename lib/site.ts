import config from "@/settings.json"
import { fetchNostrProfile } from "./nostr"
import { getCachedProfile } from "./profile-cache"
import type { Settings } from "./settings"

export async function getSiteName(): Promise<string> {
  const site = (config as any).site as Settings
  const npub = (config as any).nostr?.ownerNpub as string | undefined
  if (!npub) return site.siteName

  try {
    const profile = getCachedProfile() || (await fetchNostrProfile(npub))
    const name =
      profile?.display_name ||
      profile?.name ||
      profile?.nip05?.split("@")[0]
    return name || site.siteName
  } catch {
    return site.siteName
  }
}
