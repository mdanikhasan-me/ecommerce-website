# Step 285: Ultimate Admin Media Upload/Delete Proof

## 1. Scope and Starting State

This step closed the remaining media/local-asset proof gap before UI/UX redesign work.

Starting commit verified:

- `89338f4 test: cover local asset dependency and upload cleanup proof`

Starting worktree was clean before implementation.

Primary owner concern addressed:

- Admin product/banner/category uploads must land in controlled managed local upload storage.
- Replacing/deleting temp admin records must remove physical temp files when reference-safe.
- Static UI assets must be local or bundled, not random remote-host dependencies.
- `public/assets/**` and `public/uploads/**` must be explained clearly.

## 2. Latest Commit Verification

`git log -5 --oneline` started with:

- `89338f4 test: cover local asset dependency and upload cleanup proof`
- `ad5f309 fix: polish storefront copy after acceptance qa`
- `82758e2 fix: neutralize unsupported public claims`
- `991507a docs: plan media metadata migration checklist`
- `693d69b docs: plan provider-ready media metadata schema`

## 3. Preflight Safety Results

Passed:

- `npm run db:url:safety`
- `npm run db:prisma:local:validate`
- `npm run db:prisma:local:generate`

Local DB URL-shape guardrails reported:

- `DATABASE_URL`: local
- `SHADOW_DATABASE_URL`: local
- app/shadow DB separate: yes
- local migration ready: yes

No DB URL values, secrets, cookies, auth headers, or tokens were printed.

## 4. Files Inspected

Main files inspected:

- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `src/backend/admin/image-processing.ts`
- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/media-reference-guard.ts`
- `src/backend/admin/media-reference-adapter.ts`
- `src/app/api/admin/products/route.ts`
- `src/app/api/admin/products/[id]/route.ts`
- `src/app/api/admin/banners/route.ts`
- `src/app/api/admin/banners/[id]/route.ts`
- `src/app/api/admin/categories/route.ts`
- `src/app/api/admin/categories/[id]/route.ts`
- `src/shared/assets.ts`
- `src/backend/config/payment.ts`
- `scripts/audit-local-asset-dependencies.mjs`
- `scripts/audit-admin-media-orphans.mjs`
- existing admin media tests

## 5. Direct Owner Answer

Product uploads currently save under:

- `/uploads/products/`

Banner uploads currently save under:

- `/uploads/admin/banners/`

Category uploads currently save under:

- `/uploads/admin/categories/`

These are runtime/admin-managed upload roots under `public/uploads/**`.

`public/assets/**` is for source-controlled static app assets: branding, category art, payment logos, and other deployment-owned files.

`public/uploads/**` is for runtime/admin uploaded managed files. That is why product uploads are not expected under `public/assets/products`.

Moving runtime product uploads into `public/assets/products` is not automatically better. It would mix mutable admin uploads with source-controlled deployment assets. If a future folder strategy is needed, use stable product/media IDs rather than mutable category paths.

When a temp product/banner/category record is replaced or deleted, the current cleanup helpers remove physical temp upload files only when reference checks prove the file is safe to remove.

## 6. Admin Fixture Readiness Result

Full browser admin QA was not run.

Reason:

- There was no approved non-secret authenticated admin browser session available for this task.
- The existing auth readiness script is buyer-checkout oriented, not admin media CRUD oriented.
- Running `npm run admin:password:local` would mutate a local admin password hash and was not part of this step.

Fallback used:

- A guarded local API/helper-level QA harness created temporary local DB records and used the same app-approved media persistence and cleanup helpers used by admin product/banner/category routes.

## 7. Product Upload/Replace/Delete Proof Result

Passed through `scripts/qa-admin-media-upload-delete.mjs`.

Evidence:

- temp product record created: yes
- temp product image persisted under `/uploads/products/`: yes
- physical temp file appeared: yes
- active `ProductImage.url` reference preserved file: yes
- replacement persisted a new temp image: yes
- old replaced temp file deleted when unreferenced: yes
- new temp file remained while referenced: yes
- product record deleted: yes
- current temp product image file deleted after record deletion: yes

## 8. Banner Upload/Replace/Delete Proof Result

Passed through `scripts/qa-admin-media-upload-delete.mjs`.

Evidence:

- temp banner record created: yes
- temp banner image persisted under `/uploads/admin/banners/`: yes
- physical temp file appeared: yes
- active banner reference preserved file: yes
- replacement persisted a new temp image: yes
- old replaced temp file deleted when unreferenced: yes
- new temp file remained while referenced: yes
- banner record deleted: yes
- current temp banner image file deleted after record deletion: yes

## 9. Category Upload/Replace/Delete Proof Result

Passed through `scripts/qa-admin-media-upload-delete.mjs`.

Evidence:

- temp category record created: yes
- temp category image persisted under `/uploads/admin/categories/`: yes
- physical temp file appeared: yes
- active category reference preserved file: yes
- replacement persisted a new temp image: yes
- old replaced temp file deleted when unreferenced: yes
- new temp file remained while referenced: yes
- category record deleted: yes
- current temp category image file deleted after record deletion: yes

## 10. Physical File Cleanup Result

Evidence file:

- `audit-reports/285-ultimate-admin-media-upload-delete-proof/admin-media-upload-delete-evidence.json`

Aggregate result:

- temp record types tested: product, banner, category
- temp records created: 7
- temp records cleaned: yes
- temp files created: 10
- temp files cleaned: yes
- real media files deleted: no
- deletion performed only for temp files: yes
- cleanup errors: 0

## 11. Referenced/Shared/Historical Preservation Result

Passed:

- active product reference preserved file
- `ProductVariant.image` reference preserved file
- simulated historical evidence reference preserved file
- reference lookup failure preserved file
- incomplete reference check preserved file
- shared admin/banner reference preserved file
- protected source asset reference preserved file

Expected synthetic cleanup warnings were printed during test/harness runs for intentionally failed or incomplete reference checks. These warnings were sanitized and confirmed the fail-closed behavior.

## 12. Protected Source Asset Preservation Result

Protected local source roots remain non-deletable:

- `/assets/*`
- `/images/*`

Unsafe paths remain refused:

- remote URLs
- data URLs
- root upload directories
- query/hash upload paths
- traversal paths
- unknown local paths
- admin cleanup against product root
- product cleanup against admin root

No real source asset file was deleted.

## 13. Browser vs API vs Helper Proof Explanation

Browser path:

- Did not run because authenticated admin browser session readiness was not available without private credentials or a password mutation.

API/helper path:

- Ran successfully.
- Used the same app-approved persistence and cleanup helpers as admin routes:
  - product images: `normalizeProductImages`, `deleteRemovedProductImages`, `deleteManagedUpload`
  - banner/category images: `persistAdminUpload`, `deleteReplacedAdminUploads`, `deleteManagedAdminUpload`
  - shared reference checks: Prisma-compatible reference adapter

This is stronger than temp-fixture-only tests because it created and cleaned real temporary local DB records and real temporary optimized uploads.

Remaining browser gap:

- A future browser QA can confirm the form UI path once a private local admin session is available.

## 14. `public/assets/products` vs `public/uploads/products` Final Decision

Keep current runtime product uploads in:

- `public/uploads/products`

Do not move runtime uploads into:

- `public/assets/products`

Reason:

- `public/assets/**` is deployment/source-controlled.
- `public/uploads/**` is runtime/admin-managed.
- Mixing the two makes ownership, backup, deploy, and deletion behavior harder to reason about.

## 15. Product Folder/Category/Subcategory Organization vs Performance Answer

Category/subcategory folders help human organization, not speed.

Performance comes from:

- image dimensions
- compression
- WebP/modern formats
- responsive sizes
- lazy loading
- CDN/cache headers
- avoiding remote/hotlinked dependencies

Category/subcategory folder paths can become misleading if a product changes category.

Recommended future storage key shape:

- local/prelaunch: `/uploads/products/<product-id-or-media-id>/<file>`
- future provider: `products/<product-id>/media/<media-id>/<variant>.webp`

Category, subcategory, brand, alt text, ownership, and purpose should be metadata.

## 16. Static UI Asset Dependency Postcheck

Evidence file:

- `audit-reports/285-ultimate-admin-media-upload-delete-proof/local-asset-dependency-postcheck.json`

Result:

- remote static UI asset count: 0
- remote static UI asset risk: false
- missing local source asset warnings: 0
- bundled icon import files: 56
- bundled icon import count: 325
- local source asset references: 134
- local managed upload references: 168

The scanner was improved so missing local source asset warnings are aggregate-only and exclude docs, tests, scripts, prisma, audit reports, public asset docs, and local skill docs.

## 17. Remote/Hotlinked Static UI Asset Result

No active remote static UI asset dependency was found.

Allowed provider/CDN config references are still counted separately from UI dependencies.

## 18. Remote Catalog/Product Media Backlog Result

Remote catalog/product media remains a backlog item.

Aggregate result:

- remote product/catalog media references: 64
- files with remote product/catalog media: 10

This does not block UI/UX redesign as long as redesign work does not add remote static UI dependencies or pretend catalog media localization is complete.

Recommended future path:

- separate catalog media localization/replacement planning with owner-approved local images.

## 19. `PAYMENT_ASSETS.STRIPE` Missing Asset Decision

The unused `PAYMENT_ASSETS.STRIPE` local asset declaration was removed from `src/shared/assets.ts`.

What did not change:

- Stripe payment method remains disabled in `src/backend/config/payment.ts`.
- Stripe is not rendered in the footer.
- No Stripe logo was downloaded, generated, or added.
- No payment behavior changed.
- Visa and Mastercard remain the card logos for the disabled international card placeholder.

Evidence:

- `stripeAssetDeclared`: false
- `stripeMissingAssetPathDeclared`: false
- decision: `unused-stripe-asset-reference-removed-until-payment-provider-approval`
- payment behavior changed: false

## 20. Hostinger/Local Disk/Object Storage Recommendation

Current local/prelaunch:

- `public/uploads/**` is acceptable for local development and guarded local QA.

Hostinger/shared hosting:

- can be a temporary option only if uploads persist across deploys and backups are configured.
- must be checked carefully before launch because local-disk upload persistence varies by hosting/deploy model.

Serverless or multi-instance hosting:

- should not rely on local disk for uploaded media.

Long-term recommended production shape:

- object storage
- CDN
- stable storage keys
- `MediaAsset` metadata
- deletion ledger
- recycle window
- backup/restore policy
- provider deletion policy

No provider setup was implemented in this step.

## 21. Temporary Records/Files Cleanup Confirmation

Confirmed:

- all Step 285 temp records cleaned
- all Step 285 temp files cleaned
- no existing real media file deleted
- no source asset file deleted
- no filenames, full paths, secrets, cookies, tokens, DB URLs, or customer/order PII were included in evidence

## 22. Tests/Scripts Added or Updated

Added:

- `scripts/qa-admin-media-upload-delete.mjs`
- `tests/admin-media-upload-delete-qa.test.ts`

Updated:

- `scripts/audit-local-asset-dependencies.mjs`
- `tests/local-asset-dependency-policy.test.ts`
- `src/shared/assets.ts`

Evidence added:

- `audit-reports/285-ultimate-admin-media-upload-delete-proof/admin-media-upload-delete-evidence.json`
- `audit-reports/285-ultimate-admin-media-upload-delete-proof/local-asset-dependency-postcheck.json`
- `audit-reports/285-ultimate-admin-media-upload-delete-proof/orphan-audit-postcheck.json`

## 23. Validation Results

Passed:

- `git status --short`
- `git log -5 --oneline`
- `git diff --cached --name-only`
- `node scripts/boilabin-terminal-loop-state.mjs`
- `node scripts/boilabin-advisor-state.mjs`
- `npm run db:url:safety`
- `npm run db:prisma:local:validate`
- `npm run db:prisma:local:generate`
- `node scripts/qa-admin-media-upload-delete.mjs --out audit-reports/285-ultimate-admin-media-upload-delete-proof/admin-media-upload-delete-evidence.json`
- targeted admin media lifecycle/runtime/storage/reference/orphan/local-asset tests
- `node scripts/audit-local-asset-dependencies.mjs --evidence`
- `node scripts/audit-admin-media-orphans.mjs`
- `node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local`
- `node scripts/audit-ai-marketing-copy.mjs`
- `node scripts/audit-search-verification-readiness.mjs`
- `npm run typecheck`
- `npm run lint`
- `npm test` (`465/465`)
- `npm run build`

Production build passed.

## 24. Exact Files Changed/Staged

Changed files for this step:

- `audit-reports/285_ULTIMATE_ADMIN_MEDIA_UPLOAD_DELETE_PROOF.md`
- `audit-reports/286_NEXT_PROMPT_DRAFT.md`
- `audit-reports/285-ultimate-admin-media-upload-delete-proof/admin-media-upload-delete-evidence.json`
- `audit-reports/285-ultimate-admin-media-upload-delete-proof/local-asset-dependency-postcheck.json`
- `audit-reports/285-ultimate-admin-media-upload-delete-proof/orphan-audit-postcheck.json`
- `scripts/qa-admin-media-upload-delete.mjs`
- `scripts/audit-local-asset-dependencies.mjs`
- `src/shared/assets.ts`
- `tests/admin-media-upload-delete-qa.test.ts`
- `tests/local-asset-dependency-policy.test.ts`

## 25. Prohibited File/Action Confirmation

Confirmed:

- no Prisma schema change
- no migration created or edited
- no seed/reset/db push command run
- no destructive SQL
- no Docker
- no provider CLI
- no deployment
- no payment backend enabled
- no tracking backend enabled
- no seller marketplace enabled
- no CSP/rate-limit/product lifecycle behavior changed
- no footer files changed
- no newsletter files changed
- no PromoSection files changed
- no category/banner/product source images changed
- no payment logo asset files added or changed
- no real `public/uploads/**` file deleted
- no `public/assets/**` file deleted

## 26. Remaining Risks

Remaining:

- full browser admin media CRUD still needs a private local admin session.
- production storage still needs object storage/CDN/backups/provider deletion policy before launch.
- `MediaAsset`, deletion ledger, and recycle window remain future work.
- orphan audit reports aggregate unreferenced managed candidates, but that is not deletion approval.
- remote catalog/product media backlog remains.
- Sony hero and broader catalog/provider media replacement remain separate future media tasks.

## 27. Recommended Next Step

Proceed to Step 286: UI/UX redesign transition inventory and design-system readiness.

This should be planning/inventory first, not broad redesign implementation. Keep media/local-asset decisions from Step 285 intact and avoid payment/tracking/seller/schema changes.
