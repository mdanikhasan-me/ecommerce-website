# Step 315: Source Banner Asset Validation Blocker

## Summary

Step 315 resolved the Step 314 full-test blocker caused by the deleted tracked source banner asset:

```txt
public/assets/banners/home-hero-iphone-15-pro.jpg
```

The file was still tracked in `HEAD`, still referenced by active seed/test/script surfaces, and still treated as a protected source asset. The deletion was therefore accidental for this step. I restored only that exact path with:

```txt
git restore -- public/assets/banners/home-hero-iphone-15-pro.jpg
```

No DB rows were mutated, no upload cleanup was performed, and Step 314 banner upload code was untouched.

## Root Cause Of Step 314 Full-Test Failure

Step 314 fixed the admin banner upload base64 bug, but full `npm test` still failed because the working tree had an unrelated deleted source asset:

```txt
public/assets/banners/home-hero-iphone-15-pro.jpg
```

The failing Step 314 tests expected the active seed/source banner asset to exist. With the file deleted, the source-of-truth checks reported missing canonical homepage banner media and sanitized media constraint evidence failed.

## Tracked Asset Confirmation

The file is tracked:

```txt
public/assets/banners/home-hero-iphone-15-pro.jpg
```

`git cat-file -s HEAD:public/assets/banners/home-hero-iphone-15-pro.jpg` returned:

```txt
52884
```

After restore, the working-tree file exists at:

```txt
public/assets/banners/home-hero-iphone-15-pro.jpg
```

with size:

```txt
52884
```

Because the file was restored exactly back to `HEAD`, it is clean after restore and has no media diff to stage.

## Active References That Required The File

Active non-audit references include:

- `prisma/seed.ts`: seed hero banner image URL.
- `scripts/audit-storefront-media-sources.mjs`: canonical hero asset list.
- `scripts/repair-storefront-image-sources.mjs`: banner repair target.
- `scripts/qa-admin-media-upload-delete.mjs`: protected source banner reset path.
- `tests/storefront-image-source.test.ts`: asserts seed reference and file existence.
- `tests/storefront-media-remote-policy.test.ts`: asserts canonical hero assets exist.
- `tests/navbar-banner-footer-polish.test.ts`: asserts seed banner assets exist.
- `tests/ui-ux-redesign-readiness.test.ts`: expects zero missing local source asset references.
- Admin media lifecycle/reference tests: assert `/assets/banners/**` remains cleanup-protected.

Full active-reference evidence is saved in:

```txt
audit-reports/315-source-banner-asset-validation/active-references.txt
```

## Exact Action Taken

Restored only:

```txt
public/assets/banners/home-hero-iphone-15-pro.jpg
```

No tests/source files were changed to remove or weaken the dependency. No remote banner URL was added.

## Step 314 Code Confirmation

No Step 314 admin banner upload implementation files were changed in Step 315:

- `src/frontend/components/admin/AdminImageField.tsx`
- `src/frontend/components/admin/BannerEditorForm.tsx`
- `src/backend/admin/banner-editor.ts`
- `src/backend/admin/banner-image-policy.ts`
- `src/backend/admin/banner-image-upload.ts`
- `src/app/api/admin/banners/upload/route.ts`
- `tests/admin-banner-upload-base64-fix.test.ts`

Step 314 behavior remains intact.

## DB And Media Guardrail Confirmation

- No DB mutation was performed.
- No seed/reset/db push/destructive SQL was run.
- No Prisma schema or migration was edited.
- No upload/orphan candidates were cleaned, deleted, staged, or moved.
- No category SVG icons were touched; the pre-existing dirty category SVG edits remain unstaged.
- No navbar/header/footer/help/category/product UI files were edited.
- No payment, tracking, seller, env, package, or media architecture policy files were changed.

## Evidence

Evidence directory:

```txt
audit-reports/315-source-banner-asset-validation/
```

Files:

- `before-git-status.txt`
- `tracked-file-check.txt`
- `head-asset-size-bytes.txt`
- `active-references.txt`
- `after-restore-git-status.txt`
- `restored-file-check.txt`
- `focused-test-result.txt`
- `full-test-before-report-result.txt`
- `post-report-focused-results.txt`
- `full-test-after-report-result.txt`
- `build-result.txt`

No duplicate image copy was committed as evidence.

## Validation Results

| Command | Result |
| --- | --- |
| `git status --short` | Reviewed before restore; showed deleted `public/assets/banners/home-hero-iphone-15-pro.jpg` plus unrelated dirty category image/SVG/upload entries. |
| `git ls-files public/assets/banners/home-hero-iphone-15-pro.jpg` | Confirmed tracked. |
| `git cat-file -s HEAD:public/assets/banners/home-hero-iphone-15-pro.jpg` | Confirmed tracked object size `52884`. |
| `rg -n "home-hero-iphone-15-pro\|/assets/banners" prisma src tests scripts` | Confirmed active non-audit references still require protected banner source assets. |
| `git restore -- public/assets/banners/home-hero-iphone-15-pro.jpg` | Restored only the missing tracked source banner asset. |
| `npx tsx --test tests/storefront-image-source.test.ts tests/storefront-media-remote-policy.test.ts tests/navbar-banner-footer-polish.test.ts tests/ui-ux-redesign-readiness.test.ts` | Passed: 15 tests, 0 failed. |
| `npm run db:url:safety` | Passed. |
| `npm run db:prisma:local:validate` | Passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed; Next lint deprecation notice only. |
| `npm test` before this report existed | Failed 2 unrelated/non-final issues: latest report was still Step 314 for Advisor readiness, and `public/assets/categories/toys-collectibles.jpg` has a pre-existing hash mismatch. The Step 315 banner-asset blocker no longer appeared. |
| `npx tsx --test tests/boilabin-advisor-workflow.test.ts` after this report existed | Passed: 13 tests, 0 failed. |
| `npx tsx --test tests/category-media.test.ts` | Failed only the known `toys-collectibles.jpg` hash mismatch. |
| `npm test` after this report existed | Failed 1 unrelated issue: `tests/category-media.test.ts` reports `public/assets/categories/toys-collectibles.jpg` hash mismatch. 543 passed, 1 failed. The Step 315 source-banner blocker remains resolved. |
| `npm run build` | Passed. |

