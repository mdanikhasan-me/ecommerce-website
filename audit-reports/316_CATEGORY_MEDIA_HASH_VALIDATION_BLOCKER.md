# Step 316 Category Media Hash Validation Blocker

## Summary

Step 316 resolved the `tests/category-media.test.ts` blocker for the Toys & Collectibles category image.

The blocker was a real hash mismatch between the active media version in `src/shared/category-media.ts` and the intentionally changed image file at `public/assets/categories/toys-collectibles.jpg`.

## Root Cause

`tests/category-media.test.ts` computes the SHA-256 hash of each category image and compares the first 12 characters to the configured `version` in `src/shared/category-media.ts`.

Before the final Step 316 fix:

| Source | Value |
| --- | --- |
| Active version in `src/shared/category-media.ts` | `11993afd8f62` |
| Intentional new image SHA-256 prefix | `18811d8fecf3` |
| Intentional new image full SHA-256 | `18811d8fecf34374ce1007e2439c53c0353f4bda41de5f181d764ffac19e460e` |

That mismatch caused the test failure:

```txt
toys-collectibles version should match image hash
actual:   11993afd8f62
expected: 18811d8fecf3
```

## Decision

Decision: intentional image modification.

The user clarified during Step 316 that the changed Toys & Collectibles picture was intentional and should be kept. After that clarification, the correct outcome became Outcome B: keep the image and update only the active category media version hash.

The intentional image was recovered from:

```txt
C:\Users\anikh\Downloads\toys-collectibles.jpg
```

and copied back to:

```txt
public/assets/categories/toys-collectibles.jpg
```

The recovered file matched the original failing hash exactly:

```txt
18811d8fecf34374ce1007e2439c53c0353f4bda41de5f181d764ffac19e460e
```

## Exact Change

Updated only the Toys & Collectibles media version owner:

```txt
src/shared/category-media.ts
```

from:

```txt
11993afd8f62
```

to:

```txt
18811d8fecf3
```

Kept the intentional new image at:

```txt
public/assets/categories/toys-collectibles.jpg
```

## Active References

Active source references confirm `src/shared/category-media.ts` owns the category image version used by the test:

```txt
src/shared/category-media.ts
tests/category-media.test.ts
tests/storefront-image-source.test.ts
scripts/audit-storefront-media-sources.mjs
scripts/repair-storefront-image-sources.mjs
prisma/seed.ts
```

No active source file referenced the old failing hash as a required permanent value after the user clarified the image change was intentional.

## Guardrail Confirmation

Step 314 admin banner upload code was untouched.

Step 315 restored source banner asset was untouched:

```txt
public/assets/banners/home-hero-iphone-15-pro.jpg
```

Category SVG icon edits were untouched and unstaged. The following pre-existing dirty user-owned files remain outside Step 316 staging:

```txt
public/assets/icons/ui/categories/beauty-health.svg
public/assets/icons/ui/categories/books-stationery.svg
public/assets/icons/ui/categories/electronics.svg
public/assets/icons/ui/categories/fashion.svg
public/assets/icons/ui/categories/gaming.svg
public/assets/icons/ui/categories/home-appliances.svg
public/assets/icons/ui/categories/sports-fitness.svg
public/assets/icons/ui/categories/toys-collectibles.svg
```

The untracked upload/orphan directory was untouched and unstaged:

```txt
public/uploads/admin/banners/hero/
```

No DB mutation happened. No seed, reset, migration, db push, destructive SQL, Prisma schema edit, or migration edit was run.

## Validation

| Command | Result |
| --- | --- |
| `npx tsx --test tests/category-media.test.ts tests/storefront-media-remote-policy.test.ts` | Pass after intentional update, 7 tests passed |
| `npm run db:url:safety` | Pass |
| `npm run db:prisma:local:validate` | Pass |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm test` | Pass, 544 tests passed |
| `npm run build` | Pass |

## Prisma Generate Status

`npm run db:prisma:local:generate` was not run because the known local Windows Prisma/Next lock risk remains. Active Node/Next listeners were present:

```txt
port 3000 owner PID 5144
port 3108 owner PID 29140
```

No processes were killed.

## Evidence

Evidence files:

```txt
audit-reports/316-category-media-hash-validation/before-git-status.txt
audit-reports/316-category-media-hash-validation/before-image-diff-stat.txt
audit-reports/316-category-media-hash-validation/tracked-file-check.txt
audit-reports/316-category-media-hash-validation/head-asset-size-bytes.txt
audit-reports/316-category-media-hash-validation/active-references.txt
audit-reports/316-category-media-hash-validation/current-vs-head-metadata.json
audit-reports/316-category-media-hash-validation/focused-pre-existing-failure-evidence.txt
audit-reports/316-category-media-hash-validation/recovered-intentional-image-source.txt
audit-reports/316-category-media-hash-validation/recovered-intentional-image-hash.txt
audit-reports/316-category-media-hash-validation/category-media-version-diff.txt
audit-reports/316-category-media-hash-validation/intentional-update-image-hash.txt
audit-reports/316-category-media-hash-validation/focused-category-media-tests-after-intentional-update.txt
audit-reports/316-category-media-hash-validation/db-url-safety-after-intentional-update.txt
audit-reports/316-category-media-hash-validation/prisma-local-validate-after-intentional-update.txt
audit-reports/316-category-media-hash-validation/typecheck.txt
audit-reports/316-category-media-hash-validation/lint.txt
audit-reports/316-category-media-hash-validation/full-test-after-report.txt
audit-reports/316-category-media-hash-validation/build.txt
audit-reports/316-category-media-hash-validation/prisma-generate-lock-check.txt
audit-reports/316-category-media-hash-validation/prisma-generate-status.txt
```

## Exact Staged/Committed Files

The final Step 316 staging set contains only these files and directories:

```txt
public/assets/categories/toys-collectibles.jpg
src/shared/category-media.ts
audit-reports/316-category-media-hash-validation/
audit-reports/316_CATEGORY_MEDIA_HASH_VALIDATION_BLOCKER.md
audit-reports/316_NEXT_PROMPT_DRAFT.md
```

Category SVG files and upload/orphan directories were not staged.

## Remaining Risks

The category SVG files remain dirty user-owned edits outside this step. They need their own approval and validation step if they should be kept.

The untracked admin banner upload directory remains outside this step and should be handled only by a dedicated upload/orphan media decision.

## Recommended Next Step

Run a narrow Step 317 decision pass for the remaining dirty category SVG edits and untracked admin banner upload directory, without touching the now-fixed Toys & Collectibles JPG/version pair.
