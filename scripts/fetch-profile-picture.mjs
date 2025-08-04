import fs from 'fs/promises';
import path from 'path';
import { SimplePool, nip19 } from 'nostr-tools';
import sharp from 'sharp';
import WebSocket from 'ws';

globalThis.WebSocket = WebSocket;

const RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.snort.social',
  'wss://relay.nostr.band',
  'wss://nostr-pub.wellorder.net',
  'wss://nostr.wine',
  'wss://relay.nostr.info'
];

async function main() {
  try {
    const root = process.cwd();
    const settingsRaw = await fs.readFile(path.join(root, 'settings.json'), 'utf8');
    const settings = JSON.parse(settingsRaw);
    const npub = settings?.nostr?.ownerNpub;
    if (!npub) {
      console.warn('No ownerNpub found in settings.json');
      return;
    }

    let pubkey = npub;
    try {
      const decoded = nip19.decode(npub);
      if (decoded.type === 'npub') {
        pubkey = decoded.data;
      }
    } catch {
      // assume npub is already hex
    }

    const pool = new SimplePool();
    const event = await pool.get(RELAYS, { kinds: [0], authors: [pubkey] });
    await pool.close(RELAYS);
    if (!event) {
      console.warn('No profile events found');
      return;
    }

    const content = event.content;
    let profile;
    try {
      profile = JSON.parse(content);
    } catch {
      console.warn('Profile content is not valid JSON');
      return;
    }

    const url = profile?.picture;
    if (!url) {
      console.warn('Profile picture URL not found');
      return;
    }

    const res = await fetch(url);
    if (!res.ok) {
      console.warn('Failed to download profile picture');
      return;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const pngBuffer = await sharp(buffer).png().toBuffer();
    const outPath = path.join(root, 'public', 'profile-picture.png');
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, pngBuffer);
    console.log('Profile picture saved to', outPath);
  } catch (err) {
    console.error('Error fetching profile picture', err);
  }
}

main();
