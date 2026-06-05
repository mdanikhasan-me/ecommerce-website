import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import {
  MANAGED_MEDIA_STORAGE_POLICY,
  MEDIA_DELETION_HARD_REFUSAL_REASONS,
  MEDIA_DELETION_LEDGER_STATUSES,
  MEDIA_OWNERSHIP_REQUIRED_FOR_PHYSICAL_DELETE,
  MEDIA_RECYCLE_WINDOW_POLICY,
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
})
