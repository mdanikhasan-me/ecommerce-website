# Step 276 - End-to-End Managed Media Lifecycle Audit And Production Storage Policy

## 1. Scope And Starting State

Step 276 inspected the full managed media lifecycle for Boilabin admin uploads and long-term storage policy.

Starting commit verified:

```text
04ef1f4 fix: guard admin media deletion by shared references
```

Step 275 had already wired DB-aware reference checks into non-throwing admin/product cleanup helpers. This step did not broaden runtime physical deletion and did not edit admin route files.

Owner concern answered in this step:

- where uploaded banner/product/category/variant media goes;
- where it is referenced in the database;
- what happens on create, replace, delete, and archive;
- when the physical file is deleted;
- when files must be preserved;
- how long-term production storage should work without accumulating years of stale files.

## 2. Latest Commit Verification

Latest `git log -3 --oneline` before edits:

```text
04ef1f4 fix: guard admin media deletion by shared references
e9a6ac2 test: add admin media reference adapter planning
50ec1a6 test: add admin media shared-reference guard
```

## 3. Files Inspected

Primary files inspected:

- `audit-reports/270_PUBLIC_STOREFRONT_CONTENT_NAV_ASSET_MEDIA_AUDIT.md`
- `audit-reports/271_ADMIN_MEDIA_UPLOAD_DELETE_LIFECYCLE_AUDIT.md`
- `audit-reports/272_ADMIN_MEDIA_DELETE_HELPER_HARDENING.md`
- `audit-reports/273_ADMIN_MEDIA_SHARED_REFERENCE_GUARD.md`
- `audit-reports/274_ADMIN_MEDIA_REFERENCE_ADAPTER_INTEGRATION.md`
- `audit-reports/275_ADMIN_MEDIA_RUNTIME_REFERENCE_GUARD.md`
- `audit-reports/275-admin-media-runtime-reference-guard/runtime-cleanup-scope.json`
- `audit-reports/276_NEXT_PROMPT_DRAFT.md`
- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/media-reference-guard.ts`
- `src/backend/admin/media-reference-adapter.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `src/backend/admin/banner-editor.ts`
- `src/backend/admin/category-editor.ts`
- `src/backend/admin/image-processing.ts`
- `src/app/api/admin/banners/route.ts`
- `src/app/api/admin/banners/[id]/route.ts`
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `src/frontend/components/admin/BannerEditorForm.tsx`
- `src/frontend/components/admin/CategoryEditorForm.tsx`
- `src/frontend/components/admin/ProductEditorForm.tsx`
- `src/frontend/components/admin/AdminImageField.tsx`
- `scripts/audit-admin-media-orphans.mjs`
- `docs/MEDIA_UPLOAD_POLICY.md`
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `tests/admin-media-lifecycle.test.ts`
- `tests/admin-media-reference-guard.test.ts`
- `tests/admin-media-reference-adapter.test.ts`
- `tests/admin-media-runtime-cleanup.test.ts`
- `tests/admin-media-orphan-audit.test.ts`
- storefront media/source tests

## 4. Inspector Findings Across Banner, Category, Product, And Variant Media

Current upload destinations:

| Surface | Current input path | Current local storage | Current DB field |
| --- | --- | --- | --- |
| Banner desktop | Admin image field data URL or pasted URL | `public/uploads/admin/banners` for data URLs | `Banner.imageUrl` |
| Banner mobile | Admin image field data URL or pasted URL | `public/uploads/admin/banners` for data URLs | `Banner.mobileImageUrl` |
| Category | Admin image field data URL or pasted URL | `public/uploads/admin/categories` for data URLs | `Category.image` |
| Product images | Product form file data URLs or pasted URLs | `public/uploads/products` for data URLs | `ProductImage.url` |
| Product variants | Payload string only | Not persisted by current variant flow | `ProductVariant.image` |
| Brand media | Schema fields only in inspected code | No active admin CRUD lifecycle found | `Brand.logo`, `Brand.banner` |
| Seller media | Schema fields only in inspected code | No active admin CRUD lifecycle found | `Seller.storeLogo`, `Seller.storeBanner` |

Data URLs are optimized through `persistOptimizedImageUpload()` before storage. Non-data URLs are stored as provided and are not physically deleted from local filesystem cleanup.

## 5. Risk-Agent Decisions

The read-only lanes identified these main risks:

- tracked upload-like files under `public/uploads/**` can look like managed uploads without a future ownership model;
- managed uploads can accumulate when reference checks fail, cleanup fails, or callers ignore false cleanup results;
- product variant image cleanup is not implemented even though `ProductVariant.image` is in the reference guard;
- historical order image preservation depends on `OrderItem.imageUrl` being present;
- category archive preserves category images indefinitely;
- local `public/uploads` is not production-safe storage for Hostinger/shared hosting, serverless, or multi-instance deployment;
- object storage migration needs owned storage keys, media metadata, backups, deletion ledger, and restore window;
- orphan audit is safe but cannot prove true orphan status without DB references;
- route response tests are still mostly source-contract tests rather than full mocked route executions.

Coordinator decision:

- keep current Step 275 runtime deletion behavior;
- do not delete real media;
- do not enable variant physical cleanup yet;
- add pure storage-key planning policy and no-DB tests;
- update media policy docs;
- write a substantial decision report and next prompt.

## 6. Current Banner Upload/Delete Physical File Behavior

Banner create:

- `BannerEditorForm` sends `imageUrl` and `mobileImageUrl`.
- Data URLs are passed to `persistAdminUpload(..., 'banners')`.
- Files are written under `public/uploads/admin/banners`.
- DB fields are `Banner.imageUrl` and `Banner.mobileImageUrl`.
- If DB create fails after new files are written, cleanup is attempted for those newly persisted managed uploads.

Banner update:

- replacement data URLs are persisted first;
- DB row is updated;
- replaced `imageUrl` and `mobileImageUrl` values are cleaned after successful DB update through `deleteReplacedAdminUploads()`;
- cleanup is non-throwing and response shape remains `{ banner }`.

Banner delete:

- the `Banner` row is deleted;
- `cleanupManagedAdminUploads([existingBanner.imageUrl, existingBanner.mobileImageUrl])` runs afterward;
- the response remains `{ success: true }`.

Physical file deletion happens only when:

1. the URL is classifier-approved;
2. it is under `/uploads/admin/`;
3. the reference source completes successfully;
4. all required media reference fields are checked;
5. active reference count is zero;
6. protected historical evidence reference count is zero;
7. the resolved path stays inside the upload root.

If the image is shared by another banner/category/product/variant/brand/seller field, deletion is skipped. If deletion fails, the helper returns `false` and logs sanitized warning metadata without changing the route response.

Banner cleanup avoids deleting `/assets/*`, `/images/*`, remote URLs, data URLs, upload roots, traversal, query/hash paths, and unknown paths.

## 7. Current Product Upload/Delete Physical File Behavior

Product create:

- `ProductEditorForm` can read selected product files as data URLs.
- `normalizeProductImages()` persists data URLs with `persistOptimizedImageUpload()`.
- Current product uploads are stored under `public/uploads/products`.
- The current public URL pattern is flat:

```text
/uploads/products/<slug>-<timestamp>-<random>.<ext>
```

- DB rows are stored in `ProductImage.url`.
- If DB create fails after new product files are written, cleanup is attempted.

Product update:

- existing product images are loaded from `ProductImage.url`;
- next image values are normalized and persisted;
- inside the transaction, old `ProductVariant` and `ProductImage` rows are deleted and new rows are created;
- after successful update, removed `ProductImage.url` values are passed to `deleteRemovedProductImages()`;
- cleanup is non-throwing and route response remains `{ product }`.

Product delete:

- the route attempts `db.product.delete()`;
- if hard delete succeeds, existing `ProductImage.url` files are passed to `deleteManagedUpload()`;
- if hard delete fails, the product is archived with `isActive: false` and product files are preserved;
- archive response remains `{ success: true, deleted: false, archived: true }`.

Product images are preserved when:

- the product cannot be hard-deleted and is archived;
- a remaining active reference exists;
- historical evidence exists in order, return, review, or user media fields;
- reference checks fail or are incomplete;
- the path is not under `/uploads/products/`.

Product cleanup cannot delete `/uploads/admin/*` because product cleanup requires the `/uploads/products/` helper scope. It cannot delete `/assets/*` or `/images/*` because the classifier protects those source roots.

## 8. Current Product Variant Media Behavior

`ProductVariant.image` exists in Prisma and is included in the shared-reference field map.

Current behavior:

- `ProductVariant.image` can be accepted by `parseAdminProductPayload()` and `normalizeVariants()` if supplied in a payload.
- The current `ProductEditorForm` does not expose a variant image input.
- The current product form `buildPayload()` does not send variant `image`.
- `getAdminEditableProduct()` does not select `variants.image`, so existing variant image values are not loaded back into the admin editor.
- `normalizeVariants()` trims and stores a provided variant image string but does not persist variant `data:image/*` uploads through the product upload helper.
- product update deletes/recreates variant rows but cleanup candidates are still only derived from `ProductImage.url`.
- product delete cleanup candidates are still only existing `ProductImage.url` rows.

Result:

```text
ProductVariant.image currently blocks deletion when another cleanup candidate points at that file, but variant image values are not themselves cleaned as removed/deleted media candidates.
```

Variant physical cleanup should not be added yet because ownership is not fully proven. Before enabling it, a dedicated step must define:

- whether admin supports variant-specific uploads;
- whether variant images can reuse product gallery images;
- whether variant image values are copied from `ProductImage.url`, pasted remote URLs, or separately uploaded files;
- whether existing variants load `image` into the admin editor;
- how update/delete candidate lists include removed variant images without deleting shared product gallery images;
- route-level response-preservation tests for product update/delete.

## 9. Current Category Image Cleanup And Archive Behavior

Category create:

- `CategoryEditorForm` sends `image`;
- data URLs are persisted through `persistAdminUpload(..., 'categories')`;
- files are written under `public/uploads/admin/categories`;
- DB field is `Category.image`;
- DB create failure attempts cleanup for newly persisted images.

Category update:

- replacement data URLs are persisted;
- DB row is updated;
- old managed image is cleaned after update if it was replaced;
- cleanup is non-throwing and response remains `{ category }`.

Category delete:

- if the category has child categories or products, it is archived by setting `isActive: false`;
- archive preserves the image;
- if the category can be hard-deleted, the DB row is deleted and `deleteManagedAdminUpload(existingCategory.image)` runs afterward;
- hard-delete cleanup is reference-guarded and source-protected.

This behavior is correct for pre-launch safety. It avoids breaking product/category history, but it can accumulate category images for archived categories until a retention policy exists.

## 10. Source-Code Assets Vs Managed Uploads Decision

Protected source-code/fallback assets:

- `/assets/*`
- `/images/*`

These are committed application assets and must not be physically deleted from admin cleanup.

Managed local upload roots:

- `/uploads/admin/*`
- `/uploads/products/*`

Important nuance:

```text
An upload-like URL prefix is not enough for production ownership proof.
```

The repository currently has local/demo/recovery media under upload-like paths. Therefore, future production deletion must use an owned storage key or media metadata record. URL-prefix classification remains a local/pre-launch safety gate, not the final ownership model.

## 11. Folder Structure Recommendation

Owner proposal:

```text
/uploads/products/<main-category>/<subcategory>/<product-photo>
```

Decision:

- Folder structure helps organization and manual audits.
- Folder structure alone does not improve image performance.
- Performance comes from compression, resizing, cache/CDN headers, responsive image sizes, and not loading unused media.
- Category/subcategory paths become risky when products move categories or category slugs are renamed/repaired.
- Moving files on category changes can break old URLs, cached pages, order evidence, reviews, returns, and rollback behavior.

Recommended future production key shape:

```text
products/<product-id>/media/<media-id>/<variant>.webp
admin/<purpose-or-record-id>/media/<media-id>/<variant>.webp
```

Category, subcategory, brand, placement, and alt text should be metadata, not the durable storage identity.

If category/subcategory foldering is still desired, it must use immutable slug snapshots, explicit traversal protection, and migration rules for category changes.

Implementation performed in Step 276:

- added `MANAGED_MEDIA_STORAGE_POLICY`;
- added `planManagedMediaStorageKey()`;
- added tests proving future storage keys ignore mutable category/subcategory folders and use stable owner/media identifiers.

This helper is pure policy/planning code. It is not wired into runtime upload or deletion paths.

## 12. Long-Term Storage Bloat Analysis

Without cleanup, media bloat compounds over years:

- product image replacements leave old files;
- banner refreshes leave old campaigns;
- category redesigns leave old category images;
- failed DB writes may leave partially persisted uploads;
- failed reference checks intentionally skip physical deletion;
- historical order/review/return/user evidence must preserve some files;
- variants can become a bloat source once variant-specific media is enabled;
- object-storage/CDN/provider caches can retain copies beyond local cleanup.

The Step 275 direction reduces bloat for managed uploads by deleting only reference-safe local files. Remaining bloat sources:

