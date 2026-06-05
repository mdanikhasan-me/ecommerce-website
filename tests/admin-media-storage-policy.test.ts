import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import {
  MANAGED_MEDIA_STORAGE_POLICY,
  MEDIA_ASSET_SCHEMA_PLAN_FIELDS,
  MEDIA_ASSET_STATUS_PLAN,
  MEDIA_BACKFILL_DRY_RUN_REQUIREMENTS,
  MEDIA_BACKFILL_PHASE_PLAN,
  MEDIA_DELETION_HARD_REFUSAL_REASONS,
  MEDIA_DELETION_LEDGER_STATUSES,
  MEDIA_DELETION_LEDGER_SCHEMA_PLAN_FIELDS,
  MEDIA_EXISTING_FIELD_MIGRATION_PLAN,
  MEDIA_MIGRATION_FUTURE_DB_TESTS,
  MEDIA_MIGRATION_IMPLEMENTATION_CHECKLIST,
  MEDIA_MIGRATION_LOCAL_DB_PREREQUISITES,
  MEDIA_MIGRATION_ROLLBACK_PLAN,
  MEDIA_MIGRATION_MANUAL_APPROVAL_GATES,
  MEDIA_MIGRATION_PHASE_GATE_PLAN,
  MEDIA_MIGRATION_ROLLBACK_GATES,
  MEDIA_MIGRATION_STOP_CONDITIONS,
  MEDIA_OWNERSHIP_REQUIRED_FOR_PHYSICAL_DELETE,
  MEDIA_OWNERSHIP_OWNER_TYPES,
  MEDIA_RECYCLE_WINDOW_POLICY,
  MEDIA_SCHEMA_INDEX_CONSTRAINT_PLAN,
  MEDIA_SOURCE_SYSTEM_PLAN,
  classifyAdminMediaPath,
  normalizeManagedMediaStorageSegment,
  planManagedMediaStorageKey,
} from '@/backend/admin/media-lifecycle'

