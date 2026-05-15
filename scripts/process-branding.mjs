import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const BRANDING = resolve('public/assets/branding')
const ICONS = resolve(BRANDING, 'icons')
const MARK = resolve(BRANDING, 'boilabin-logo-mark.png')

await mkdir(ICONS, { recursive: true })

async function writeIcon(size, output) {
  await sharp(MARK)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toFile(output)
}

await writeIcon(32, resolve(ICONS, 'favicon-32x32.png'))
await writeIcon(180, resolve(ICONS, 'apple-touch-icon.png'))
await writeIcon(512, resolve(ICONS, 'app-icon-512.png'))

console.log('Updated Boilabin icons from public/assets/branding/boilabin-logo-mark.png')
