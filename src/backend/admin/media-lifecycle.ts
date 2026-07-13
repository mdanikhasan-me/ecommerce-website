import path from 'path'

export const PROTECTED_SOURCE_ASSET_PREFIXES = [
  '/assets/',
  '/images/',
] as const

export const MANAGED_PARENT_CATEGORY_UPLOAD_PREFIX = '/uploads/categories/' as const
export const MANAGED_SUBCATEGORY_ASSET_UPLOAD_PREFIX = '/assets/categories/subcategories/' as const

export const MANAGED_LOCAL_UPLOAD_PREFIXES = [
  MANAGED_PARENT_CATEGORY_UPLOAD_PREFIX,
  MANAGED_SUBCATEGORY_ASSET_UPLOAD_PREFIX,
  '/uploads/admin/',
  '/uploads/products/',
] as const

export const MANAGED_MEDIA_STORAGE_POLICY = {
  currentLocalUploadRoots: MANAGED_LOCAL_UPLOAD_PREFIXES,
  protectedSourceAssetRoots: PROTECTED_SOURCE_ASSET_PREFIXES,
  currentProductUploadPattern: '/uploads/products/<category>/<subcategory>/<product>/<media>-<timestamp>-<random>.<ext>',
  currentAdminBannerUploadPattern: '/uploads/admin/banners/<banner>/<media>-<timestamp>-<random>.<ext>',
  currentAdminCategoryUploadPattern: '/uploads/categories/<category>.webp',
  currentAdminSubcategoryImageUploadPattern: '/assets/categories/subcategories/<subcategory>.webp',
  recommendedProductStorageKeyPattern: 'products/<product-id>/media/<media-id>/<variant>.<ext>',
  recommendedAdminStorageKeyPattern: 'admin/<purpose>/<record-id>/media/<media-id>/<variant>.<ext>',
  categoryFolderingRecommendation: 'current-local-organization-only',
  categoryFolderingImprovesPerformance: false,
  objectStorageImplemented: false,
  deletionLedgerImplemented: false,
  recycleWindowImplemented: false,
  unreferencedCandidateSafeToDelete: false,
  physicalDeletionRequiresOwnershipMetadata: true,
  physicalDeletionRequiresLedger: true,
  physicalDeletionRequiresRecycleWindow: true,
} as const

export const MEDIA_OWNERSHIP_REQUIRED_FOR_PHYSICAL_DELETE = [
  'mediaId',
  'storageKey',
  'ownerType',
  'ownerId',
  'ownerField',
  'purpose',
  'sourceSystem',
  'storageProvider',
  'isManagedUpload',
  'isSourceAsset',
  'isHistoricalEvidence',
  'status',
  'createdAt',
  'lastReferenceAuditAt',
  'byteSize',
  'mimeType',
  'checksum',
] as const

export const MEDIA_DELETION_LEDGER_STATUSES = [
  'observed',
  'candidate',
  'refused',
  'quarantined',
  'pending_approval',
  'approved',
  'deleted',
  'delete_failed',
  'restored',
  'expired',
  'cancelled',
] as const

export const MEDIA_DELETION_HARD_REFUSAL_REASONS = [
  'source_asset_protected',
  'outside_managed_root',
  'remote_without_owned_storage_key',
  'ownership_metadata_missing',
  'reference_check_incomplete',
  'active_reference_exists',
  'historical_evidence_reference_exists',
  'tracked_upload_like_file_without_ownership',
  'audit_result_stale',
  'provider_delete_policy_missing',
  'backup_restore_policy_missing',
  'deletion_ledger_missing',
  'recycle_window_not_satisfied',
] as const

export const MEDIA_RECYCLE_WINDOW_POLICY = {
  implemented: false,
  minimumHoldDaysBeforePermanentDelete: 30,
  manualApprovalRequired: true,
  restoreMustBePossibleBeforePermanentDelete: true,
  backupRequiredBeforePermanentDelete: true,
  providerDeletePolicyRequired: true,
  cdnInvalidationRequiredAfterDelete: true,
  referencedAgainAction: 'cancel_or_restore_before_delete',
  deleteFailureAction: 'mark_delete_failed_and_preserve_ledger',
} as const