- variant images are not cleanup candidates;
- DB-aware orphan audit mode is not enabled;
- failed cleanup is currently logged but not retried;
- no deletion ledger exists;
- no recycle/restore window exists;
- no provider lifecycle policy exists;
- tracked/demo upload-like files lack explicit ownership metadata.

## 13. Hostinger, Shared Hosting, Local Disk, And Serverless Implications

Local `public/uploads` is acceptable for local/pre-launch testing only.

Production risks:

- shared hosting may mix runtime uploads with deploy artifacts;
- redeploy or rollback can lose runtime-created files;
- serverless and multi-instance deployments may not share local disk;
- CDN caches can outlive deleted local files;
- backup and restore policy is unclear;
- deleting from local disk does not delete provider/object-storage copies;
- public URLs alone do not prove ownership.

Future production storage should use:

- provider object storage or bucket-like persistent media storage;
- CDN delivery;
- stable storage keys;
- media ownership metadata;
- backup and restore policy;
- deletion ledger;
- soft-delete/recycle window;
- lifecycle rules for expired orphan candidates;
- provider-specific delete calls only after approval.

No provider storage was implemented in Step 276.

## 14. Future Production Storage Recommendation

Recommended architecture:

1. Keep DB URL fields for current compatibility.
2. Add provider-ready storage-key abstraction before provider migration.
3. Later add a media metadata model or ledger that tracks owner, purpose, storage key, public URL, checksum, size, status, and deletion timestamps.
4. Treat source assets as immutable app assets.
5. Treat managed uploads as owned media only when a storage key or metadata record proves ownership.
6. Use a recycle window before permanent deletion.
7. Add a DB-aware orphan audit mode before deletion jobs.
8. Keep historical evidence files until retention policy explicitly allows pruning.

## 15. Implementation Performed

This was Option B: pure helper/test/docs only.

Changed:

- `src/backend/admin/media-lifecycle.ts`
  - added `MANAGED_MEDIA_STORAGE_POLICY`;
  - added `normalizeManagedMediaStorageSegment()`;
  - added `planManagedMediaStorageKey()`.
- `docs/MEDIA_UPLOAD_POLICY.md`
  - documented source assets vs managed uploads;
  - documented stable storage-key direction;
  - documented deletion/retention direction;
  - documented product variant cleanup as not enabled yet.
- `tests/admin-media-storage-policy.test.ts`
  - added storage policy tests.
- `tests/admin-media-runtime-cleanup.test.ts`
  - added coverage proving `ProductVariant.image` references block product-managed deletion.
- `audit-reports/276-managed-media-lifecycle-storage-policy/media-lifecycle-policy-evidence.json`
  - added compact evidence summary.

No runtime upload path, deletion path, route response, status code, redirect, DB schema, or migration behavior changed.

## 16. Tests Added Or Updated

Added:

- `tests/admin-media-storage-policy.test.ts`

Coverage:

- current local upload roots are documented;
- source asset roots are documented;
- category foldering is not claimed to improve performance;
- object storage, deletion ledger, and recycle window remain explicitly unimplemented;
- future product storage keys use stable product/media identifiers;
- category/subcategory folders are ignored by the storage-key planner;
- unsafe storage-key segments are normalized;
- future object-storage-style keys are not treated as current local deletion candidates.

Updated:

- `tests/admin-media-runtime-cleanup.test.ts`

Coverage:

- a product-managed file referenced by `ProductVariant.image` is preserved by the existing reference guard.

## 17. Orphan Audit Status

`scripts/audit-admin-media-orphans.mjs` remains a read-only inventory tool.

Current status:

- no deletion;
- no filenames;
- no private env read;
- no DB usage;
- DB-aware adapter available;
- DB-aware reference check disabled by default;
- cannot determine true orphan status without DB references.

This is safe but not decisive enough for physical cleanup.

## 18. Validation Results

Validation commands run and results:

