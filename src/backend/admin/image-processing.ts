import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import sharp from 'sharp'

export type UploadProfile = {
  maxWidth: number
  maxHeight: number
  webpQuality: number
  fallbackQuality: number
  sharpenSigma: number
}

export const IMAGE_UPLOAD_LIMITS = {
  maxUploadBytes: 8 * 1024 * 1024,
  maxDecodedPixels: 24_000_000,
  maxDimension: 8_000,
} as const

export const IMAGE_UPLOAD_PROFILE_NAMES = ['products', 'banners', 'brands', 'categories'] as const
export type ImageUploadProfileName = (typeof IMAGE_UPLOAD_PROFILE_NAMES)[number]

export const IMAGE_UPLOAD_VARIANT_INTENTS = {
  thumbnail: { maxWidth: 320, maxHeight: 320, intendedUse: 'Small previews and compact admin tables' },
  card: { maxWidth: 720, maxHeight: 720, intendedUse: 'Product cards, category grids, and search results' },
  detail: { maxWidth: 1400, maxHeight: 1400, intendedUse: 'Product detail gallery and banner previews' },
  zoom: { maxWidth: 2200, maxHeight: 2200, intendedUse: 'Large inspection view when product detail needs it' },
} as const

export const IMAGE_UPLOAD_STORAGE_POLICY = {
  currentStorage: 'local-public-uploads',
  preferredFormat: 'webp',
  fallbackFormats: ['jpeg', 'png', 'gif'],
  stripsMetadataByDefault: true,
  preservesOriginalUpload: false,
  derivedVariantsImplemented: false,
  objectStorageImplemented: false,
} as const

export const IMAGE_UPLOAD_ERROR_MESSAGES = {
  safeUpload: 'Invalid image upload payload',
  uploadTooLarge: 'Image upload is too large',
  unsupportedImage: 'Unsupported image type',
  dimensionsTooLarge: 'Image dimensions are too large',
  decodedPixelsTooLarge: 'Image decoded pixel count is too large',
} as const

const DEFAULT_PROFILE: UploadProfile = {
  maxWidth: 1800,
  maxHeight: 1800,
  webpQuality: 86,
  fallbackQuality: 88,
  sharpenSigma: 0.45,
}

export const IMAGE_UPLOAD_PROFILES = {
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
} as const satisfies Record<ImageUploadProfileName, UploadProfile>

export const MAX_IMAGE_UPLOAD_BYTES = IMAGE_UPLOAD_LIMITS.maxUploadBytes
export const MAX_DECODED_IMAGE_PIXELS = IMAGE_UPLOAD_LIMITS.maxDecodedPixels
export const MAX_IMAGE_DIMENSION = IMAGE_UPLOAD_LIMITS.maxDimension

const SAFE_UPLOAD_ERROR = IMAGE_UPLOAD_ERROR_MESSAGES.safeUpload
const UPLOAD_TOO_LARGE_ERROR = IMAGE_UPLOAD_ERROR_MESSAGES.uploadTooLarge
const UNSUPPORTED_IMAGE_ERROR = IMAGE_UPLOAD_ERROR_MESSAGES.unsupportedImage
const IMAGE_DIMENSIONS_TOO_LARGE_ERROR = IMAGE_UPLOAD_ERROR_MESSAGES.dimensionsTooLarge
const IMAGE_PIXELS_TOO_LARGE_ERROR = IMAGE_UPLOAD_ERROR_MESSAGES.decodedPixelsTooLarge
const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/
const SAFE_RETHROW_UPLOAD_ERRORS = new Set<string>([
  UNSUPPORTED_IMAGE_ERROR,
  IMAGE_DIMENSIONS_TOO_LARGE_ERROR,
  IMAGE_PIXELS_TOO_LARGE_ERROR,
  SAFE_UPLOAD_ERROR,
])
const ALLOWED_IMAGE_FORMATS_BY_MIME = new Map([
  ['image/jpeg', 'jpeg'],
  ['image/jpg', 'jpeg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
])

function parseImageDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:([^;,]+);base64,([\s\S]+)$/)
  if (!match) return null

  const mimeType = match[1].trim().toLowerCase()
  if (!ALLOWED_IMAGE_FORMATS_BY_MIME.has(mimeType)) {
    throw new Error(UNSUPPORTED_IMAGE_ERROR)
  }

  const base64 = match[2].replace(/\s/g, '')
  if (!base64 || base64.length % 4 === 1 || !BASE64_PATTERN.test(base64)) {
    return null
  }

  const estimatedBytes = Math.floor((base64.length * 3) / 4)
  if (estimatedBytes > MAX_IMAGE_UPLOAD_BYTES + 2) {
    throw new Error(UPLOAD_TOO_LARGE_ERROR)
  }

  const buffer = Buffer.from(base64, 'base64')
  if (buffer.byteLength === 0) return null
  if (buffer.byteLength > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(UPLOAD_TOO_LARGE_ERROR)
  }

  return {
    mimeType,
    buffer,
  }
}