export const MEDIA_ASSET_SCHEMA_PLAN_FIELDS = [
  'id',
  'mediaId',
  'storageKey',
  'publicUrl',
  'publicUrlHash',
  'ownerType',
  'ownerId',
  'ownerField',
  'purpose',
  'sourceSystem',
  'uploadedByUserId',
  'createdAt',
  'updatedAt',
  'replacedAt',
  'lastReferenceAuditAt',
  'checksum',
  'byteSize',
  'mimeType',
  'width',
  'height',
  'storageProvider',
  'storageBucket',
  'storageRegion',
  'storageNamespace',
  'isSourceAsset',
  'isManagedUpload',
  'isHistoricalEvidence',
  'status',
  'metadata',
] as const

export const MEDIA_ASSET_STATUS_PLAN = [
  'ownership_unverified',
  'active',
  'source_asset_protected',
  'historical_preserve_only',
  'replaced',
  'recycle_pending',
  'deletion_candidate',
  'deletion_refused',
  'delete_approved',
  'deleted',
  'delete_failed',
  'restored',
] as const

export const MEDIA_DELETION_LEDGER_SCHEMA_PLAN_FIELDS = [
  'id',
  'ledgerId',
  'mediaAssetId',
  'storageKey',
  'publicUrlHash',
  'detectedBy',
  'detectionRunId',
  'referenceAuditSnapshot',
  'activeReferenceCount',
  'historicalEvidenceReferenceCount',
  'ownershipStatus',
  'candidateReason',
  'refusalReason',
  'status',
  'requestedBy',
  'approvedBy',
  'deletedBy',
  'restoredBy',
  'requestedAt',
  'quarantinedAt',
  'eligibleForDeletionAt',
  'deletedAt',
  'restoredAt',
  'providerDeleteResult',
  'sanitizedErrorCode',
  'createdAt',
  'updatedAt',
] as const

export const MEDIA_OWNERSHIP_OWNER_TYPES = [
  'user',
  'seller',
  'category',
  'brand',
  'product',
  'product_variant',
  'banner',
  'system',
  'unknown',
] as const

export const MEDIA_SOURCE_SYSTEM_PLAN = [
  'admin_upload',
  'product_editor',
  'seller_upload',
  'seed',
  'source_asset',
  'remote_import',
  'legacy_url',
  'unknown',
] as const

