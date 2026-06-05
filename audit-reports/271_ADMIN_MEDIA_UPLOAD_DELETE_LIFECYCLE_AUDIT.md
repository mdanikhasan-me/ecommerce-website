# Step 271 - Admin Media Upload/Delete Lifecycle Audit

## 1. Scope and Starting State

Step 271 audited admin-managed media upload and deletion behavior, focused on whether deleting an admin banner removes its uploaded image files. The step also added a pure safety classifier and no-DB tests for future media deletion hardening.

Starting commit verified:

```text
c1555f3 docs: audit public storefront content and media readiness
```

No private env files were read, no secrets or full DB URLs were printed, and no database, Docker, migration, seed, reset, SQL, provider, or deployment command was run.

## 2. Latest Commit Verification

Latest `git log -3 --oneline` before this work:

```text
c1555f3 docs: audit public storefront content and media readiness
a3bfa21 docs: add public storefront visual acceptance qa
b9a30ed docs: add category image visual acceptance qa
```

## 3. Files Inspected

- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `src/backend/admin/image-processing.ts`
- `src/backend/admin/banner-editor.ts`
- `src/backend/admin/category-editor.ts`
- `src/app/api/admin/banners/route.ts`
- `src/app/api/admin/banners/[id]/route.ts`
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `prisma/schema.prisma`
- `docs/MEDIA_UPLOAD_POLICY.md`
- existing media/upload validation tests

## 4. Current Admin Media Upload Map

| Surface | Current storage path | Current DB field(s) | Notes |
| --- | --- | --- | --- |
| Banners | `/uploads/admin/banners/...` | `Banner.imageUrl`, `Banner.mobileImageUrl` | Data URLs are persisted locally; non-data URLs are kept as provided. |
| Categories | `/uploads/admin/categories/...` | `Category.image` | Hard delete cleans managed image; archive path keeps image. |
| Products | `/uploads/products/...` | `ProductImage.url` | Uses product-specific helper and multiple image rows. |
| Brands | No active admin brand CRUD found | `Brand.logo`, `Brand.banner` exist | Schema supports fields, but active admin brand media lifecycle was not found. |

## 5. Current Admin Banner Upload/Edit/Delete Behavior

Banner create persists desktop/mobile data URLs through `persistAdminUpload(..., 'banners')` and cleans newly created managed uploads if the database create fails.

Banner update persists replacement desktop/mobile data URLs, updates the database row, then attempts to delete replaced managed admin uploads through `deleteReplacedAdminUploads`.

Banner delete deletes the `Banner` row, then calls:

```text
cleanupManagedAdminUploads([existingBanner.imageUrl, existingBanner.mobileImageUrl])
```

Evidence:

- `src/app/api/admin/banners/[id]/route.ts:34`
- `src/app/api/admin/banners/[id]/route.ts:64`
- `src/app/api/admin/banners/[id]/route.ts:106`
- `src/app/api/admin/banners/[id]/route.ts:107`
- `src/backend/admin/admin-utils.ts:96`
- `src/backend/admin/admin-utils.ts:112`

## 6. Current Product/Category/Brand Media Behavior

Products:

- New product uploads are persisted under `/uploads/products`.
- Product update deletes removed managed image files after the database update succeeds.
- Product delete attempts file cleanup after hard delete; if the route falls back to archive behavior, files remain.

Categories:

- Category uploads are persisted under `/uploads/admin/categories`.
- Category update deletes replaced managed images after the database update succeeds.
- Category delete removes the managed image only on hard delete. If children/products exist, the category is archived and the image remains.

Brands:

- `Brand.logo` and `Brand.banner` exist in Prisma schema.
- No active admin brand CRUD route/component/backend media flow was found in this audit.

## 7. Where Uploaded Files Are Stored

Admin banner/category uploads currently write to local public upload folders:

```text
public/uploads/admin/banners
public/uploads/admin/categories
```

Product uploads currently write to:

```text
public/uploads/products
```

These are local/pre-launch paths. `docs/MEDIA_UPLOAD_POLICY.md` states local `public/uploads` is acceptable for pre-launch testing but is not final production multi-vendor storage.

