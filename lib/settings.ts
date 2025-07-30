export interface Settings {
  showResume: boolean;
  showLifestyle: boolean;
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  socialLinks: {
    twitter: string;
    github: string;
    linkedin: string;
  };
}

import config from "@/settings.json";

export function getSettings(): Settings {
  const site = (config as any).site as Settings;
  const npub = (config as any).nostr.ownerNpub as string;
  return { ...site, siteName: npub };
}

// Placeholder to keep API compatibility
export function saveSettings(_settings: Settings): void {
  // Settings are now stored in settings.json and cannot be changed at runtime
}