export const MEDIA_EXISTING_FIELD_MIGRATION_PLAN = [
  {
    field: 'User.image',
    referenceKind: 'historical-evidence',
    futureTreatment: 'reference-only-preserve',
    canBackfillOwnership: false,
    canBecomeDeletionCandidate: false,
    risk: 'User profile media can be identity evidence and must not be deleted from URL presence alone.',
  },
  {
    field: 'Seller.storeLogo',
    referenceKind: 'active-record',
    futureTreatment: 'owner-candidate-after-seller-media-policy',
    canBackfillOwnership: true,
    canBecomeDeletionCandidate: false,
    risk: 'Seller marketplace storage ownership is not approved; classify current rows as ownership-unverified.',
  },
  {
    field: 'Seller.storeBanner',
    referenceKind: 'active-record',
    futureTreatment: 'owner-candidate-after-seller-media-policy',
    canBackfillOwnership: true,
    canBecomeDeletionCandidate: false,
    risk: 'Seller banner reuse and provider ownership are ambiguous until seller uploads are designed.',
  },
  {
    field: 'Category.image',
    referenceKind: 'active-record',
    futureTreatment: 'admin-owned-candidate-or-source-protected',
    canBackfillOwnership: true,
    canBecomeDeletionCandidate: false,
    risk: 'Many category images are source assets; source paths must be protected instead of owned uploads.',
  },
  {
    field: 'Brand.logo',
    referenceKind: 'active-record',
    futureTreatment: 'admin-owned-candidate-or-source-protected',
    canBackfillOwnership: true,
    canBecomeDeletionCandidate: false,
    risk: 'Brand assets may be source-controlled, remote, or shared across products.',
  },
  {
    field: 'Brand.banner',
    referenceKind: 'active-record',
    futureTreatment: 'admin-owned-candidate-or-source-protected',
    canBackfillOwnership: true,
    canBecomeDeletionCandidate: false,
    risk: 'Brand banner ownership cannot be inferred from public URL alone.',
  },
  {
    field: 'ProductImage.url',
    referenceKind: 'active-record',
    futureTreatment: 'primary-product-owner-candidate',
    canBackfillOwnership: true,
    canBecomeDeletionCandidate: false,
    risk: 'Product gallery images are the safest ownership candidates, but deletion still requires ledger and recycle gates.',
  },
  {
    field: 'ProductVariant.image',
    referenceKind: 'active-record',
    futureTreatment: 'reference-only-until-variant-ownership-designed',
    canBackfillOwnership: false,
    canBecomeDeletionCandidate: false,
    risk: 'Variant images may reuse gallery media or be variant-specific; cleanup is deferred.',
  },
  {
    field: 'OrderItem.imageUrl',
    referenceKind: 'historical-evidence',
    futureTreatment: 'reference-only-preserve',
    canBackfillOwnership: false,
    canBecomeDeletionCandidate: false,
    risk: 'Order item images are order evidence and must remain preserve-only.',
  },
  {
    field: 'ReturnRequest.images',
    referenceKind: 'historical-evidence',
    futureTreatment: 'reference-only-preserve',
    canBackfillOwnership: false,
    canBecomeDeletionCandidate: false,
    risk: 'Return images are customer/support evidence and must remain preserve-only.',
  },
  {
    field: 'Review.images',
    referenceKind: 'historical-evidence',
    futureTreatment: 'reference-only-preserve',
    canBackfillOwnership: false,
    canBecomeDeletionCandidate: false,
    risk: 'Review images are customer-submitted evidence and moderation artifacts.',
  },
  {
    field: 'Banner.imageUrl',
    referenceKind: 'active-record',
    futureTreatment: 'admin-owned-candidate-or-source-protected',
    canBackfillOwnership: true,
    canBecomeDeletionCandidate: false,
    risk: 'Hero/banner rows can point to local assets, uploads, or legacy remote paths.',
  },
  {
    field: 'Banner.mobileImageUrl',
    referenceKind: 'active-record',
    futureTreatment: 'admin-owned-candidate-or-source-protected',
    canBackfillOwnership: true,
    canBecomeDeletionCandidate: false,
    risk: 'Mobile banner media can share desktop media and must not create duplicate ownership.',
  },
  {
    field: 'Banner.tabletImageUrl',
    referenceKind: 'active-record',
    futureTreatment: 'admin-owned-candidate-or-source-protected',
    canBackfillOwnership: true,
    canBecomeDeletionCandidate: false,
    risk: 'Tablet banner media can share desktop or mobile media and must not create duplicate ownership.',
  },
] as const