function extensionForMime(mimeType: string) {
  const format = ALLOWED_IMAGE_FORMATS_BY_MIME.get(mimeType)
  if (format === 'jpeg') return 'jpg'
  return format ?? 'png'
}

function outputFormatForExtension(extension: string): 'jpeg' | 'png' | 'webp' | 'gif' {
  if (extension === 'jpg') return 'jpeg'
  if (extension === 'webp') return 'webp'
  if (extension === 'gif') return 'gif'
  return 'png'
}

export function getImageUploadProfile(kind: string): UploadProfile {
  return IMAGE_UPLOAD_PROFILES[kind as ImageUploadProfileName] ?? DEFAULT_PROFILE
}

function buildPipeline(buffer: Buffer, profile: UploadProfile) {
  return sharp(buffer, { failOn: 'error', limitInputPixels: MAX_DECODED_IMAGE_PIXELS + 1 })
    .rotate()
    .resize(profile.maxWidth, profile.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .sharpen(profile.sharpenSigma)
}

export async function validateImageUploadPayload(dataUrl: string) {
  const parsed = parseImageDataUrl(dataUrl)
  if (!parsed) {
    throw new Error(SAFE_UPLOAD_ERROR)
  }

  const expectedFormat = ALLOWED_IMAGE_FORMATS_BY_MIME.get(parsed.mimeType)
  if (!expectedFormat) {
    throw new Error(UNSUPPORTED_IMAGE_ERROR)
  }

  try {
    const metadata = await sharp(parsed.buffer, { failOn: 'error', limitInputPixels: false }).metadata()

    const width = metadata.width ?? 0
    const height = metadata.pageHeight ?? metadata.height ?? 0
    const pages = metadata.pages ?? 1
    const pixelCount = width * height * pages

    if (!width || !height || !metadata.format) {
      throw new Error(SAFE_UPLOAD_ERROR)
    }
    if (metadata.format !== expectedFormat) {
      throw new Error(UNSUPPORTED_IMAGE_ERROR)
    }
    if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
      throw new Error(IMAGE_DIMENSIONS_TOO_LARGE_ERROR)
    }
    if (pixelCount > MAX_DECODED_IMAGE_PIXELS) {
      throw new Error(IMAGE_PIXELS_TOO_LARGE_ERROR)
    }
  } catch (error) {
    if (error instanceof Error && SAFE_RETHROW_UPLOAD_ERRORS.has(error.message)) {
      throw error
    }

    throw new Error(SAFE_UPLOAD_ERROR)
  }

  return parsed
}

export async function persistOptimizedImageUpload(input: {
  dataUrl: string
  directorySegments: string[]
  baseName: string
  publicPathPrefix: string
  profile: string
}) {
  const parsed = await validateImageUploadPayload(input.dataUrl)

  const profile = getImageUploadProfile(input.profile)
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
    try {
      const ext = extensionForMime(parsed.mimeType)
      const fallbackFilename = `${baseFileName}.${ext}`
      const fallbackPath = path.join(outputDir, fallbackFilename)

      await buildPipeline(parsed.buffer, profile)
        .toFormat(outputFormatForExtension(ext), { quality: profile.fallbackQuality })
        .toFile(fallbackPath)

      return `${input.publicPathPrefix}/${fallbackFilename}`
    } catch {
      throw new Error(SAFE_UPLOAD_ERROR)
    }
  }
}