## 8. Whether Banner Deletion Currently Deletes the File

Yes, with limits.

When an admin deletes a banner, the route deletes the database row and then attempts to remove both `imageUrl` and `mobileImageUrl` from the local filesystem only if they are managed admin upload paths under `/uploads/admin/`.

It does not delete:

- `/assets/...` source-code assets,
- `/images/...` source-code assets,
- remote `http(s)` media,
- inline `data:image/...` payloads,
- unknown local paths.

The current behavior answers the owner question as:

```text
Admin-uploaded banner files are currently removed on banner delete only when the stored URL is a local managed admin upload path.
```

## 9. Whether Image Replacement Currently Orphans Old Files

Current replacement cleanup exists:

- Banner update deletes replaced `/uploads/admin/...` URLs that are no longer referenced by the same submitted banner payload.
- Category update deletes replaced `/uploads/admin/...` URLs.
- Product update deletes removed `/uploads/products/...` URLs.

Remaining orphan risks:

- No cross-record reference count is checked before physical deletion.
- If a file is shared by two records, current cleanup can delete a still-referenced file.
- If cleanup fails after a successful DB mutation, the route logs a sanitized warning but the old file may remain orphaned.
- There is no dedicated dry-run orphan audit script yet.

## 10. Source-Code Assets Never Delete

The new classifier explicitly protects source-controlled media paths:

```text
/assets/*
/images/*
```

The tests cover committed category/banner assets and legacy `/images` paths as non-deletable.

## 11. Admin-Managed Upload Paths Safe Candidates

The new helper classifies only these local prefixes as possible filesystem deletion candidates:

```text
/uploads/admin/*
/uploads/products/*
```

Even under those prefixes, the helper refuses:

- upload root directories,
- traversal paths,
- Windows-style traversal paths,
- query strings,
- fragments,
- null-byte paths.

## 12. Remote/Provider/Ambiguous Media Not Locally Deleted

Remote `http(s)` URLs and future provider/CDN URLs are not local filesystem deletion candidates.

Future object-storage deletion must use an owned storage key and provider namespace, not a public URL alone.

## 13. Hostinger/Shared-Hosting/Production Implications

Local `public/uploads` is acceptable for pre-launch/local use. For production, especially on Hostinger-style shared hosting or any serverless/multi-instance environment, local public upload writes are risky because:

- runtime uploads can mix with deploy artifacts,
- redeploy/rollback may lose files,
- multi-instance servers may not share filesystem state,
- backups and restore windows are not guaranteed,
- cache invalidation and CDN deletion policy are not defined.

Production launch should require an approved persistent media storage and backup/restore policy before broad admin media deletion is enabled.

## 14. Safe Deletion Contract

Minimum safe contract:

1. Only normalized files under `/uploads/admin/` or `/uploads/products/` may be considered local deletion candidates.
2. The resolved path must stay below the expected public upload root.
3. Upload root directories are never deletion candidates.
4. `/assets/*`, `/images/*`, remote URLs, data URLs, unknown local paths, query/hash paths, traversal, and null-byte paths are never deletion candidates.
5. Before runtime deletion is expanded, all known media reference fields must be checked for shared references.
6. Historical order, review, return, support, and audit evidence media must be preserved unless a retention policy explicitly allows deletion.
7. Future provider deletion must use owned storage keys, not public URL inference.

## 15. Implementation Performed

Added a dependency-free classifier:

- `src/backend/admin/media-lifecycle.ts`

It exports:

- `classifyAdminMediaPath`
- `resolveManagedMediaFilePath`
- `canDeleteAdminMediaLocalFile`

This step did not wire runtime deletion routes through the helper. Runtime hardening is intentionally left for a separate step.

## 16. Tests Added/Updated

Added:

- `tests/admin-media-lifecycle.test.ts`

Coverage:

- known managed upload roots are allowed only for actual files below the root,
- upload root directories are refused,
- source-code assets are protected,
- remote URLs and data URLs are not local deletion candidates,
- traversal and Windows-style traversal are refused,
- unknown local paths are refused,
- query strings and fragments are refused,
- managed paths resolve only inside expected public upload roots.