export const MEDIA_BACKFILL_PHASE_PLAN = [
  {
    phase: 0,
    name: 'current-url-fields-and-audits',
    allowed: 'Keep existing URL fields, no-DB inventory, and guarded local read-only aggregate audit.',
    forbidden: 'No schema edit, migration, mutation, provider delete, or physical cleanup expansion.',
    rollback: 'No rollback needed; no persisted media metadata exists yet.',
  },
  {
    phase: 1,
    name: 'future-schema-models-only',
    allowed: 'Add MediaAsset and MediaDeletionLedger models in a separately approved migration.',
    forbidden: 'No backfill, deletion, URL rewrite, or route behavior change in the same migration.',
    rollback: 'Rollback the schema migration before any backfill data is written.',
  },
  {
    phase: 2,
    name: 'ownership-unverified-backfill',
    allowed: 'Create metadata rows for known managed-root values as ownership_unverified.',
    forbidden: 'Do not mark backfilled rows deletion candidates.',
    rollback: 'Delete only the generated metadata rows by migration batch id; keep URL fields untouched.',
  },
  {
    phase: 3,
    name: 'source-and-historical-protection',
    allowed: 'Mark source assets as source_asset_protected and historical fields as preserve-only references.',
    forbidden: 'Do not copy historical evidence into deletion candidate queues.',
    rollback: 'Revert metadata classification batch without touching original media URLs.',
  },
  {
    phase: 4,
    name: 'new-upload-mediaasset-writes',
    allowed: 'Write MediaAsset records for newly approved admin/product uploads while retaining URL fields.',
    forbidden: 'Do not remove URL field compatibility or alter API response shapes.',
    rollback: 'Disable new writes and continue serving existing URL fields.',
  },
  {
    phase: 5,
    name: 'cleanup-ledger-and-recycle-gates',
    allowed: 'Route cleanup planning through ledger, approval, and recycle gates after tests pass.',
    forbidden: 'No physical delete without current reference audit, ledger row, approval, and recycle window.',
    rollback: 'Disable cleanup job; retain ledger rows as audit evidence.',
  },
  {
    phase: 6,
    name: 'provider-storage-keys',
    allowed: 'Store provider keys and namespace metadata after provider/backups are approved.',
    forbidden: 'Do not infer provider keys from public URLs alone.',
    rollback: 'Serve through existing public URLs until provider key mapping is repaired.',
  },
  {
    phase: 7,
    name: 'approved-deletion-job',
    allowed: 'Enable permanent delete only after owner approval, backup, restore, and smoke tests.',
    forbidden: 'No automatic delete of ownership-unverified, source, or historical media.',
    rollback: 'Stop the job, mark failures in ledger, and restore from recycle/provider backup when needed.',
  },
] as const

export const MEDIA_SCHEMA_INDEX_CONSTRAINT_PLAN = [
  'unique-mediaId',
  'unique-storageKey-when-owned',
  'index-publicUrlHash',
  'index-ownerType-ownerId-ownerField',
  'index-status',
  'index-lastReferenceAuditAt',
  'index-eligibleForDeletionAt',
  'index-storageProvider-storageBucket-storageNamespace',
  'constraint-source-assets-never-delete-states',
  'constraint-historical-evidence-preserve-only',
  'constraint-deletion-ledger-requires-mediaAssetId-or-refusalReason',
] as const

export const MEDIA_MIGRATION_ROLLBACK_PLAN = [
  'take-local-db-backup-before-schema-change',
  'apply-schema-before-backfill',
  'keep-existing-url-fields-authoritative-during-migration',
  'tag-backfill-batches-for-reversible-delete-of-metadata-only',
  'never-physically-delete-media-during-migration',
  'smoke-test-public-storefront-admin-and-image-rendering-before-and-after-backfill',
  'disable-new-mediaasset-writes-before-rolling-back-application-code',
  'restore-provider-objects-before-repointing-public-urls',
] as const

export const MEDIA_MIGRATION_LOCAL_DB_PREREQUISITES = [
  'database-url-classifies-local',
  'shadow-database-url-classifies-local',
  'app-and-shadow-databases-are-separate',
  'local-postgresql-service-reachable',
  'prisma-validate-passes',
  'prisma-generate-passes',
  'no-pending-schema-or-migration-diff',
  'recent-local-backup-or-snapshot-approved',
] as const

export const MEDIA_MIGRATION_MANUAL_APPROVAL_GATES = [
  'owner-approves-schema-migration-creation',
  'owner-approves-storage-provider-direction',
  'owner-approves-retention-and-recycle-window-days',
  'owner-approves-backup-and-restore-owner',
  'owner-approves-deletion-approval-role',
  'owner-approves-seller-media-policy',
  'owner-approves-product-variant-ownership-policy',
  'owner-classifies-existing-local-uploads',
  'owner-approves-raw-original-retention-policy',
  'owner-approves-cdn-cache-invalidation-plan',
] as const

