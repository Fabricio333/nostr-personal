const fs = require('fs');
const path = require('path');

const [noteId, ...rest] = process.argv.slice(2);
const content = rest.join(' ');
const today = new Date().toISOString().split('T')[0];

const output = `---\nlang: es\npublishing_date: ${today}\n---\n\n<!-- TODO: Translate the following -->\n> ${content}\n`;

fs.writeFileSync(path.join(__dirname, 'nostr-translations', `${noteId}.md`), output);
console.log(`Created file: nostr-translations/${noteId}.md`);
