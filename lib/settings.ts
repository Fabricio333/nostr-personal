export interface Settings {
  showResume: boolean;
  showLifestyle: boolean;
  siteName: string;
  siteDescription: string;
  facebookAppId?: string;
  contactEmail: string;
  socialLinks: {
    twitter: string;
    github: string;
    linkedin: string;
  };
}

import config from "@/settings.json";
import { fetchNostrProfile } from "./nostr";

export function getSettings(): Settings {
  const site = (config as any).site as Settings;
  return site;
}

export async function getSiteName(): Promise<string> {
  const site = (config as any).site as Settings;
  const npub = (config as any).nostr?.ownerNpub as string | undefined;
  if (!npub) return site.siteName;

  try {
    const profile = await fetchNostrProfile(npub);
    const name =
      profile?.display_name ||
      profile?.name ||
      profile?.nip05?.split("@")[0];
    return name || site.siteName;
  } catch {
    return site.siteName;
  }
}

export function getOwnerNpub(): string | undefined {
  return (config as any).nostr?.ownerNpub as string | undefined
}

// Placeholder to keep API compatibility
export function saveSettings(_settings: Settings): void {
  // Settings are now stored in settings.json and cannot be changed at runtime
}
