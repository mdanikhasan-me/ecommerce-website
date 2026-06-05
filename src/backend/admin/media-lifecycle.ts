import path from 'path'

export const PROTECTED_SOURCE_ASSET_PREFIXES = [
  '/assets/',
  '/images/',
] as const

export const MANAGED_LOCAL_UPLOAD_PREFIXES = [
  '/uploads/admin/',
  '/uploads/products/',
] as const

export const MANAGED_MEDIA_STORAGE_POLICY = {
  currentLocalUploadRoots: MANAGED_LOCAL_UPLOAD_PREFIXES,
  protectedSourceAssetRoots: PROTECTED_SOURCE_ASSET_PREFIXES,
  currentProductUploadPattern: '/uploads/products/<slug>-<timestamp>-<random>.<ext>',
  recommendedProductStorageKeyPattern: 'products/<product-id>/media/<media-id>/<variant>.<ext>',
  recommendedAdminStorageKeyPattern: 'admin/<purpose>/<record-id>/media/<media-id>/<variant>.<ext>',
  categoryFolderingRecommendation: 'metadata-only',
  categoryFolderingImprovesPerformance: false,
  objectStorageImplemented: false,
  deletionLedgerImplemented: false,
  recycleWindowImplemented: false,
} as const

export type ManagedMediaStorageNamespace = 'products' | 'admin'

export type ManagedMediaStorageKeyPlan = {
  key: string
  namespace: ManagedMediaStorageNamespace
  ownerSegment: string
  mediaSegment: string
  variantSegment: string
  extension: string
  ignoresMutableCategoryFolders: boolean
  reason: string
}

const STORAGE_SEGMENT_FALLBACK = 'media'
const STORAGE_EXTENSION_FALLBACK = 'webp'
const ALLOWED_STORAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'])

export function normalizeManagedMediaStorageSegment(
  value: string | null | undefined,
  fallback = STORAGE_SEGMENT_FALLBACK,
) {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return normalized || fallback
}

function normalizeStorageExtension(value: string | null | undefined) {
  const extension = value
    ?.trim()
    .toLowerCase()
    .replace(/^\.+/, '')
    .replace(/[^a-z0-9]/g, '')

  return extension && ALLOWED_STORAGE_EXTENSIONS.has(extension)
    ? extension
    : STORAGE_EXTENSION_FALLBACK
}

export function planManagedMediaStorageKey(input: {
  namespace: ManagedMediaStorageNamespace
  ownerId: string
  mediaId: string
  variant?: string | null
  extension?: string | null
  categorySlug?: string | null
  subcategorySlug?: string | null
}): ManagedMediaStorageKeyPlan {
  const ownerSegment = normalizeManagedMediaStorageSegment(input.ownerId, 'owner')
  const mediaSegment = normalizeManagedMediaStorageSegment(input.mediaId, 'media')
  const variantSegment = normalizeManagedMediaStorageSegment(input.variant, 'original')
  const extension = normalizeStorageExtension(input.extension)

  const prefix = input.namespace === 'products'
    ? `products/${ownerSegment}/media`
    : `admin/${ownerSegment}/media`

  return {
    key: `${prefix}/${mediaSegment}/${variantSegment}.${extension}`,
    namespace: input.namespace,
    ownerSegment,
    mediaSegment,
    variantSegment,
    extension,
    ignoresMutableCategoryFolders: Boolean(input.categorySlug || input.subcategorySlug),
    reason:
      'Stable owner/media identifiers are safer than category or subcategory folder names because category assignments can change without moving stored files.',
  }
}

export type AdminMediaPathBucket =
  | 'admin-managed-upload'
  | 'protected-source-code-asset'
  | 'remote-media'
  | 'inline-upload-payload'
  | 'unknown-local-path'
  | 'unknown'

export type AdminMediaPathClassification = {
  bucket: AdminMediaPathBucket
  canDeleteLocalFile: boolean
  reason: string
  normalizedPath: string | null
  managedPrefix: string | null
}

export type AdminMediaLocalDeletionPlan = AdminMediaPathClassification & {
  remainingReferenceCount: number
}

export function normalizeAdminMediaPath(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed || null
}

