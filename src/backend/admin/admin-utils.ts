import { promises as fs } from 'fs'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { slugify } from '@/backend/utils'
import { persistOptimizedImageUpload } from '@/backend/admin/image-processing'
import {
  classifyAdminMediaPath,
  resolveManagedMediaFilePath,
} from '@/backend/admin/media-lifecycle'
import { logSecurityEvent } from '@/backend/security/security-log'

export async function requireAdminSession() {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    throw new Error('Unauthorized')
  }

  return session
}

export function isSuperAdminRole(role: string | null | undefined) {
  return role === 'SUPER_ADMIN'
}

export async function logAdminAudit(input: {
  userId?: string | null
  action: string
  entity: string
  entityId?: string | null
  oldValues?: unknown
  newValues?: unknown
}) {
  try {
    await db.auditLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId ?? null,
        oldValues: input.oldValues as any,
        newValues: input.newValues as any,
      },
    })
  } catch (error) {
    const errorCode = typeof (error as { code?: unknown }).code === 'string'
      ? (error as { code: string }).code
      : undefined

    logSecurityEvent({
      type: 'admin_audit_log_write_failed',
      severity: 'error',
      errorCode: errorCode ?? 'audit_log_write_failed',
      metadata: {
        action: input.action,
        entity: input.entity,
        errorName: error instanceof Error ? error.name : 'UnknownError',
      },
    })
  }
}

export async function ensureUniqueSlug(rawSlug: string, excludeId?: string) {
  const baseSlug = slugify(rawSlug) || `category-${Date.now().toString(36)}`
  let candidate = baseSlug
  let suffix = 2

  while (true) {
    const where = {
      slug: candidate,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    }

    const existing = await db.category.findFirst({ where, select: { id: true } })

    if (!existing) return candidate
    candidate = `${baseSlug}-${suffix}`
    suffix += 1
  }
}

export function isManagedAdminUpload(url: string) {
  const classification = classifyAdminMediaPath(url)
  return classification.managedPrefix === '/uploads/admin/' && classification.canDeleteLocalFile
}

export function resolveManagedPublicUploadPath(url: string, managedPrefix: string) {
  return resolveManagedMediaFilePath(url, managedPrefix)
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
  const filePath = url ? resolveManagedMediaFilePath(url, '/uploads/admin/') : null
  if (!filePath) return

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
