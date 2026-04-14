import { randomUUID } from 'crypto'
import { promises as fs } from 'fs'
import path from 'path'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { slugify } from '@/backend/utils'

type SlugModel = 'category' | 'brand'

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

export async function requireAdminSession() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    throw new Error('Unauthorized')
  }

  return session
}

export async function ensureUniqueSlug(model: SlugModel, rawSlug: string, excludeId?: string) {
  const baseSlug = slugify(rawSlug) || `${model}-${Date.now().toString(36)}`
  let candidate = baseSlug
  let suffix = 2

  while (true) {
    const where =
      model === 'category'
        ? {
            slug: candidate,
            ...(excludeId ? { id: { not: excludeId } } : {}),
          }
        : {
            slug: candidate,
            ...(excludeId ? { id: { not: excludeId } } : {}),
          }

    const existing =
      model === 'category'
        ? await db.category.findFirst({ where, select: { id: true } })
        : await db.brand.findFirst({ where, select: { id: true } })

    if (!existing) return candidate
    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }
}

export function isManagedAdminUpload(url: string) {
  return url.startsWith('/uploads/admin/')
}

export async function persistAdminUpload(url: string | null | undefined, folder: string) {
  const cleaned = url?.trim()
  if (!cleaned) return null
  if (!cleaned.startsWith('data:image/')) {
    return cleaned
  }

  const parsed = parseImageDataUrl(cleaned)
  if (!parsed) {
    throw new Error('Invalid image upload payload')
  }

  const outputDir = path.join(process.cwd(), 'public', 'uploads', 'admin', folder)
  await fs.mkdir(outputDir, { recursive: true })

  const filename = `${folder}-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}.${extensionForMime(parsed.mimeType)}`
  const outputPath = path.join(outputDir, filename)

  await fs.writeFile(outputPath, parsed.buffer)

  return `/uploads/admin/${folder}/${filename}`
}

export async function deleteManagedAdminUpload(url: string | null | undefined) {
  if (!url || !isManagedAdminUpload(url)) return

  const filePath = path.join(process.cwd(), 'public', url.replace(/^\//, ''))
  await fs.rm(filePath, { force: true })
}

export async function cleanupManagedAdminUploads(urls: Array<string | null | undefined>) {
  await Promise.all(urls.filter(Boolean).map((url) => deleteManagedAdminUpload(url)))
}

export async function deleteReplacedAdminUploads(
  previousUrls: Array<string | null | undefined>,
  nextUrls: Array<string | null | undefined>,
) {
  const nextSet = new Set(nextUrls.filter(Boolean))
  const removed = previousUrls.filter((url) => url && isManagedAdminUpload(url) && !nextSet.has(url))
  await cleanupManagedAdminUploads(removed)
}

export function parseOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) throw new Error('Invalid numeric value')
  return parsed
}

export function parseRequiredNumber(value: unknown, label: string) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new Error(`${label} is required`)
  }
  return parsed
}
