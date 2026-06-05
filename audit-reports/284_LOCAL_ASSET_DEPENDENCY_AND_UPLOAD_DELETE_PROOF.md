# Step 284 - Local Asset Dependency And Upload Delete Proof

## 1. Scope And Starting State

Step 284 closed the current asset/media uncertainty as far as safely possible before a future UI/UX redesign phase.

Starting commit:

```text
ad5f309 fix: polish storefront copy after acceptance qa
```

Starting state:

- worktree was clean;
- no staged files were present;
- `audit-reports/284_NEXT_PROMPT_DRAFT.md` already existed for a different owner policy/legal step, so this step did not overwrite it;
- media lifecycle work from Steps 271-281 was already present;
- `MediaAsset` and `MediaDeletionLedger` are not implemented;
- provider/object storage is not implemented;
- product variant physical cleanup remains deferred.

## 2. Latest Commit Verification

Initial `git log -3 --oneline`:

```text
ad5f309 fix: polish storefront copy after acceptance qa
82758e2 fix: neutralize unsupported public claims
991507a docs: plan media metadata migration checklist
```

Initial `git status --short` and `git diff --cached --name-only` were empty.

## 3. Files Inspected

Primary reports inspected:

- Steps 271-283 media/copy reports;
- the existing `audit-reports/284_NEXT_PROMPT_DRAFT.md`.

Primary implementation files inspected:

- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/media-reference-guard.ts`
- `src/backend/admin/media-reference-adapter.ts`
- `src/backend/admin/admin-utils.ts`
- `src/backend/admin/product-editor.ts`
- `src/backend/admin/banner-editor.ts`
- `src/backend/admin/category-editor.ts`
- `src/backend/admin/image-processing.ts`
- `scripts/audit-admin-media-orphans.mjs`
- `docs/MEDIA_UPLOAD_POLICY.md`
- `prisma/schema.prisma`
- `prisma/seed.ts`

Primary frontend/static files inspected:

- `src/frontend/components/layout/Header.tsx`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/BoilabinLogo.tsx`
- `src/frontend/components/admin/AdminImageField.tsx`
- product/card/search/cart/wishlist/compare/header components through static scan;
- `src/shared/assets.ts`
- `src/shared/category-media.ts`
- `next.config.js`
- `src/backend/security/csp.ts`
- `public/assets/**`
- `public/images/**`
- `public/uploads/**` by aggregate inventory only.

## 4. Direct Answer To Owner Question

Current answer:

- Static UI assets and icons are now local, bundled, or inline. The remote placeholder helper was replaced with an app-owned inline SVG data URL.
- Admin product image uploads save under `public/uploads/products` and are served as `/uploads/products/...`.
- Admin banner image uploads save under `public/uploads/admin/banners` and are served as `/uploads/admin/banners/...`.
- Admin category image uploads save under `public/uploads/admin/categories` and are served as `/uploads/admin/categories/...`.
- Product images not appearing under `public/assets/products` is expected. `public/assets` is for source-controlled application assets, not runtime/admin uploads.
- Physical file removal happens only when the helper proves the path is inside the matching managed root and the shared reference guard reports zero active or historical references. If any check fails, the file is preserved and the helper returns a non-throwing failure result.

## 5. Source Assets Vs Managed Uploads Explanation

Current ownership split:

```text
public/assets/**  = source-controlled app assets
public/images/**  = source-controlled fallback/static app assets
public/uploads/** = runtime/admin uploaded managed files
```

Source assets are deployment-owned and git-owned. They include branding, payment logos, category artwork, hero images, and README preview assets.

Managed uploads are runtime-created files. They may be admin-created product, banner, category, or future seller media. Current local upload prefixes are useful pre-launch hints, but they are not enough for final production cleanup by themselves.

## 6. Static UI Asset Dependency Inventory

Added `scripts/audit-local-asset-dependencies.mjs`.

Aggregate evidence:

```text
audit-reports/284-local-asset-dependency-and-upload-delete-proof/local-asset-dependency-evidence.json
```

Latest aggregate result:

- scanned files: 360;
- local source asset references: 129;
- local managed upload references: 164;
- bundled `lucide-react` icon import files: 56;
- bundled `lucide-react` icon import count: 320;
- inline SVG occurrences: 3;
- data URL references: 17;
- remote image provider/CDN config references: 9;
- remote product/catalog media references: 64;
- remote static UI asset references: 0;
- `public/assets` inventory: 25 files;
- `public/images` inventory: absent;
- `public/uploads` inventory: 11 files.