## Prisma Generate Status

`npm run db:prisma:local:generate` was not rerun because project-local Next/Node processes that previously locked the Prisma engine DLL are still running:

- PID `29140`: `next start -p 3108`, listening on port `3108`.
- PID `5144`: Next `start-server.js`, listening on port `3000`.
- Related processes: PID `28032` (`npm run start -- -p 3108`), PID `17316` (`npm run dev`), PID `28264` (`next dev`).

Per the prompt, no processes were killed.

## Remaining Validation Blocker

After restoring the banner source asset, the original Step 314 source-banner failures are gone. The remaining full-suite blocker is unrelated to Step 315:

```txt
tests/category-media.test.ts
```

Failure:

```txt
toys-collectibles version should match image hash
actual:   11993afd8f62
expected: 18811d8fecf3
```

This matches the pre-existing dirty working-tree file:

```txt
public/assets/categories/toys-collectibles.jpg
```

I did not restore, rewrite, stage, or otherwise touch that category image because Step 315 was scoped only to the missing source banner asset and required no unrelated dirty files to be staged.

## Exact Files Changed

Restored in working tree and now clean against `HEAD`:

- `public/assets/banners/home-hero-iphone-15-pro.jpg`

New Step 315 files:

- `audit-reports/315-source-banner-asset-validation/before-git-status.txt`
- `audit-reports/315-source-banner-asset-validation/tracked-file-check.txt`
- `audit-reports/315-source-banner-asset-validation/head-asset-size-bytes.txt`
- `audit-reports/315-source-banner-asset-validation/active-references.txt`
- `audit-reports/315-source-banner-asset-validation/after-restore-git-status.txt`
- `audit-reports/315-source-banner-asset-validation/restored-file-check.txt`
- `audit-reports/315-source-banner-asset-validation/focused-test-result.txt`
- `audit-reports/315-source-banner-asset-validation/full-test-before-report-result.txt`
- `audit-reports/315-source-banner-asset-validation/post-report-focused-results.txt`
- `audit-reports/315-source-banner-asset-validation/full-test-after-report-result.txt`
- `audit-reports/315-source-banner-asset-validation/build-result.txt`
- `audit-reports/315_SOURCE_BANNER_ASSET_VALIDATION_BLOCKER.md`
- `audit-reports/315_NEXT_PROMPT_DRAFT.md`

## Exact Files Staged And Committed

Exact Step 315 files selected for staging and commit:

- `audit-reports/315-source-banner-asset-validation/active-references.txt`
- `audit-reports/315-source-banner-asset-validation/after-restore-git-status.txt`
- `audit-reports/315-source-banner-asset-validation/before-git-status.txt`
- `audit-reports/315-source-banner-asset-validation/build-result.txt`
- `audit-reports/315-source-banner-asset-validation/focused-test-result.txt`
- `audit-reports/315-source-banner-asset-validation/full-test-after-report-result.txt`
- `audit-reports/315-source-banner-asset-validation/full-test-before-report-result.txt`
- `audit-reports/315-source-banner-asset-validation/head-asset-size-bytes.txt`
- `audit-reports/315-source-banner-asset-validation/post-report-focused-results.txt`
- `audit-reports/315-source-banner-asset-validation/restored-file-check.txt`
- `audit-reports/315-source-banner-asset-validation/tracked-file-check.txt`
- `audit-reports/315_NEXT_PROMPT_DRAFT.md`
- `audit-reports/315_SOURCE_BANNER_ASSET_VALIDATION_BLOCKER.md`

The restored banner asset has no diff after restore, so it cannot be staged as a file change.

## Remaining Risks

- Full `npm test` is still expected to fail until the unrelated modified `public/assets/categories/toys-collectibles.jpg` hash mismatch is resolved.
- An untracked `public/uploads/admin/banners/hero/` directory exists and was not touched or staged.
- Pre-existing category SVG edits remain unstaged.
- Prisma generate remains blocked by active local Next/Node processes.

## Recommended Next Step

Run Step 316 as a narrow category media validation blocker resolution: inspect the pre-existing modified `public/assets/categories/toys-collectibles.jpg`, decide whether to restore it from git or approve a deliberate category media/version update, and do not touch Step 314 banner upload code, source banner assets, category SVG edits, upload/orphan directories, DB rows, Prisma schema/migrations, payment, tracking, seller, env, package, navbar, Help, footer, homepage hero, or `/category` UI work.
