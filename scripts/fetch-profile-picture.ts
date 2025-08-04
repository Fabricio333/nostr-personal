import { promises as fs } from "fs";
import path from "path";
import sharp from "sharp";
import { fetchNostrProfile } from "../lib/nostr";
import settings from "../settings.json";
import WebSocket from "ws";

(globalThis as any).WebSocket = WebSocket as any;

async function main() {
  const npub = (settings as any).nostr?.ownerNpub as string | undefined;
  if (!npub) {
    console.error("No ownerNpub found in settings.json");
    return;
  }

  try {
    const profile = await fetchNostrProfile(npub);
    const url = profile?.picture;
    if (!url) {
      console.error("Profile has no picture");
      return;
    }

    const res = await fetch(url);
    if (!res.ok) {
      console.error("Failed to fetch profile picture");
      return;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const pngBuffer = await sharp(buffer).png().toBuffer();
    const filePath = path.join(process.cwd(), "public", "profile-picture.png");
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, pngBuffer);
    console.log(`Profile picture saved to ${filePath}`);
  } catch (err) {
    console.error("Error fetching profile picture", err);
  }
}

main();
