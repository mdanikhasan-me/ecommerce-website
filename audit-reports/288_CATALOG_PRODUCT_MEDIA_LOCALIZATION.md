# Step 288: Catalog Product Media Localization

## 1. Scope and starting state

Step 288 implemented source-controlled demo/catalog product media. This was not a UI redesign step and did not change runtime upload behavior.

Starting state:

- latest commit verified: `ff26f95 fix: refine storefront card and filter foundation`
- no staged files existed before work
- `public/assets/products` did not exist
- product seed media included 14 remote product image references, 6 managed product upload references, and 1 non-product source asset reference
- aggregate remote product/catalog media count was 64

## 2. Latest commit verification

`git log -5 --oneline` showed `ff26f95 fix: refine storefront card and filter foundation` as the latest commit at the start of Step 288.

## 3. Direct owner answer

Local source-controlled catalog product assets now live here:

```text
public/assets/products/catalog/
```

Active product seed image rows now use paths like:

```text
/assets/products/catalog/<product-slug>.<ext>
```

Admin/runtime uploads remain separate under `public/uploads/products`.

## 4. Files inspected

- `prisma/seed.ts`
- `public/assets/**`
- `public/uploads/**` inventory only
- `scripts/audit-local-asset-dependencies.mjs`
- `scripts/audit-storefront-media-sources.mjs`
- `scripts/repair-known-broken-image-urls.mjs`
- `src/backend/admin/media-lifecycle.ts`
- `src/backend/admin/product-editor.ts`
- `docs/MEDIA_UPLOAD_POLICY.md`
- media and runtime tests under `tests/`

## 5. Source assets vs managed uploads decision

Decision:

- source-controlled catalog/demo product images belong under `public/assets/products/catalog`
- admin/runtime product uploads stay under `public/uploads/products`
- `/assets/products/**` is protected source media and must never be deleted by admin cleanup helpers
- committed same-slug demo upload files may be copied into `public/assets/products/catalog` when they are already seed/demo catalog media

No files under `public/uploads/**` were modified or deleted.

## 6. Product/catalog remote media baseline

Baseline aggregate evidence:

- remote product/catalog media count: 64
- product seed remote image references: 14
- product seed managed upload references: 6
- product seed non-product source asset references: 1
- product source asset folder existed: no

## 7. Local product asset folder created

Created:

```text
public/assets/products/catalog/
```

Postcheck:

- product source asset folder exists: yes
- product files in folder: 21
- extensions: 5 jpg, 2 webp, 14 avif
- total product source asset bytes: 1,891,510

## 8. Images localized

Localized 21 product seed images:

- 7 copied from existing repo-local sources or committed demo product uploads
- 14 localized from exact seed/demo catalog references already present in the project
- 0 skipped

The 14 seed-reference localized files are marked `ownerReviewNeeded` in `src/shared/product-media.ts` so final owner-supplied product art can replace them later if desired.

## 9. References updated

Updated:

- `prisma/seed.ts` product `imageUrl` values now use `/assets/products/catalog/**`
- product image repair target paths now point to `/assets/products/catalog/**`
- storefront media audit replacement targets now point to `/assets/products/catalog/**`
- iPhone and Galaxy hero/banner seed references remain banner assets, not product catalog assets

Postcheck:

- product seed local product source asset count: 21
- product seed managed upload count: 0
- product seed remote catalog media count: 0
- product seed missing local source asset count: 0

## 10. Items skipped and why

No active product seed image was skipped.

Still not localized in this step:

- brand logo placeholders, because brand/logo approval is separate
- the accepted Sony hero/banner remote, because hero/banner replacement was outside this product-media scope
- historical repair/test/documentation remote references, because they are regression evidence rather than active product seed image rows

## 11. Remaining remote catalog backlog

After Step 288:

- aggregate remote product/catalog media count: 50
- files with remote product/catalog media references: 10
- product seed remote image references: 0
- owner-review product media count: 14

Remaining remote catalog references are accepted, historical, policy, repair, or non-product-seed references.

## 12. Admin upload boundary preservation

Preserved:

- admin product uploads still use `public/uploads/products`
- source-controlled catalog product assets use `public/assets/products/catalog`
- admin cleanup still treats `/assets/**` as protected source media
- admin cleanup still considers only known managed upload roots as local deletion candidates

