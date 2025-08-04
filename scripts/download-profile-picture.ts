import { writeFile } from "fs/promises";
import path from "path";
import sharp from "sharp";
import { fetchNostrProfile } from "@/lib/nostr";
import { getOwnerNpub } from "@/lib/settings";

async function main() {
  const npub = getOwnerNpub();
  if (!npub) {
    console.warn("No owner npub configured; skipping profile image download");
    return;
  }

  try {
    const profile = await fetchNostrProfile(npub);
    const url = profile?.picture;
    if (!url) {
      console.warn("Owner profile has no picture; skipping profile image download");
      return;
    }

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Failed to download profile image: ${res.status}`);
      return;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const pngBuffer = await sharp(buffer).png().toBuffer();

    const filePath = path.join(process.cwd(), "public", "profile-picture.png");
    await writeFile(filePath, pngBuffer);
    console.log("Saved profile image to", filePath);
  } catch (err) {
    console.warn("Error downloading profile image", err);
  }
}

main();
