// One-shot: strip near-white background to alpha, write branding PNGs.
// Also produces favicon sizes from the mark.
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'

const SRC = 'C:/Users/anikh/Downloads'
const OUT = resolve('public/assets/branding')
const APP = resolve('src/app')

await mkdir(OUT, { recursive: true })

async function stripBg(input, output, { removeColor = 'white', threshold = 20, resize } = {}) {
  let pipeline = sharp(input).ensureAlpha()
  if (resize) pipeline = pipeline.resize({ width: resize, withoutEnlargement: false })
  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true })
  const target = removeColor === 'white' ? [255, 255, 255] : [69, 36, 134] // purple approx
  for (let i = 0; i < data.length; i += 4) {
    const dr = Math.abs(data[i] - target[0])
    const dg = Math.abs(data[i + 1] - target[1])
    const db = Math.abs(data[i + 2] - target[2])
    const dist = Math.sqrt(dr * dr + dg * dg + db * db)
    if (dist < threshold) {
      data[i + 3] = 0
    } else if (dist < threshold * 2) {
      data[i + 3] = Math.round((dist - threshold) / threshold * 255)
    }
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 1 })
    .extend({ top: 8, bottom: 8, left: 8, right: 8, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toFile(output)
  console.log('wrote', output)
}

// Primary mark (purple B on white → transparent bg, keep purple B)
await stripBg(`${SRC}/IMG_2893.PNG`, `${OUT}/boilabin-mark.png`, { threshold: 28 })

// Light mark (light B on purple → transparent bg, keep light B) ; for dark surfaces
await stripBg(`${SRC}/IMG_2890.PNG`, `${OUT}/boilabin-mark-light.png`, { removeColor: 'purple', threshold: 55 })

// Wordmark horizontal clean
await stripBg(`${SRC}/IMG_2899.PNG`, `${OUT}/boilabin-wordmark.png`, { threshold: 22 })

// Wordmark+mark horizontal (detailed)
await stripBg(`${SRC}/IMG_2896.PNG`, `${OUT}/boilabin-wordmark-full.png`, { threshold: 24 })

// Vertical lockup
await stripBg(`${SRC}/IMG_2895.PNG`, `${OUT}/boilabin-lockup.png`, { threshold: 22 })

// Favicons from mark
await sharp(`${OUT}/boilabin-mark.png`).resize(32, 32).png().toFile(`${OUT}/favicon-32.png`)
await sharp(`${OUT}/boilabin-mark.png`).resize(180, 180).png().toFile(`${APP}/apple-icon.png`)
await sharp(`${OUT}/boilabin-mark.png`).resize(512, 512).png().toFile(`${APP}/icon.png`)

console.log('done')