| Command | Result |
| --- | --- |
| `git status --short` | Passed; only allowed Step 276 docs/source/test/report files were dirty before staging. |
| `git log -3 --oneline` | Passed; latest starting commit was `04ef1f4`. |
| `git diff --cached --name-only` | Passed; empty before staging. |
| `git diff --check -- <exact changed files>` | Passed after final report update; Git emitted line-ending warnings only. |
| `node scripts/boilabin-terminal-loop-state.mjs` | Passed; Terminal Loop ready. |
| `node scripts/boilabin-advisor-state.mjs` | Passed; Advisor ready. |
| `npm run db:url:safety` | Passed; no database connection attempted, app/shadow URLs classified local and separate. |
| `npm run db:prisma:local:validate` | Passed. |
| `npm run db:prisma:local:generate` | Passed; Prisma Client generated. |
| `npx tsx --test tests/admin-media-storage-policy.test.ts` | Passed; 4/4 tests. |
| `npx tsx --test tests/admin-media-runtime-cleanup.test.ts` | Passed; 9/9 tests, including the variant-reference preservation branch. |
| `npx tsx --test tests/admin-media-reference-adapter.test.ts` | Passed; 9/9 tests. |
| `npx tsx --test tests/admin-media-reference-guard.test.ts` | Passed; 8/8 tests. |
| `npx tsx --test tests/admin-media-lifecycle.test.ts tests/admin-media-orphan-audit.test.ts` | Passed; 13/13 tests. |
| `node scripts/audit-admin-media-orphans.mjs` | Passed; read-only inventory, no deletion, no private env read, no DB usage. |
| `node scripts/audit-ai-marketing-copy.mjs` | Completed with exit 0 and the known 51 content-quality findings. |
| `node scripts/audit-search-verification-readiness.mjs` | Passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm test` | Passed; 432/432 tests. |
| `npm run build` | Passed; production build generated 72 static pages. |

## 19. Exact Files Changed Or Staged

Expected Step 276 files:

- `src/backend/admin/media-lifecycle.ts`
- `docs/MEDIA_UPLOAD_POLICY.md`
- `tests/admin-media-storage-policy.test.ts`
- `tests/admin-media-runtime-cleanup.test.ts`
- `audit-reports/276_MANAGED_MEDIA_LIFECYCLE_STORAGE_POLICY.md`
- `audit-reports/276-managed-media-lifecycle-storage-policy/media-lifecycle-policy-evidence.json`
- `audit-reports/277_NEXT_PROMPT_DRAFT.md`

No public assets, upload files, category images, product images, payment logos, footer/newsletter/PromoSection files, route files, Prisma schema, or migrations are expected in the staged set.

## 20. Confirmation No Real Files Were Deleted

Confirmed for implementation scope:

- no real project media files were deleted;
- no files under repo `public/assets`, `public/images`, or `public/uploads` were modified or deleted;
- tests added in this step are pure or use temp fixtures only;
- no destructive cleanup was run.

## 21. Confirmation No Prohibited Files Or Actions Occurred

Confirmed:

- no private env files were read intentionally;
- no secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, private connection strings, matched record details, or uploaded private file contents were printed;
- no DB mutations were run;
- no migrations, `prisma db push`, seed/reset, destructive SQL, Docker setup, provider CLI, package updates, or deployment commands were run;
- no Prisma schema or migration files were edited;
- no route response behavior was changed;
- no checkout/payment/order/auth/tracking/seller/SEO/CSP/rate-limit/mobile behavior was changed;
- no footer, newsletter, payment-logo, category image, product image, PromoSection, public visual design, or Flash Deals files were touched;
- no images were replaced, generated, downloaded, renamed, recompressed, or optimized;
- no broad staging was used.

## 22. Remaining Risks

- Variant image physical cleanup remains deferred.
- `ProductVariant.image` can store strings, but admin UI does not currently manage variant images.
- Product update deletes/recreates variants without collecting removed variant image cleanup candidates.
- DB-aware orphan audit remains disabled by default.
- Route-level response preservation tests still need fuller mocked route execution.
- Tracked upload-like files under `public/uploads/**` need a future ownership model before production deletion jobs.
- Local `public/uploads` is still not production-safe persistent storage.
- Object storage, CDN, storage keys in DB, media metadata, deletion ledger, recycle window, and backup/restore policy are not implemented.
- Order-item historical evidence depends on stored `OrderItem.imageUrl` values being reliable.

## 23. Recommended Next Step

Step 277 should add a read-only DB-aware orphan media audit mode that remains disabled by default and performs no deletion. It should use the existing Prisma-compatible reference adapter to classify candidates under `/uploads/admin/*` and `/uploads/products/*` as referenced, protected, unknown, or unverified, without printing filenames or matched records.

Do not implement deletion jobs, provider storage, schema migrations, or variant physical cleanup until the read-only audit proves reliable and ownership metadata is designed.