The evidence is aggregate-only and does not print matched upload filenames or raw media URLs.

## 7. Remote/Hotlinked Static UI Asset Result

Found and fixed one remote static UI dependency:

- `getImagePlaceholder()` previously returned a remote placeholder service URL.
- It now returns an app-owned inline SVG data URL.

Post-fix scanner result:

```text
remoteStaticUiAsset = 0
remoteStaticUiAssetRisk = false
```

No third-party assets were downloaded or copied.

## 8. Remote Catalog/Product Media Result

Remote product/catalog media remains a known backlog.

Current aggregate scanner result:

```text
remoteProductCatalogMedia = 64
filesWithRemoteProductCatalogMediaCount = 10
```

This includes seed/catalog/provider-style image references and test fixtures. These are separated from static UI dependencies. They should be handled by a future catalog/media localization step, not mixed with UI icon/payment/logo cleanup.

## 9. Icons/Social/Payment/Header/Cart/Wishlist/Compare Asset Result

Result:

- header/search/cart/wishlist/compare/account/menu icons are bundled `lucide-react` imports;
- social icons in the footer are bundled `lucide-react` imports;
- payment logos rendered in the footer are local `/assets/payments/...` source assets;
- footer payment row remains bKash, Nagad, Visa, and Mastercard only;
- Cash on Delivery remains absent from the footer payment-logo row;
- YouTube URL remains `https://www.youtube.com/@Boilabin`;
- Boilabin logos use local `/assets/branding/...` assets.

Latent warning:

- `PAYMENT_ASSETS.STRIPE` still declares a path for a Stripe SVG that is not present in `public/assets/payments`.
- This is not currently rendered in the footer payment row, and online payment remains disabled.
- It should be resolved in a future payment/provider asset cleanup step before enabling Stripe or rendering that logo.

## 10. Product Upload Storage Result

Product uploads are persisted by `normalizeProductImages()` and `persistImage()` in `src/backend/admin/product-editor.ts`.

Current behavior:

- data URL product images are optimized by `persistOptimizedImageUpload()`;
- disk root is `public/uploads/products`;
- public URL prefix is `/uploads/products`;
- DB field is `ProductImage.url`;
- current filename shape uses the product slug plus timestamp and random suffix;
- product replacement cleanup uses `deleteRemovedProductImages()`.

Current product upload root is correct for local/pre-launch. Do not move admin product uploads into `public/assets/products`.

## 11. Banner Upload Storage Result

Banner uploads are persisted through `persistAdminUpload(payload.imageUrl, 'banners')` and `persistAdminUpload(payload.mobileImageUrl, 'banners')`.

Current behavior:

- disk root is `public/uploads/admin/banners`;
- public URL prefix is `/uploads/admin/banners`;
- DB fields are `Banner.imageUrl` and `Banner.mobileImageUrl`;
- replacement cleanup uses `deleteReplacedAdminUploads()`.

## 12. Category Upload Storage Result

Category uploads are persisted through `persistAdminUpload(payload.image, 'categories')`.

Current behavior:

- disk root is `public/uploads/admin/categories`;
- public URL prefix is `/uploads/admin/categories`;
- DB field is `Category.image`;
- replacement cleanup uses `deleteReplacedAdminUploads()`;
- deletion cleanup uses `deleteManagedAdminUpload()`.

Source-controlled category images under `/assets/categories/...` remain protected.

## 13. Physical Delete Proof Result

Added and extended tests that delete only temporary fixtures.

Proof covered:

- unreferenced `/uploads/admin/...` temp files can be physically removed after complete reference checks;
- unreferenced `/uploads/products/...` temp files can be physically removed after complete reference checks;
- cleanup is scoped so admin helpers refuse product roots and product helpers refuse admin roots;
- batch cleanup helpers remain non-throwing;
- physical delete failures return `false` and preserve the temp fixture.

No real project media file was deleted.

## 14. Referenced/Shared/Historical Preservation Proof Result

Proof covered:

- active `Banner`, `Category`, `Brand`, `Seller`, `ProductImage`, and `ProductVariant` references block physical removal;
- historical `OrderItem`, `ReturnRequest`, `Review`, and `User` references block physical removal;
- thrown reference lookup failures preserve files;
- incomplete reference results preserve files;
- sanitized reference errors do not expose DB URLs.

`ProductVariant.image` remains a reference blocker only. Variant-specific upload ownership and cleanup are deferred.

## 15. Protected `/assets` And `/images` Proof Result

Proof covered:

- `/assets/...` is classified as a protected source-code asset;
- `/images/...` is classified as a protected source-code asset;
- real temp fixtures under those roots are preserved by both admin and product cleanup helpers;
- remote URLs, data URLs, traversal, query/hash, root directories, and unknown local paths are refused before reference lookup.

## 16. Helper/Test Proof Vs Full Admin Browser QA

Proven by helper/tests:

- upload root classification;
- temp physical removal when reference-safe;
- preservation when referenced, historical, incomplete, or unsafe;
- non-throwing cleanup behavior;
- aggregate orphan audit behavior;
- static UI dependency classification;
- zero remote static UI image dependencies after the placeholder fix.

Not proven by full admin browser QA in this step:

- creating a real temporary banner/product/category record through the admin UI;
- uploading through the browser form;
- replacing/deleting through the admin UI;
- confirming DB-backed row references after browser actions.

Full admin browser QA was not run because it requires authenticated local admin fixture readiness, DB-backed temp records, and careful cleanup approval. This should be the next guarded step if the owner wants browser-level proof before UI/UX redesign.

## 17. Product Folder Structure And Optimization Answer

Direct answer:

- Category/subcategory foldering helps organization, not speed.
- Performance comes from optimization, responsive sizes, caching/CDN, lazy loading, and efficient formats.
- Stable `product-id/media-id` storage keys are safer than category or subcategory paths because product category assignments can change.
- Current local product uploads can stay under `public/uploads/products` for pre-launch.
- Future production storage should use stable object-storage keys like `products/<product-id>/media/<media-id>/<variant>.webp`.
- Category, subcategory, brand, placement, and alt text should be metadata, not durable storage path identity.

## 18. Hostinger/Local Disk/Object Storage Recommendation

Recommendation:

- Local disk under `public/uploads` is acceptable for local/pre-launch testing.
- Hostinger local disk should be treated as temporary unless the owner explicitly accepts backup, persistence, deploy, restore, and scaling limitations.
- Future production uploads should move to object storage plus CDN after provider, backup, restore, retention, deletion ledger, and recycle-window decisions are approved.
- Do not enable provider deletion or cleanup jobs until ownership metadata, ledger, approval, and restore gates exist.

## 19. Implementation Performed

Implemented:

- added a read-only aggregate local asset dependency audit script;
- added static asset dependency policy tests;
- replaced remote placeholder helper output with an inline SVG data URL;
- tightened temp-fixture cleanup tests for incomplete reference checks, protected source roots, and delete failure preservation;
- tightened reference guard and orphan audit unsafe-path test coverage;
- updated media upload policy documentation;
- generated aggregate evidence JSON.

No schema, migration, route contract, payment, tracking, seller, CSP enforcement, rate-limit, mobile, product lifecycle, or visual redesign behavior was changed.

## 20. Scripts/Tests Added Or Updated

Added:

- `scripts/audit-local-asset-dependencies.mjs`
- `tests/local-asset-dependency-policy.test.ts`

Updated:

- `tests/admin-media-runtime-cleanup.test.ts`
- `tests/admin-media-reference-guard.test.ts`
- `tests/admin-media-orphan-audit.test.ts`
- `docs/MEDIA_UPLOAD_POLICY.md`
- `src/backend/utils/string.ts`

## 21. Evidence Summary

Evidence files:

- `audit-reports/284-local-asset-dependency-and-upload-delete-proof/local-asset-dependency-evidence.json`
- `audit-reports/284-local-asset-dependency-and-upload-delete-proof/upload-cleanup-proof-summary.json`
- `audit-reports/284-local-asset-dependency-and-upload-delete-proof/db-aware-orphan-audit-summary.json`

Key results:

- static UI remote image risk: `false`;
- remote static UI asset count: `0`;
- remote product/catalog media count: `64`;
- upload root inventory count: `11`;
- DB-aware read-only orphan audit: 6 active referenced, 5 unreferenced managed candidates, 0 historical references;
- deletion performed: `false`;
- real media files deleted: `false`.

## 22. Validation Results

Validation completed:

