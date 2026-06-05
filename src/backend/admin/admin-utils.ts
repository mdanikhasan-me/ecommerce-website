import { promises as fs } from 'fs'
import { auth } from '@/backend/auth'
import { db } from '@/backend/database'
import { slugify } from '@/backend/utils'
import { persistOptimizedImageUpload } from '@/backend/admin/image-processing'
import { createPrismaAdminMediaReferenceSource, AdminMediaPrismaLikeClient } from '@/backend/admin/media-reference-adapter'
import {
  classifyAdminMediaPath,
  MANAGED_SUBCATEGORY_ASSET_UPLOAD_PREFIX,
  resolveManagedMediaFilePath,
} from '@/backend/admin/media-lifecycle'
import {
  buildManagedBannerUploadPath,
  buildManagedCategoryUploadPath,
  buildManagedSubcategoryUploadPath,
} from '@/backend/admin/media-paths'
import {
  AdminMediaReferenceExclusion,
  AdminMediaReferenceSource,
  planAdminMediaDeletionWithReferences,
} from '@/backend/admin/media-reference-guard'
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
  return (
    classification.canDeleteLocalFile &&
    (classification.managedPrefix === '/uploads/admin/' ||
      classification.managedPrefix === MANAGED_SUBCATEGORY_ASSET_UPLOAD_PREFIX)
  )
}

export function resolveManagedPublicUploadPath(url: string, managedPrefix: string) {
  return resolveManagedMediaFilePath(url, managedPrefix)
}

export type AdminUploadPurpose = 'banners' | 'categories'

export type PersistAdminUploadOptions =
  | AdminUploadPurpose
  | {
      purpose: AdminUploadPurpose
      ownerSlugOrId?: string | null
      mediaId?: string | number | null
      categoryKind?: 'category' | 'subcategory'
    }

function planAdminUploadPath(options: PersistAdminUploadOptions) {
  if (typeof options === 'string') {
    if (options === 'banners') {
      return buildManagedBannerUploadPath({ bannerSlugOrId: 'general', mediaId: options })
    }
    return buildManagedCategoryUploadPath({ categorySlug: 'general', mediaId: options })
  }

  if (options.purpose === 'banners') {
    return buildManagedBannerUploadPath({
      bannerSlugOrId: options.ownerSlugOrId,
      mediaId: options.mediaId ?? options.purpose,
    })
  }

  if (options.categoryKind === 'subcategory') {
    return buildManagedSubcategoryUploadPath({
      subcategorySlug: options.ownerSlugOrId,
    })
  }

  return buildManagedCategoryUploadPath({
    categorySlug: options.ownerSlugOrId,
    mediaId: options.mediaId ?? options.purpose,
  })
}

export async function persistAdminUpload(url: string | null | undefined, options: PersistAdminUploadOptions) {
  const cleaned = url?.trim()
  if (!cleaned) return null
  if (!cleaned.startsWith('data:image/')) {
    return cleaned
  }

  const uploadPath = planAdminUploadPath(options)
  const profile = typeof options === 'string' ? options : options.purpose

  return persistOptimizedImageUpload({
    dataUrl: cleaned,
    directorySegments: uploadPath.directorySegments,
    baseName: uploadPath.baseName,
    publicPathPrefix: uploadPath.publicPathPrefix,
    profile,
    filenameStrategy:
      typeof options !== 'string' && options.categoryKind === 'subcategory' ? 'stable' : 'unique',
  })
}

export type AdminMediaCleanupOptions = {
  referenceSource?: AdminMediaReferenceSource
  exclude?: readonly AdminMediaReferenceExclusion[]
  publicRoot?: string
}

function getAdminMediaReferenceSource(options: AdminMediaCleanupOptions) {
  return options.referenceSource ?? createPrismaAdminMediaReferenceSource(db as unknown as AdminMediaPrismaLikeClient)
}

function logAdminUploadCleanupSkipped(input: {
  errorCode: string
  reason?: string
  feature?: string
}) {
  logSecurityEvent({
    type: 'admin_upload_cleanup_failed',
    severity: 'warn',
    errorCode: input.errorCode,
    metadata: {
      feature: input.feature ?? 'admin_media',
      reason: input.reason?.slice(0, 120),
    },
  })
}

async function resolveReferenceSafeAdminDeletion(
  url: string | null | undefined,
  options: AdminMediaCleanupOptions,
) {
  try {
    const classification = classifyAdminMediaPath(url)
    if (
      !classification.canDeleteLocalFile ||
      !classification.normalizedPath ||
      classification.managedPrefix !== '/uploads/admin/' &&
      classification.managedPrefix !== MANAGED_SUBCATEGORY_ASSET_UPLOAD_PREFIX
    ) {
      return null
    }

    const plan = await planAdminMediaDeletionWithReferences({
      candidateUrl: classification.normalizedPath,
      referenceSource: getAdminMediaReferenceSource(options),
      exclude: options.exclude,
    })

    if (!plan.shouldDeleteLocalFile) {
      if (plan.incomplete) {
        logAdminUploadCleanupSkipped({
          errorCode: 'admin_media_reference_check_incomplete',
          reason: plan.reason,
        })
      }
      return null
    }

    return resolveManagedMediaFilePath(classification.normalizedPath, '/uploads/admin/', options.publicRoot)
  } catch {
    logAdminUploadCleanupSkipped({
      errorCode: 'admin_media_cleanup_plan_failed',
      reason: 'Cleanup planning failed before physical deletion.',
    })
    return null
  }
}

export async function deleteManagedAdminUpload(
  url: string | null | undefined,
  options: AdminMediaCleanupOptions = {},
) {
  const filePath = await resolveReferenceSafeAdminDeletion(url, options)
  if (!filePath) return false

  try {
    await fs.rm(filePath, { force: true })
    return true
  } catch {
    logAdminUploadCleanupSkipped({
      errorCode: 'admin_media_file_delete_failed',
      reason: 'Physical cleanup failed after reference-safe planning.',
    })
    return false
  }
}

export async function cleanupManagedAdminUploads(
  urls: Array<string | null | undefined>,
  options: AdminMediaCleanupOptions = {},
) {
  return Promise.all(urls.filter(Boolean).map((url) => deleteManagedAdminUpload(url, options)))
}

export async function deleteReplacedAdminUploads(
  previousUrls: Array<string | null | undefined>,
  nextUrls: Array<string | null | undefined>,
  options: AdminMediaCleanupOptions = {},
) {
  const nextSet = new Set(nextUrls.filter(Boolean))
  const removed = previousUrls.filter((url) => url && classifyAdminMediaPath(url).canDeleteLocalFile && !nextSet.has(url))
  return cleanupManagedAdminUploads(removed, options)
}
