// Current Boilabin branding source:
// public/assets/branding/boilabin-logo-full.svg
//
// The supplied SVG is the canonical logo asset. The website variants are small
// SVG crop wrappers around that exact source so the mark, wordmark, compact
// lockup, and full lockup all stay visually identical to the designer file.
import sharp from 'sharp'
import { readFile } from 'node:fs/promises'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const BRANDING = resolve('public/assets/branding')
const ICONS = resolve(BRANDING, 'icons')
const SOURCE = resolve(BRANDING, 'boilabin-logo-full.svg')

await mkdir(ICONS, { recursive: true })

const svg = await readFile(SOURCE, 'utf8')
const embeddedPng = svg.match(/data:image\/png;base64,([^"']+)/)

if (!embeddedPng) {
  throw new Error('Could not find the embedded PNG inside boilabin-logo-full.svg')
}

const sourceImage = Buffer.from(embeddedPng[1], 'base64')

await sharp(sourceImage).resize(32, 32, { fit: 'contain', background: '#ffffff' }).png().toFile(resolve(ICONS, 'favicon-32x32.png'))
await sharp(sourceImage).resize(180, 180, { fit: 'contain', background: '#ffffff' }).png().toFile(resolve(ICONS, 'apple-touch-icon.png'))
await sharp(sourceImage).resize(512, 512, { fit: 'contain', background: '#ffffff' }).png().toFile(resolve(ICONS, 'app-icon-512.png'))

console.log('Updated Boilabin icons from public/assets/branding/boilabin-logo-full.svg')