export const MEDIA_MIGRATION_IMPLEMENTATION_CHECKLIST = [
  {
    step: 'pre-migration-approvals',
    allowed: 'Collect owner approvals and confirm provider, retention, backup, and variant policy decisions.',
    forbidden: 'Do not create migrations or mutate data before approvals are recorded.',
    requiredTests: ['documentation-review', 'no-schema-diff-check'],
    rollbackOrStop: 'Stop if any approval is missing.',
    ownerApprovalRequired: true,
  },
  {
    step: 'local-db-prerequisites',
    allowed: 'Verify local and separate app/shadow database URLs plus local PostgreSQL reachability.',
    forbidden: 'Do not connect to remote-looking databases or print connection strings.',
    requiredTests: ['db-url-safety', 'prisma-validate', 'prisma-generate'],
    rollbackOrStop: 'Stop if local readiness or guardrails fail.',
    ownerApprovalRequired: false,
  },
  {
    step: 'schema-design-review',
    allowed: 'Review pseudo-schema, indexes, constraints, nullability, and rollback notes.',
    forbidden: 'Do not edit Prisma schema in a review-only step.',
    requiredTests: ['schema-plan-contract-tests', 'route-contract-inventory'],
    rollbackOrStop: 'Stop if route/API compatibility is unclear.',
    ownerApprovalRequired: true,
  },
  {
    step: 'migration-creation',
    allowed: 'Create a schema-only migration only in a future approved migration step.',
    forbidden: 'Do not combine schema creation with backfill, cleanup, or provider deletion.',
    requiredTests: ['migration-applies-locally', 'migration-rolls-back-locally'],
    rollbackOrStop: 'Rollback schema before any backfill data is written.',
    ownerApprovalRequired: true,
  },
  {
    step: 'backfill-dry-run',
    allowed: 'Produce aggregate-only classification counts for existing media URL fields.',
    forbidden: 'Do not write MediaAsset rows, filenames, full URLs, full paths, matched records, or PII.',
    requiredTests: ['dry-run-aggregate-only', 'field-map-complete', 'historical-preserve-only'],
    rollbackOrStop: 'Stop if dry-run output requires private identifiers.',
    ownerApprovalRequired: false,
  },
  {
    step: 'ownership-unverified-backfill',
    allowed: 'Create metadata rows as ownership_unverified after approval and successful dry-run review.',
    forbidden: 'Do not mark backfilled rows as cleanup-approved or alter public URLs.',
    requiredTests: ['backfill-idempotent', 'public-urls-unchanged', 'route-contracts-unchanged'],
    rollbackOrStop: 'Remove metadata rows by backfill batch id only.',
    ownerApprovalRequired: true,
  },
  {
    step: 'new-upload-metadata-writes',
    allowed: 'Dual-write new approved uploads to MediaAsset while keeping URL fields authoritative.',
    forbidden: 'Do not remove URL fields or alter API response shapes.',
    requiredTests: ['upload-dual-write', 'mobile-api-contracts', 'rollback-disables-dual-write'],
    rollbackOrStop: 'Disable metadata writes and keep serving URL fields.',
    ownerApprovalRequired: true,
  },
  {
    step: 'ledger-and-recycle-integration',
    allowed: 'Plan cleanup decisions through ledger, approval, recycle window, backup, and fresh reference audit gates.',
    forbidden: 'Do not physically delete media without all gates and explicit future approval.',
    requiredTests: ['ledger-required', 'stale-audit-refused', 'recycle-window-required', 'restore-path-required'],
    rollbackOrStop: 'Disable cleanup job and retain ledger evidence.',
    ownerApprovalRequired: true,
  },
  {
    step: 'provider-storage-integration',
    allowed: 'Persist provider keys only after provider, backup, restore, and CDN decisions are approved.',
    forbidden: 'Do not infer provider keys from public URLs or run provider deletion.',
    requiredTests: ['provider-key-mapping', 'public-url-compatibility', 'provider-rollback'],
    rollbackOrStop: 'Serve existing public URLs until provider mapping is repaired.',
    ownerApprovalRequired: true,
  },
  {
    step: 'deletion-job-approval',
    allowed: 'Enable deletion job only in a future explicitly approved implementation after all gates pass.',
    forbidden: 'No automatic cleanup of source, historical, ownership-unverified, or stale-audit media.',
    requiredTests: ['manual-approval-required', 'delete-failure-ledgered', 'restore-before-permanent-delete'],
    rollbackOrStop: 'Stop the job and restore from recycle/provider backup when needed.',
    ownerApprovalRequired: true,
  },
] as const

