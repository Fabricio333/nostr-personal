const fs = require("fs")
const path = require("path")

const [noteId, ...rest] = process.argv.slice(2)
if (!noteId) {
  console.error("Usage: node create-translation.js <noteId> \"Original English content\"")
  process.exit(1)
}
const content = rest.join(" ")
const today = new Date().toISOString().split("T")[0]

const output = `---
lang: es
publishing_date: ${today}
---

<!-- TODO: Translate the following -->
> ${content}
`

const dir = path.resolve(__dirname, "nostr-translations")
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir)
}
fs.writeFileSync(path.join(dir, `${noteId}.md`), output)
console.log(`Created file: nostr-translations/${noteId}.md`)
