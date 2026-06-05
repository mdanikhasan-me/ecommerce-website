import path from 'path'

export const PROTECTED_SOURCE_ASSET_PREFIXES = [
  '/assets/',
  '/images/',
] as const

export const MANAGED_LOCAL_UPLOAD_PREFIXES = [
  '/uploads/admin/',
  '/uploads/products/',
] as const

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