| Command | Result |
| --- | --- |
| `git status --short` | Passed; changes were limited to the expected Step 284 files before staging. |
| `git log -3 --oneline` | Passed; starting commit was `ad5f309`. |
| `git diff --cached --name-only` | Passed; empty before staging. |
| `git diff --check -- <exact changed files>` | Passed; line-ending warnings only. |
| `node scripts/boilabin-terminal-loop-state.mjs` | Passed; Terminal Loop ready. |
| `node scripts/boilabin-advisor-state.mjs` | Passed; Advisor ready. |
| `npm run db:url:safety` | Passed; app and shadow DB URLs classify local and separate. |
| `npm run db:prisma:local:validate` | Passed under the local Prisma guardrail. |
| `npm run db:prisma:local:generate` | Passed under the local Prisma guardrail. |
| `npx tsx --test tests/local-asset-dependency-policy.test.ts tests/storefront-media-remote-policy.test.ts tests/storefront-image-source.test.ts tests/category-media.test.ts` | Passed; 17/17 tests. |
| `npx tsx --test tests/admin-media-runtime-cleanup.test.ts tests/admin-media-storage-policy.test.ts tests/admin-media-orphan-audit.test.ts tests/admin-media-reference-guard.test.ts tests/admin-media-lifecycle.test.ts` | Passed; 55/55 tests. |
| `node scripts/audit-local-asset-dependencies.mjs --evidence` | Passed; aggregate output, remote static UI asset count 0. |
| `node scripts/audit-admin-media-orphans.mjs` | Passed; default no-DB, no-delete, aggregate-only. |
| `node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local` | Passed; guarded local read-only DB classification, aggregate-only, no deletion. |
| `node scripts/audit-ai-marketing-copy.mjs` | Passed; 233 files scanned, 0 findings. |
| `node scripts/audit-search-verification-readiness.mjs` | Passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm test` | Passed; 462/462 tests. |
| `npm run build` | Passed. |

## 23. Exact Files Changed/Staged

Expected Step 284 files:

- `docs/MEDIA_UPLOAD_POLICY.md`
- `src/backend/utils/string.ts`
- `scripts/audit-local-asset-dependencies.mjs`
- `tests/local-asset-dependency-policy.test.ts`
- `tests/admin-media-runtime-cleanup.test.ts`
- `tests/admin-media-reference-guard.test.ts`
- `tests/admin-media-orphan-audit.test.ts`
- `audit-reports/284_LOCAL_ASSET_DEPENDENCY_AND_UPLOAD_DELETE_PROOF.md`
- `audit-reports/285_NEXT_PROMPT_DRAFT.md`
- `audit-reports/284-local-asset-dependency-and-upload-delete-proof/local-asset-dependency-evidence.json`
- `audit-reports/284-local-asset-dependency-and-upload-delete-proof/upload-cleanup-proof-summary.json`
- `audit-reports/284-local-asset-dependency-and-upload-delete-proof/db-aware-orphan-audit-summary.json`

## 24. Confirmation No Real Files Were Deleted

Confirmed:

- no real `public/assets/**` file was deleted;
- no real `public/images/**` file was deleted;
- no real `public/uploads/**` file was deleted;
- temp-fixture deletion occurred only inside OS temp directories created by tests;
- orphan audit remained dry-run and no-delete.

## 25. Confirmation No Prohibited Files/Actions Occurred

Confirmed:

- no Prisma schema edit;
- no migration file;
- no migration command;
- no seed/reset/db push/destructive SQL command;
- no DB mutation;
- no Docker setup;
- no provider CLI;
- no package update;
- no deployment;
- no source asset download;
- no product/category/banner image replacement;
- no visual redesign;
- no Flash Deals restoration;
- no payment/tracking/seller/mobile/product lifecycle/CSP enforcement/rate-limit work;
- no footer payment-logo set or footer social URL change;
- no secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, customer/order PII, private connection strings, private upload filenames, matched candidate URLs, or private uploaded file contents were printed in this report.

## 26. Remaining Risks

- Full admin browser upload/replace/delete QA has not been run.
- Remote product/catalog media remains and should be localized or replaced in a dedicated catalog media step.
- `PAYMENT_ASSETS.STRIPE` declares a missing unused local SVG path; do not render it until a legitimate local asset and payment policy are approved.
- `placehold.co` remains in seed brand-logo data and CSP image sources as catalog/provider backlog, not current static UI dependency.
- `MediaAsset` and `MediaDeletionLedger` do not exist.
- Provider/object storage, CDN, deletion ledger, recycle window, approval UI, and cleanup jobs are not implemented.
- Product variant upload ownership and cleanup remain deferred.
- Current unreferenced managed candidates are audit findings only, not approval for physical removal.

## 27. Recommended Next Step

Step 285 should run a guarded local admin media upload/replace/delete browser QA with temporary records only, if local admin fixture readiness exists. If fixture readiness is missing, Step 285 should stop with a precise readiness checklist. After that browser proof, the project can move into the UI/UX redesign transition plan with much less asset uncertainty.
