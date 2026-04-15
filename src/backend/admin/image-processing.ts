import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

type UploadProfile = {
  maxWidth: number
  maxHeight: number
  webpQuality: number
  fallbackQuality: number
  sharpenSigma: number
}

const DEFAULT_PROFILE: UploadProfile = {
  maxWidth: 1800,
  maxHeight: 1800,
  webpQuality: 86,
  fallbackQuality: 88,
  sharpenSigma: 0.45,
}

const UPLOAD_PROFILES: Record<string, UploadProfile> = {
  products: {
    maxWidth: 2200,
    maxHeight: 2200,
    webpQuality: 88,
    fallbackQuality: 90,
    sharpenSigma: 0.5,
  },
  banners: {
    maxWidth: 2800,
    maxHeight: 1800,
    webpQuality: 90,
    fallbackQuality: 92,
    sharpenSigma: 0.4,
  },
  brands: {
    maxWidth: 2200,
    maxHeight: 1600,
    webpQuality: 88,
    fallbackQuality: 90,
    sharpenSigma: 0.4,
  },
  categories: {
    maxWidth: 1800,
    maxHeight: 1800,
    webpQuality: 87,
    fallbackQuality: 89,
    sharpenSigma: 0.45,
  },
}

function parseImageDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/)
  if (!match) return null

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  }
}

function extensionForMime(mimeType: string) {
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg'
  if (mimeType.includes('webp')) return 'webp'
  if (mimeType.includes('gif')) return 'gif'
  return 'png'
}

function getUploadProfile(kind: string) {
  return UPLOAD_PROFILES[kind] ?? DEFAULT_PROFILE
}

function buildPipeline(buffer: Buffer, profile: UploadProfile) {
  return sharp(buffer)
    .rotate()
    .resize(profile.maxWidth, profile.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .sharpen(profile.sharpenSigma)
}

export async function persistOptimizedImageUpload(input: {
  dataUrl: string
  directorySegments: string[]
  baseName: string
  publicPathPrefix: string
  profile: string
}) {
  const parsed = parseImageDataUrl(input.dataUrl)
  if (!parsed) {
    throw new Error('Invalid image upload payload')
  }

  const profile = getUploadProfile(input.profile)
  const outputDir = path.join(process.cwd(), 'public', ...input.directorySegments)
  await fs.mkdir(outputDir, { recursive: true })

  const baseFileName = `${input.baseName}-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`
  const webpFilename = `${baseFileName}.webp`
  const outputPath = path.join(outputDir, webpFilename)

  try {
    await buildPipeline(parsed.buffer, profile)
      .webp({
        quality: profile.webpQuality,
        alphaQuality: profile.webpQuality,
        smartSubsample: true,
        effort: 6,
      })
      .toFile(outputPath)

    return `${input.publicPathPrefix}/${webpFilename}`
  } catch {
    const ext = extensionForMime(parsed.mimeType)
    const fallbackFilename = `${baseFileName}.${ext}`
    const fallbackPath = path.join(outputDir, fallbackFilename)

    await buildPipeline(parsed.buffer, profile)
      .toFormat(ext === 'jpg' ? 'jpeg' : ext, { quality: profile.fallbackQuality })
      .toFile(fallbackPath)

    return `${input.publicPathPrefix}/${fallbackFilename}`
  }
}