describe('admin managed media storage policy', () => {
  it('documents current local upload roots without claiming provider storage is implemented', () => {
    assert.deepEqual(MANAGED_MEDIA_STORAGE_POLICY.currentLocalUploadRoots, [
      '/uploads/admin/',
      '/uploads/products/',
    ])
    assert.deepEqual(MANAGED_MEDIA_STORAGE_POLICY.protectedSourceAssetRoots, [
      '/assets/',
      '/images/',
    ])
    assert.equal(MANAGED_MEDIA_STORAGE_POLICY.categoryFolderingImprovesPerformance, false)
    assert.equal(MANAGED_MEDIA_STORAGE_POLICY.objectStorageImplemented, false)
    assert.equal(MANAGED_MEDIA_STORAGE_POLICY.deletionLedgerImplemented, false)
    assert.equal(MANAGED_MEDIA_STORAGE_POLICY.recycleWindowImplemented, false)
    assert.equal(MANAGED_MEDIA_STORAGE_POLICY.unreferencedCandidateSafeToDelete, false)
    assert.equal(MANAGED_MEDIA_STORAGE_POLICY.physicalDeletionRequiresOwnershipMetadata, true)
    assert.equal(MANAGED_MEDIA_STORAGE_POLICY.physicalDeletionRequiresLedger, true)
    assert.equal(MANAGED_MEDIA_STORAGE_POLICY.physicalDeletionRequiresRecycleWindow, true)
  })

  it('plans product storage keys from stable product/media identifiers instead of category folders', () => {
    const plan = planManagedMediaStorageKey({
      namespace: 'products',
      ownerId: 'Product 123',
      mediaId: 'Media 456',
      variant: 'Card',
      extension: 'WEBP',
      categorySlug: 'electronics',
      subcategorySlug: 'phones',
    })

    assert.equal(plan.key, 'products/product-123/media/media-456/card.webp')
    assert.equal(plan.ignoresMutableCategoryFolders, true)
    assert.equal(plan.key.includes('electronics'), false)
    assert.equal(plan.key.includes('phones'), false)
    assert.match(plan.reason, /category assignments can change/)
  })

  it('normalizes unsafe storage-key segments and falls back to safe extensions', () => {
    const plan = planManagedMediaStorageKey({
      namespace: 'admin',
      ownerId: '../Banners//Hero',
      mediaId: 'media?token=secret',
      variant: 'Desktop Hero',
      extension: '../../exe',
    })

    assert.equal(plan.key, 'admin/banners-hero/media/media-token-secret/desktop-hero.webp')
    assert.equal(normalizeManagedMediaStorageSegment('..//Category Name!!'), 'category-name')
    assert.equal(normalizeManagedMediaStorageSegment(''), 'media')
  })

  it('keeps storage-key planning separate from current local deletion classification', () => {
    const futureKey = planManagedMediaStorageKey({
      namespace: 'products',
      ownerId: 'product-1',
      mediaId: 'media-1',
      variant: 'detail',
      extension: 'jpg',
    })

    assert.equal(futureKey.key, 'products/product-1/media/media-1/detail.jpg')
    assert.equal(classifyAdminMediaPath(`/${futureKey.key}`).canDeleteLocalFile, false)
    assert.equal(classifyAdminMediaPath('/uploads/products/product.webp').canDeleteLocalFile, true)
  })

  it('documents future ownership metadata required before physical deletion can be trusted', () => {
    assert.deepEqual(
      MEDIA_OWNERSHIP_REQUIRED_FOR_PHYSICAL_DELETE,
      [
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
      ],
    )
  })

  it('keeps future deletion ledger statuses stable without enabling deletion', () => {
    assert.deepEqual(
      MEDIA_DELETION_LEDGER_STATUSES,
      [
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
      ],
    )
    assert.equal(MANAGED_MEDIA_STORAGE_POLICY.deletionLedgerImplemented, false)
  })

  it('requires recycle-window and hard-refusal policy before future physical deletion', () => {
    assert.equal(MEDIA_RECYCLE_WINDOW_POLICY.implemented, false)
    assert.equal(MEDIA_RECYCLE_WINDOW_POLICY.minimumHoldDaysBeforePermanentDelete >= 30, true)
    assert.equal(MEDIA_RECYCLE_WINDOW_POLICY.manualApprovalRequired, true)
    assert.equal(MEDIA_RECYCLE_WINDOW_POLICY.restoreMustBePossibleBeforePermanentDelete, true)
    assert.equal(MEDIA_RECYCLE_WINDOW_POLICY.backupRequiredBeforePermanentDelete, true)
    assert.equal(MEDIA_RECYCLE_WINDOW_POLICY.providerDeletePolicyRequired, true)
    assert.equal(MEDIA_RECYCLE_WINDOW_POLICY.referencedAgainAction, 'cancel_or_restore_before_delete')

    assert.deepEqual(
      MEDIA_DELETION_HARD_REFUSAL_REASONS,
      [
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
      ],
    )
  })

  it('keeps the media upload docs clear that ledger and recycle behavior are future policy only', () => {
    const docs = readFileSync('docs/MEDIA_UPLOAD_POLICY.md', 'utf8')

    assert.match(docs, /Current status: recycle-window behavior is policy only/i)
    assert.match(docs, /No quarantine, restore, or physical deletion workflow is implemented/i)
    assert.match(docs, /A future deletion ledger must exist/i)
    assert.match(docs, /An orphan audit result is not ownership proof/i)
    assert.doesNotMatch(docs, /safe to delete/i)
    assert.doesNotMatch(docs, /provider deletion is implemented/i)
    assert.doesNotMatch(docs, /recycle window is implemented/i)
  })

  it('pins the future MediaAsset schema-plan fields without editing Prisma schema', () => {
    assert.deepEqual(
      MEDIA_ASSET_SCHEMA_PLAN_FIELDS,
      [
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
      ],
    )
    assert.deepEqual(MEDIA_OWNERSHIP_OWNER_TYPES, [
      'user',
      'seller',
      'category',
      'brand',
      'product',
      'product_variant',
      'banner',
      'system',
      'unknown',
    ])
    assert.deepEqual(MEDIA_SOURCE_SYSTEM_PLAN, [
      'admin_upload',
      'product_editor',
      'seller_upload',
      'seed',
      'source_asset',
      'remote_import',
      'legacy_url',
      'unknown',
    ])
  })

  it('pins future media status and deletion-ledger schema-plan vocabulary', () => {
    assert.deepEqual(MEDIA_ASSET_STATUS_PLAN, [
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
    ])
    assert.deepEqual(MEDIA_DELETION_LEDGER_SCHEMA_PLAN_FIELDS, [
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
    ])
  })

  it('maps current media URL fields to conservative future backfill treatment', () => {
    assert.deepEqual(
      MEDIA_EXISTING_FIELD_MIGRATION_PLAN.map((item) => item.field),
      [
        'User.image',
        'Seller.storeLogo',
        'Seller.storeBanner',
        'Category.image',
        'Brand.logo',
        'Brand.banner',
        'ProductImage.url',
        'ProductVariant.image',
        'OrderItem.imageUrl',
        'ReturnRequest.images',
        'Review.images',
        'Banner.imageUrl',
        'Banner.mobileImageUrl',
      ],
    )

    const productImage = MEDIA_EXISTING_FIELD_MIGRATION_PLAN.find((item) => item.field === 'ProductImage.url')
    const variantImage = MEDIA_EXISTING_FIELD_MIGRATION_PLAN.find((item) => item.field === 'ProductVariant.image')
    const historicalFields = MEDIA_EXISTING_FIELD_MIGRATION_PLAN.filter(
      (item) => item.referenceKind === 'historical-evidence',
    )

    assert.equal(productImage?.canBackfillOwnership, true)
    assert.equal(productImage?.canBecomeDeletionCandidate, false)
    assert.equal(variantImage?.futureTreatment, 'reference-only-until-variant-ownership-designed')
    assert.equal(variantImage?.canBackfillOwnership, false)
    assert.equal(historicalFields.every((item) => item.canBecomeDeletionCandidate === false), true)
    assert.equal(historicalFields.every((item) => item.futureTreatment === 'reference-only-preserve'), true)
  })

  it('keeps future backfill phases, indexes, and rollback plan migration-readiness only', () => {
    assert.deepEqual(
      MEDIA_BACKFILL_PHASE_PLAN.map((phase) => phase.name),
      [
        'current-url-fields-and-audits',
        'future-schema-models-only',
        'ownership-unverified-backfill',
        'source-and-historical-protection',
        'new-upload-mediaasset-writes',
        'cleanup-ledger-and-recycle-gates',
        'provider-storage-keys',
        'approved-deletion-job',
      ],
    )
    assert.match(MEDIA_BACKFILL_PHASE_PLAN[2]?.forbidden ?? '', /Do not mark backfilled rows deletion candidates/)
    assert.match(MEDIA_BACKFILL_PHASE_PLAN[7]?.forbidden ?? '', /No automatic delete/)
    assert.ok(MEDIA_SCHEMA_INDEX_CONSTRAINT_PLAN.includes('constraint-source-assets-never-delete-states'))
    assert.ok(MEDIA_SCHEMA_INDEX_CONSTRAINT_PLAN.includes('constraint-historical-evidence-preserve-only'))
    assert.ok(MEDIA_MIGRATION_ROLLBACK_PLAN.includes('never-physically-delete-media-during-migration'))
    assert.ok(MEDIA_MIGRATION_ROLLBACK_PLAN.includes('keep-existing-url-fields-authoritative-during-migration'))
  })

  it('pins the migration-safe implementation checklist without enabling schema work', () => {
    assert.deepEqual(
      MEDIA_MIGRATION_IMPLEMENTATION_CHECKLIST.map((item) => item.step),
      [
        'pre-migration-approvals',
        'local-db-prerequisites',
        'schema-design-review',
        'migration-creation',
        'backfill-dry-run',
        'ownership-unverified-backfill',
        'new-upload-metadata-writes',
        'ledger-and-recycle-integration',
        'provider-storage-integration',
        'deletion-job-approval',
      ],
    )
    assert.equal(
      MEDIA_MIGRATION_IMPLEMENTATION_CHECKLIST
        .filter((item) => item.step !== 'local-db-prerequisites' && item.step !== 'backfill-dry-run')
        .every((item) => item.ownerApprovalRequired),
      true,
    )
    assert.match(
      MEDIA_MIGRATION_IMPLEMENTATION_CHECKLIST.find((item) => item.step === 'migration-creation')?.forbidden ?? '',
      /Do not combine schema creation with backfill/,
    )
    assert.match(
      MEDIA_MIGRATION_IMPLEMENTATION_CHECKLIST.find((item) => item.step === 'deletion-job-approval')?.forbidden ?? '',
      /No automatic cleanup/,
    )
  })

  it('pins local prerequisites, approvals, phase gates, and stop conditions', () => {
    assert.deepEqual(MEDIA_MIGRATION_LOCAL_DB_PREREQUISITES, [
      'database-url-classifies-local',
      'shadow-database-url-classifies-local',
      'app-and-shadow-databases-are-separate',
      'local-postgresql-service-reachable',
      'prisma-validate-passes',
      'prisma-generate-passes',
      'no-pending-schema-or-migration-diff',
      'recent-local-backup-or-snapshot-approved',
    ])
    assert.ok(MEDIA_MIGRATION_MANUAL_APPROVAL_GATES.includes('owner-approves-schema-migration-creation'))
    assert.ok(MEDIA_MIGRATION_MANUAL_APPROVAL_GATES.includes('owner-classifies-existing-local-uploads'))
    assert.deepEqual(MEDIA_MIGRATION_PHASE_GATE_PLAN, [
      'phase-a-schema-only-migration',
      'phase-b-no-op-read-compatibility-tests',
      'phase-c-backfill-dry-run-aggregate-report',
      'phase-d-ownership-unverified-backfill',
      'phase-e-source-and-historical-protection-marking',
      'phase-f-new-upload-metadata-write-path',
      'phase-g-ledger-and-recycle-gate-integration',
      'phase-h-provider-storage-integration',
      'phase-i-deletion-job-after-explicit-approval',
    ])
    assert.ok(MEDIA_MIGRATION_STOP_CONDITIONS.includes('physical-deletion-would-be-required'))
    assert.ok(MEDIA_MIGRATION_STOP_CONDITIONS.includes('source-or-historical-media-might-be-touched'))
  })

  it('pins future dry-run, rollback, and DB-backed test requirements', () => {
    assert.ok(MEDIA_BACKFILL_DRY_RUN_REQUIREMENTS.includes('read-only-by-default'))
    assert.ok(MEDIA_BACKFILL_DRY_RUN_REQUIREMENTS.includes('aggregate-counts-only-by-default'))
    assert.ok(MEDIA_BACKFILL_DRY_RUN_REQUIREMENTS.includes('no-filenames-full-paths-urls-or-pii-in-default-output'))
    assert.ok(MEDIA_BACKFILL_DRY_RUN_REQUIREMENTS.includes('creates-no-mediaasset-rows-without-approval'))
    assert.ok(MEDIA_MIGRATION_ROLLBACK_GATES.includes('no-physical-deletion-during-schema-migration-or-backfill'))
    assert.ok(MEDIA_MIGRATION_ROLLBACK_GATES.includes('backfill-metadata-rows-removable-by-batch-id'))
    assert.ok(MEDIA_MIGRATION_FUTURE_DB_TESTS.includes('migration-applies-locally'))
    assert.ok(MEDIA_MIGRATION_FUTURE_DB_TESTS.includes('public-urls-unchanged'))
    assert.ok(MEDIA_MIGRATION_FUTURE_DB_TESTS.includes('cleanup-refuses-without-ledger-approval'))
    assert.ok(MEDIA_MIGRATION_FUTURE_DB_TESTS.includes('restore-path-exists'))
  })

  it('keeps Step 281 docs and Prisma schema migration-readiness only', () => {
    const docs = readFileSync('docs/MEDIA_UPLOAD_POLICY.md', 'utf8')
    const schema = readFileSync('prisma/schema.prisma', 'utf8')

    assert.match(docs, /Migration-Safe Implementation Checklist/i)
    assert.match(docs, /Phase A: schema-only migration/i)
    assert.match(docs, /Default output must be aggregate-only/i)
    assert.match(docs, /No physical deletion is allowed during schema migration or backfill/i)
    assert.doesNotMatch(docs, /safe to delete/i)
    assert.doesNotMatch(docs, /provider deletion is implemented/i)
    assert.doesNotMatch(schema, /model\s+MediaAsset\b/)
    assert.doesNotMatch(schema, /model\s+MediaDeletionLedger\b/)
  })

  it('keeps Step 281 report and evidence from claiming implementation happened', () => {
    const report = readFileSync(
      'audit-reports/281_MEDIA_ASSET_MIGRATION_SAFE_IMPLEMENTATION_CHECKLIST.md',
      'utf8',
    )
    const evidence = JSON.parse(readFileSync(
      'audit-reports/281-media-asset-migration-safe-implementation-checklist/media-migration-readiness-evidence.json',
      'utf8',
    )) as {
      prohibitedActions: Record<string, boolean>
      futureGates: Record<string, boolean>
    }

    assert.match(report, /Pseudo-Schema Design Summary/i)
    assert.match(report, /Backfill Dry-Run Design/i)
    assert.match(report, /DB-Backed Tests Required Before Migration/i)
    assert.match(report, /no Prisma schema file was edited/i)
    assert.doesNotMatch(report, /safe to delete/i)
    assert.doesNotMatch(report, /migration applied/i)
    assert.doesNotMatch(report, /provider deletion is implemented/i)

    for (const key of [
      'prismaSchemaChanged',
      'migrationCreated',
      'migrationRun',
      'databaseMutation',
      'deletionModeAdded',
      'runtimeCleanupChanged',
      'providerCleanupAdded',
      'realFilesDeleted',
      'publicAssetsTouched',
      'privateEnvRead',
    ]) {
      assert.equal(evidence.prohibitedActions[key], false, `${key} should remain false`)
    }

    assert.equal(evidence.futureGates.physicalDeletionDuringSchemaMigrationOrBackfillAllowed, false)
    assert.equal(evidence.futureGates.defaultDryRunMayPrintRawIdentifiers, false)
    assert.equal(evidence.futureGates.publicUrlIsStorageOwnershipProof, false)
  })
})