export function classifyAdminMediaPath(value: string | null | undefined): AdminMediaPathClassification {
  const normalizedPath = normalizeAdminMediaPath(value)

  if (!normalizedPath) {
    return {
      bucket: 'unknown',
      canDeleteLocalFile: false,
      reason: 'No media path was provided.',
      normalizedPath: null,
      managedPrefix: null,
    }
  }

  if (/^https?:\/\//i.test(normalizedPath)) {
    return {
      bucket: 'remote-media',
      canDeleteLocalFile: false,
      reason: 'Remote media must not be deleted by local filesystem cleanup.',
      normalizedPath,
      managedPrefix: null,
    }
  }

  if (normalizedPath.startsWith('data:image/')) {
    return {
      bucket: 'inline-upload-payload',
      canDeleteLocalFile: false,
      reason: 'Inline upload payloads are transient inputs, not stored local files.',
      normalizedPath,
      managedPrefix: null,
    }
  }

  const protectedPrefix = PROTECTED_SOURCE_ASSET_PREFIXES.find((prefix) => normalizedPath.startsWith(prefix))
  if (protectedPrefix) {
    return {
      bucket: 'protected-source-code-asset',
      canDeleteLocalFile: false,
      reason: 'Source-code assets are managed by git and must not be deleted from admin.',
      normalizedPath,
      managedPrefix: null,
    }
  }

  const managedPrefix = MANAGED_LOCAL_UPLOAD_PREFIXES.find((prefix) => normalizedPath.startsWith(prefix))
  if (!managedPrefix) {
    return {
      bucket: normalizedPath.startsWith('/') ? 'unknown-local-path' : 'unknown',
      canDeleteLocalFile: false,
      reason: 'Only known managed upload prefixes can be considered for local deletion.',
      normalizedPath,
      managedPrefix: null,
    }
  }

  const filePath = resolveManagedMediaFilePath(normalizedPath, managedPrefix)
  return {
    bucket: 'admin-managed-upload',
    canDeleteLocalFile: Boolean(filePath),
    reason: filePath
      ? 'Path is inside a known managed upload root.'
      : 'Path did not resolve inside the expected managed upload root.',
    normalizedPath,
    managedPrefix,
  }
}

export function resolveManagedMediaFilePath(
  value: string | null | undefined,
  managedPrefix: string,
  publicRoot = path.resolve(process.cwd(), 'public'),
) {
  const normalizedPath = normalizeAdminMediaPath(value)
  if (!MANAGED_LOCAL_UPLOAD_PREFIXES.includes(managedPrefix as (typeof MANAGED_LOCAL_UPLOAD_PREFIXES)[number])) {
    return null
  }
  if (!normalizedPath || !normalizedPath.startsWith(managedPrefix)) return null
  if (/[\0?#]/.test(normalizedPath)) return null

  const resolvedPublicRoot = path.resolve(publicRoot)
  const uploadRoot = path.resolve(resolvedPublicRoot, managedPrefix.replace(/^\/+|\/+$/g, ''))
  const filePath = path.resolve(resolvedPublicRoot, normalizedPath.replace(/^\/+/, ''))

  if (filePath === uploadRoot || !filePath.startsWith(`${uploadRoot}${path.sep}`)) {
    return null
  }

  return filePath
}

export function canDeleteAdminMediaLocalFile(value: string | null | undefined) {
  return classifyAdminMediaPath(value).canDeleteLocalFile
}

export function countRemainingAdminMediaReferences(
  value: string | null | undefined,
  remainingActiveReferences: Iterable<string | null | undefined>,
) {
  const normalizedPath = normalizeAdminMediaPath(value)
  if (!normalizedPath) return 0

  let count = 0
  for (const reference of remainingActiveReferences) {
    if (normalizeAdminMediaPath(reference) === normalizedPath) {
      count += 1
    }
  }

  return count
}

export function planAdminMediaLocalDeletion(
  value: string | null | undefined,
  remainingActiveReferences: Iterable<string | null | undefined> = [],
): AdminMediaLocalDeletionPlan {
  const classification = classifyAdminMediaPath(value)

  if (!classification.canDeleteLocalFile || !classification.normalizedPath) {
    return {
      ...classification,
      remainingReferenceCount: 0,
    }
  }

  const remainingReferenceCount = countRemainingAdminMediaReferences(
    classification.normalizedPath,
    remainingActiveReferences,
  )

  if (remainingReferenceCount > 0) {
    return {
      ...classification,
      canDeleteLocalFile: false,
      reason: 'Path is still referenced by remaining active media records.',
      remainingReferenceCount,
    }
  }

  return {
    ...classification,
    reason: 'Path is inside a known managed upload root and has no supplied remaining active references.',
    remainingReferenceCount,
  }
}