export const MEDIA_MIGRATION_PHASE_GATE_PLAN = [
  'phase-a-schema-only-migration',
  'phase-b-no-op-read-compatibility-tests',
  'phase-c-backfill-dry-run-aggregate-report',
  'phase-d-ownership-unverified-backfill',
  'phase-e-source-and-historical-protection-marking',
  'phase-f-new-upload-metadata-write-path',
  'phase-g-ledger-and-recycle-gate-integration',
  'phase-h-provider-storage-integration',
  'phase-i-deletion-job-after-explicit-approval',
] as const

export const MEDIA_BACKFILL_DRY_RUN_REQUIREMENTS = [
  'read-only-by-default',
  'classifies-all-current-media-url-fields',
  'aggregate-counts-only-by-default',
  'no-filenames-full-paths-urls-or-pii-in-default-output',
  'classifies-source-assets',
  'classifies-managed-upload-roots',
  'classifies-remote-media',
  'classifies-historical-evidence',
  'classifies-active-references',
  'classifies-ownership-unverified-values',
  'classifies-product-variant-media-as-deferred',
  'classifies-seller-and-brand-fields-as-policy-blocked',
  'creates-no-mediaasset-rows-without-approval',
] as const

export const MEDIA_MIGRATION_ROLLBACK_GATES = [
  'schema-only-migration-rolls-back-before-backfill',
  'backfill-metadata-rows-removable-by-batch-id',
  'new-upload-metadata-writes-can-be-disabled',
  'ledger-rows-retained-as-audit-evidence',
  'provider-storage-keys-reversible-before-url-repointing',
  'recycle-quarantine-state-restorable',
  'deletion-job-disabled-before-any-permanent-delete',
  'no-physical-deletion-during-schema-migration-or-backfill',
] as const

export const MEDIA_MIGRATION_FUTURE_DB_TESTS = [
  'migration-applies-locally',
  'migration-rolls-back-locally',
  'no-route-response-changes',
  'public-urls-unchanged',
  'orphan-audit-remains-aggregate-only',
  'source-assets-protected',
  'historical-evidence-preserve-only',
  'product-variants-not-deletion-candidates',
  'backfill-idempotent',
  'duplicate-and-shared-url-handling',
  'provider-key-not-inferred-from-public-url',
  'cleanup-refuses-without-ledger-approval',
  'stale-audit-refuses-deletion',
  'recycle-window-required',
  'restore-path-exists',
] as const

export const MEDIA_MIGRATION_STOP_CONDITIONS = [
  'database-url-unsafe',
  'shadow-database-url-unsafe',
  'app-and-shadow-databases-not-separate',
  'local-postgresql-unreachable',
  'owner-approval-missing',
  'provider-choice-missing',
  'backup-or-restore-policy-missing',
  'route-response-drift-detected',
  'validation-failed',
  'backfill-output-would-expose-private-identifiers',
  'physical-deletion-would-be-required',
  'source-or-historical-media-might-be-touched',
] as const

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

  const managedPrefix = MANAGED_LOCAL_UPLOAD_PREFIXES.find((prefix) => normalizedPath.startsWith(prefix))
  const protectedPrefix = PROTECTED_SOURCE_ASSET_PREFIXES.find((prefix) => normalizedPath.startsWith(prefix))
  if (protectedPrefix && !managedPrefix) {
    return {
      bucket: 'protected-source-code-asset',
      canDeleteLocalFile: false,
      reason: 'Source-code assets are managed by git and must not be deleted from admin.',
      normalizedPath,
      managedPrefix: null,
    }
  }

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