Targeted test result:

```text
npx tsx --test tests/admin-media-lifecycle.test.ts
pass: 7/7
```

## 17. Validation Results

Validation commands run:

```text
git status --short
git log -3 --oneline
git diff --cached --name-only
git diff --check -- <exact changed files>
node scripts/boilabin-terminal-loop-state.mjs
node scripts/boilabin-advisor-state.mjs
npm run db:url:safety
npm run db:prisma:local:validate
npm run db:prisma:local:generate
npx tsx --test tests/admin-media-lifecycle.test.ts
node scripts/audit-ai-marketing-copy.mjs
node scripts/audit-search-verification-readiness.mjs
npm run typecheck
npm run lint
npm test
npm run build
```

Results:

| Command | Result |
| --- | --- |
| `git status --short` | Only Step 271 files were dirty before staging. |
| `git log -3 --oneline` | Latest commit verified as `c1555f3 docs: audit public storefront content and media readiness`. |
| `git diff --cached --name-only` | Empty before staging. |
| `git diff --check -- <exact changed files>` | Passed. |
| `node scripts/boilabin-terminal-loop-state.mjs` | Passed; Terminal Loop ready. |
| `node scripts/boilabin-advisor-state.mjs` | Passed after adding the required `Recommended Next Step` section to the Step 272 prompt draft. |
| `npm run db:url:safety` | Passed; no database connection attempted; app/shadow URL shape classified local and separate. |
| `npm run db:prisma:local:validate` | Passed; Prisma schema valid. |
| `npm run db:prisma:local:generate` | Passed; Prisma Client generated. |
| `npx tsx --test tests/admin-media-lifecycle.test.ts` | Passed; 7/7 targeted tests. |
| `node scripts/audit-ai-marketing-copy.mjs` | Completed with exit 0; 231 files scanned and 51 pre-existing content findings reported. |
| `node scripts/audit-search-verification-readiness.mjs` | Passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm test` | Passed after prompt-draft parser fix; 396/396 tests. |
| `npm run build` | Passed; 72 static pages generated. |

Initial full-suite run failed only because the newly added `audit-reports/272_NEXT_PROMPT_DRAFT.md` did not expose the parser-required `Recommended Next Step` heading. The prompt draft was updated inside the allowed audit/prompt scope, the targeted Advisor workflow test passed, and the full suite then passed.

## 18. Exact Files Changed/Staged

Changed files for Step 271:

- `src/backend/admin/media-lifecycle.ts`
- `tests/admin-media-lifecycle.test.ts`
- `audit-reports/271-admin-media-upload-delete-lifecycle/admin-media-lifecycle-evidence.json`
- `audit-reports/271_ADMIN_MEDIA_UPLOAD_DELETE_LIFECYCLE_AUDIT.md`
- `audit-reports/272_NEXT_PROMPT_DRAFT.md`

No public image/SVG assets were modified.

## 19. No Prohibited Actions

Confirmed:

- no private env files read,
- no secrets printed,
- no full DB URLs printed,
- no migrations run,
- no `prisma db push`,
- no seed/reset/destructive SQL,
- no Docker commands,
- no deployment/provider commands,
- no orders/checkouts/payments/tracking/seller work,
- no Prisma schema or migration edits,
- no footer/newsletter/payment-logo/PromoSection/category image edits,
- no real asset deletion,
- no broad staging.

## 20. Remaining Risks

- Existing runtime cleanup helpers are not yet wired through the new classifier.
- There is no cross-record media reference check before physical deletion.
- Some tracked seed/source media may live under upload-like paths and require ownership classification before production deletion hardening.
- No orphan media dry-run script exists yet.
- Local `public/uploads` is not final production storage.
- Object storage/provider deletion is not implemented.
- No media deletion ledger, recycle window, or restore workflow exists.

## 21. Recommended Next Step

Proceed to Step 272: wire existing admin/product/category cleanup through the tested classifier and add shared-reference guard planning/tests before any broader runtime deletion behavior. Keep the step narrow: no provider storage, no image replacement, no migrations, no asset deletion, no visual work.
