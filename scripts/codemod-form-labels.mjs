// Adds aria-label + title to <select> and <textarea> tags lacking
// id / aria-label / aria-labelledby / title. Derives label from placeholder
// or a generic fallback per tag type.
import { readFile, writeFile } from 'node:fs/promises'
import { glob } from 'node:fs/promises'

const SELECT_RE = /<select\b([^>]*?)>/g
const TEXTAREA_RE = /<textarea\b([^>]*?)(\/?)>/g
const PLACEHOLDER_RE = /\bplaceholder\s*=\s*(?:"([^"]*)"|'([^']*)')/
const NAME_RE = /\bname\s*=\s*(?:"([^"]*)"|'([^']*)')/
const hasAttr = (attrs, name) => new RegExp(`(?<![\\w-])${name}\\s*=`).test(attrs)

let files = 0
let added = 0

function deriveLabel(attrs, fallback) {
  const ph = attrs.match(PLACEHOLDER_RE)
  if (ph) return (ph[1] ?? ph[2] ?? '').trim() || fallback
  const nm = attrs.match(NAME_RE)
  if (nm) {
    const raw = (nm[1] ?? nm[2] ?? '').trim()
    if (raw) return raw.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }
  return fallback
}

for await (const file of glob('src/**/*.tsx')) {
  const src = await readFile(file, 'utf8')
  let touched = false

  let out = src.replace(SELECT_RE, (full, attrs) => {
    if (
      hasAttr(attrs, 'id') ||
      hasAttr(attrs, 'aria-label') ||
      hasAttr(attrs, 'aria-labelledby') ||
      hasAttr(attrs, 'title')
    ) return full
    const text = deriveLabel(attrs, 'Select option').replace(/"/g, '&quot;')
    touched = true
    added += 1
    return `<select aria-label="${text}" title="${text}"${attrs}>`
  })

  out = out.replace(TEXTAREA_RE, (full, attrs, selfClose) => {
    if (
      hasAttr(attrs, 'id') ||
      hasAttr(attrs, 'aria-label') ||
      hasAttr(attrs, 'aria-labelledby') ||
      hasAttr(attrs, 'title')
    ) return full
    const text = deriveLabel(attrs, 'Text area').replace(/"/g, '&quot;')
    touched = true
    added += 1
    return `<textarea aria-label="${text}" title="${text}"${attrs}${selfClose ? '/' : ''}>`
  })

  if (touched) {
    await writeFile(file, out)
    files += 1
    console.log('patched', file)
  }
}

console.log(`done — ${added} elements in ${files} files`)
