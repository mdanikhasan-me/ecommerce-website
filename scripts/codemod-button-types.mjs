// Adds type="button" to every <button ...> opening tag that has no type= attribute.
// Skips fragments where a `type=` already appears anywhere in the tag (e.g. type="submit").
import { readFile, writeFile } from 'node:fs/promises'
import { glob } from 'node:fs/promises'

const TAG_RE = /<button\b([^>]*?)>/g

async function* walk(pattern) {
  for await (const f of glob('src/**/*.tsx')) yield f
}

let changedFiles = 0
let totalAdds = 0

for await (const file of walk()) {
  const src = await readFile(file, 'utf8')
  let touched = false
  const out = src.replace(TAG_RE, (match, attrs) => {
    if (/\btype\s*=/.test(attrs)) return match
    touched = true
    totalAdds += 1
    // Insert right after `<button` for stable formatting.
    return `<button type="button"${attrs}>`
  })
  if (touched) {
    await writeFile(file, out)
    changedFiles += 1
    console.log('patched', file)
  }
}

console.log(`done — ${totalAdds} buttons in ${changedFiles} files`)
