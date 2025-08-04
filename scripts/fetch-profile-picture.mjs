import fs from 'fs/promises';
import path from 'path';
import { SimplePool, nip19 } from 'nostr-tools';
import sharp from 'sharp';
import WebSocket from 'ws';
import { fileURLToPath } from 'url';

// Fix for libraries that expect global WebSocket
globalThis.WebSocket = WebSocket;

// Find the actual directory of this script
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This assumes your repo root is one level up from `scripts/`
const root = path.resolve(__dirname, '..');

// Path to your repo's settings.json
const settingsPath = path.join(root, 'settings.json');

// List of relays to fetch the profile from
const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.nostr.band',
  'wss://nostr-pub.wellorder.net',
  'wss://nostr.wine',
  'wss://relay.nostr.info',
];

async function main() {
  try {
    const settingsRaw = await fs.readFile(settingsPath, 'utf8');
    const settings = JSON.parse(settingsRaw);
    const npub = settings?.nostr?.ownerNpub;

    if (!npub) {
      console.warn('⚠️ No ownerNpub found in settings.json');
      return;
    }

    let pubkey = npub;
    try {
      const decoded = nip19.decode(npub);
      if (decoded.type === 'npub') pubkey = decoded.data;
    } catch {
      console.warn('⚠️ npub decode failed, assuming it’s already a hex pubkey');
    }

    const pool = new SimplePool();
    const event = await pool.get(RELAYS, { kinds: [0], authors: [pubkey] });
    await pool.close(RELAYS);

    if (!event) {
      console.warn('⚠️ No profile events found');
      return;
    }

    const profile = JSON.parse(event.content || '{}');
    const url = profile?.picture;
    if (!url) {
      console.warn('⚠️ Profile picture URL not found in metadata');
      return;
    }

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`⚠️ Failed to download profile picture (${res.status}): ${url}`);
      return;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const pngBuffer = await sharp(buffer).png().toBuffer();

    const outPath = path.join(root, 'public', 'profile-picture.png');
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, pngBuffer);

    console.log(`✅ Profile picture saved to ${outPath}`);
  } catch (err) {
    console.error('❌ Error fetching profile picture:', err);
  }
}

main();
