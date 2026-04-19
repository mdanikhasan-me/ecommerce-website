// For every <input ...> that lacks id / aria-label / aria-labelledby / title,
// inject aria-label + title derived from placeholder (or a generic fallback).
import { readFile, writeFile } from 'node:fs/promises'
import { glob } from 'node:fs/promises'

const TAG_RE = /<input\b([^>]*?)(\/?)>/g
const PLACEHOLDER_RE = /\bplaceholder\s*=\s*(?:"([^"]*)"|'([^']*)')/
const hasAttr = (attrs, name) => new RegExp(`(?<![\\w-])${name}\\s*=`).test(attrs)

let changedFiles = 0
let totalAdds = 0

for await (const file of glob('src/**/*.tsx')) {
  const src = await readFile(file, 'utf8')
  let touched = false
  const out = src.replace(TAG_RE, (full, attrs, selfClose) => {
    if (
      hasAttr(attrs, 'id') ||
      hasAttr(attrs, 'aria-label') ||
      hasAttr(attrs, 'aria-labelledby') ||
      hasAttr(attrs, 'title')
    ) return full

    const m = attrs.match(PLACEHOLDER_RE)
    const text = ((m?.[1] ?? m?.[2] ?? '').trim() || 'Form input').replace(/"/g, '&quot;')
    touched = true
    totalAdds += 1
    return `<input aria-label="${text}" title="${text}"${attrs}${selfClose ? '/' : ''}>`
  })
  if (touched) {
    await writeFile(file, out)
    changedFiles += 1
    console.log('patched', file)
  }
}

console.log(`done — ${totalAdds} inputs in ${changedFiles} files`)
