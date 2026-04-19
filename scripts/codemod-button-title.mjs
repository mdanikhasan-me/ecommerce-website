// For every <button ...> that has aria-label= but no title=, mirror title= to match.
import { readFile, writeFile } from 'node:fs/promises'
import { glob } from 'node:fs/promises'

const TAG_RE = /<button\b([^>]*?)>/g
const ARIA_RE = /\baria-label\s*=\s*(?:"([^"]*)"|'([^']*)'|\{([^}]*)\})/
const hasAttr = (attrs, name) => new RegExp(`(?<![\\w-])${name}\\s*=`).test(attrs)

let files = 0
let added = 0

for await (const file of glob('src/**/*.tsx')) {
  const src = await readFile(file, 'utf8')
  let touched = false
  const out = src.replace(TAG_RE, (full, attrs) => {
    const m = attrs.match(ARIA_RE)
    if (!m || hasAttr(attrs, 'title')) return full
    let titleAttr
    if (m[1] !== undefined) titleAttr = `title="${m[1]}"`
    else if (m[2] !== undefined) titleAttr = `title='${m[2]}'`
    else titleAttr = `title={${m[3]}}`
    touched = true
    added += 1
    return `<button ${titleAttr}${attrs}>`
  })
  if (touched) {
    await writeFile(file, out)
    files += 1
    console.log('patched', file)
  }
}

console.log(`done — ${added} buttons in ${files} files`)
