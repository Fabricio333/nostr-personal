const fs = require('fs');
const path = require('path');

const [noteId, ...rest] = process.argv.slice(2);
if (!noteId) {
  console.error('Usage: node create-translation.js <noteId> "original English content"');
  process.exit(1);
}
const content = rest.join(' ');
const today = new Date().toISOString().split('T')[0];

const output = `---
lang: es
publishing_date: ${today}
---

<!-- TODO: Translate the following -->
> ${content}
`;

const filePath = path.join(__dirname, 'nostr-translations', `${noteId}.md`);
fs.writeFileSync(filePath, output);
console.log(`Created file: nostr-translations/${noteId}.md`);
