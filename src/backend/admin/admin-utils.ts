import { promises as fs } from 'fs'
import path from 'path'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { slugify } from '@/backend/utils'
import { persistOptimizedImageUpload } from '@/backend/admin/image-processing'

type SlugModel = 'category' | 'brand'

export async function requireAdminSession() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    throw new Error('Unauthorized')
  }

  return session
}

export async function logAdminAudit(input: {
  userId?: string | null
  action: string
  entity: string
  entityId?: string | null
  oldValues?: unknown
  newValues?: unknown
}) {
  await db.auditLog.create({
    data: {
      userId: input.userId ?? null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      oldValues: input.oldValues as any,
      newValues: input.newValues as any,
    },
  }).catch(() => {})
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

  return persistOptimizedImageUpload({
    dataUrl: cleaned,
    directorySegments: ['uploads', 'admin', folder],
    baseName: folder,
    publicPathPrefix: `/uploads/admin/${folder}`,
    profile: folder,
  })
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
