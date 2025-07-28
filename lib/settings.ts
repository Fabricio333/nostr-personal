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
  return (config as any).site as Settings;
}

// Placeholder to keep API compatibility
export function saveSettings(_settings: Settings): void {
  // Settings are now stored in settings.json and cannot be changed at runtime
}