The DB-aware orphan audit was read-only and did not delete files.

## 13. Cleanup/source asset protection result

Added or updated tests proving:

- `/assets/products/catalog/example-product.jpg` is classified as protected source media
- product cleanup refuses `/assets/products/catalog/iphone-15-pro-128gb.jpg`
- cleanup does not perform a reference lookup for protected source assets
- product seed rows no longer use `/uploads/products/**`

## 14. Browser/rendered image evidence

Production browser evidence:

- browser evidence overall result: pass
- screenshots captured: 12
- product-view POST interceptions: 10
- broken visible images: 0
- failed requests: 0
- console errors: 0
- horizontal overflow: 0
- `/deals` remained removed
- `/api/admin/flash-sales` remained removed
- `/products/iphone-15-pro-128gb` rendered with localized product media evidence

Evidence file:

```text
audit-reports/288-catalog-product-media-localization/browser-media-evidence.json
```

## 15. Tests added/updated

Added:

- `tests/catalog-product-media-localization.test.ts`

Updated:

- `tests/admin-media-storage-policy.test.ts`
- `tests/local-asset-dependency-policy.test.ts`
- `tests/storefront-media-remote-policy.test.ts`

## 16. Validation results

Passed:

- `git status --short`
- `git log -5 --oneline`
- `git diff --cached --name-only`
- `git diff --check -- <exact changed files>`; only line-ending warnings, no whitespace errors
- `node scripts/boilabin-terminal-loop-state.mjs`
- `node scripts/boilabin-advisor-state.mjs`
- `npm run db:url:safety`
- `npm run db:prisma:local:validate`
- `npm run db:prisma:local:generate`
- targeted catalog/media/admin/storage/runtime tests
- `node scripts/audit-local-asset-dependencies.mjs --evidence`
- `node scripts/audit-admin-media-orphans.mjs`
- `node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local`
- `node scripts/audit-ai-marketing-copy.mjs`
- `node scripts/audit-search-verification-readiness.mjs`
- `npm run typecheck`
- `npm run lint`
- `npm test` with 478/478 tests passing
- `npm run build`
- production HTTP smoke
- production browser evidence

Note: an existing repo-local Next dev server held the Prisma generated engine file during the first two `db:prisma:local:generate` attempts. Only the repo-local Next dev processes were stopped; the retry passed.

## 17. Exact files changed/staged

Changed or added by Step 288:

- `docs/MEDIA_UPLOAD_POLICY.md`
- `prisma/seed.ts`
- `scripts/audit-local-asset-dependencies.mjs`
- `scripts/audit-storefront-media-sources.mjs`
- `scripts/repair-known-broken-image-urls.mjs`
- `src/shared/product-media.ts`
- `tests/admin-media-storage-policy.test.ts`
- `tests/catalog-product-media-localization.test.ts`
- `tests/local-asset-dependency-policy.test.ts`
- `tests/storefront-media-remote-policy.test.ts`
- `public/assets/products/catalog/**`
- `audit-reports/288-catalog-product-media-localization/**`
- `audit-reports/288_CATALOG_PRODUCT_MEDIA_LOCALIZATION.md`
- `audit-reports/289_NEXT_PROMPT_DRAFT.md`

## 18. Confirmation no DB mutation/no seed/no real upload deletion

Confirmed:

- no Prisma schema edit
- no migration created
- no migration run
- no seed run
- no destructive SQL
- no DB mutation
- no public upload file modified or deleted
- no private env file read
- no deployment
- no package update

## 19. Remaining risks

- 14 localized product files came from existing seed/demo references and should receive owner visual review before final production launch.
- Brand logo placeholders remain remote and need a separate brand asset approval/localization step.
- Sony hero/banner remains an accepted remote until a dedicated hero/banner replacement is approved.
- Historical repair/test/policy remote references remain for regression evidence.

## 20. Recommended next step

Proceed to Step 289: return to homepage/product-grid rhythm polish using the newly localized catalog media foundation. Keep header/footer/newsletter/payment logos/category images/hero assets/uploads/Prisma schema/migrations/payment/tracking/seller/CSP/rate-limit/mobile implementation out of scope.
