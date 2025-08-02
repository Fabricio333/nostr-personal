const fs = require('fs');
const path = require('path');

const [noteId, ...rest] = process.argv.slice(2);
if (!noteId || rest.length === 0) {
  console.error('Usage: node create-translation.js <noteId> "<original content>"');
  process.exit(1);
}
const content = rest.join(' ');
const today = new Date().toISOString().split('T')[0];

const output = `---\nlang: es\npublishing_date: ${today}\n---\n\n<!-- TODO: Translate the following -->\n> ${content}\n`;

const dir = path.join(__dirname, 'nostr-translations');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const filePath = path.join(dir, `${noteId}.md`);
fs.writeFileSync(filePath, output);
console.log(`Created file: nostr-translations/${noteId}.md`);
