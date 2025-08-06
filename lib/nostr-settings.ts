export interface NostrSettings {
  ownerNpub: string;
  relays: string[];
  noteEventIds: string[];
  articleEventIds: string[];
  blacklistEventIds: string[];
  maxPosts: number;
  enableComments: boolean;
  enableViews: boolean;
}

import config from "@/settings.json";

export function getNostrSettings(): NostrSettings {
  return (config as any).nostr as NostrSettings;
}

// Placeholder to keep API compatibility
export function saveNostrSettings(_settings: NostrSettings): void {
  // Settings are now stored in settings.json and cannot be changed at runtime
}
