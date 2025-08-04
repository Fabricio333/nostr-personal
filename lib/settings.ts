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
  return site;
}

export function getOwnerNpub(): string | undefined {
  return (config as any).nostr?.ownerNpub as string | undefined
}

// Placeholder to keep API compatibility
export function saveSettings(_settings: Settings): void {
  // Settings are now stored in settings.json and cannot be changed at runtime
}
