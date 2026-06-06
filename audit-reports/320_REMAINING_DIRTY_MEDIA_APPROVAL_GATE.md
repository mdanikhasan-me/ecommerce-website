# Step 320 Remaining Dirty Media Approval Gate

## Scope

Step 320 is a report-only approval gate for the remaining dirty media after Step 319.

No source code, tests, SVG assets, upload files, DB rows, env files, Prisma schema/migrations, package files, storefront visuals, payment/tracking/seller code, or admin runtime behavior were changed.

Latest commit before Step 320:

```text
49931a9 fix: resolve subcategory media cleanup paths
```

## Baseline Worktree

The baseline dirty set is intentionally limited to user-owned/protected media:

```text
M  public/assets/icons/ui/categories/beauty-health.svg
M  public/assets/icons/ui/categories/books-stationery.svg
M  public/assets/icons/ui/categories/electronics.svg
M  public/assets/icons/ui/categories/fashion.svg
M  public/assets/icons/ui/categories/gaming.svg
M  public/assets/icons/ui/categories/home-appliances.svg
M  public/assets/icons/ui/categories/sports-fitness.svg
M  public/assets/icons/ui/categories/toys-collectibles.svg
?? public/uploads/admin/banners/hero/
```

Evidence:

- `audit-reports/320-remaining-dirty-media-approval-gate/baseline-git-status.txt`
- `audit-reports/320-remaining-dirty-media-approval-gate/baseline-diff-name-only.txt`

## Category SVG Classification

The eight dirty category SVG files are active storefront icon assets mapped through `src/shared/storefront-icons.ts` and rendered through the local icon pipeline.

Diff summary:

```text
8 files changed, 21 insertions(+), 47 deletions(-)
```

Per-file numstat:

```text
1  7  public/assets/icons/ui/categories/beauty-health.svg
3  5  public/assets/icons/ui/categories/books-stationery.svg
2  7  public/assets/icons/ui/categories/electronics.svg
3  4  public/assets/icons/ui/categories/fashion.svg
3  6  public/assets/icons/ui/categories/gaming.svg
3  5  public/assets/icons/ui/categories/home-appliances.svg
3  8  public/assets/icons/ui/categories/sports-fitness.svg
3  5  public/assets/icons/ui/categories/toys-collectibles.svg
```

Git emitted LF-to-CRLF working-copy warnings while summarizing several SVG diffs. That is not a failure, but it is another reason these files should go through an explicit asset approval and visual validation step before staging.

Decision: do not stage or restore these SVGs in Step 320. They need owner approval for either keep-and-validate or restore.

Evidence:

- `audit-reports/320-remaining-dirty-media-approval-gate/category-svg-diff-stat.txt`
- `audit-reports/320-remaining-dirty-media-approval-gate/category-svg-diff-numstat.txt`
- `audit-reports/320-remaining-dirty-media-approval-gate/category-svg-reference-search.txt`

## Admin Hero Upload Classification

The untracked admin hero upload directory remains outside committed source control:

```text
public/uploads/admin/banners/hero/
```

Inventory summary, without printing the raw upload filename:

```text
file_count: 1
directory_count: 0
total_bytes: 86330
extensions:
.webp: 1
```

Decision: do not stage, delete, move, or rename this upload in Step 320. It needs a dedicated decision:

- keep as an admin-managed upload and validate the DB/reference owner, or
- intentionally remove it only after a dedicated upload/orphan cleanup step, or
- move it to source assets only if explicitly approved as a canonical asset.

Evidence:

- `audit-reports/320-remaining-dirty-media-approval-gate/upload-hero-inventory-summary.txt`

## Guardrail Confirmation

Step 320 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- Step 314 admin banner upload implementation
- Step 315 restored source banner asset
- Step 316 Toys & Collectibles JPG/version pair
- Step 319 admin media cleanup code
- Prisma schema/migrations
- DB rows
- env files
- package files
- payment, tracking, seller, or storefront visual code

No seed, reset, db push, destructive SQL, migration, provider CLI, or package update was run.

## Validation Results

Docs/evidence validation for this report-only step passed:

- `git diff --check -- audit-reports/320_REMAINING_DIRTY_MEDIA_APPROVAL_GATE.md audit-reports/320_NEXT_PROMPT_DRAFT.md audit-reports/320-remaining-dirty-media-approval-gate` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed and detected latest audit report `audit-reports/320_REMAINING_DIRTY_MEDIA_APPROVAL_GATE.md`.
- `node scripts/boilabin-advisor-state.mjs` passed and detected latest audit report `audit-reports/320_REMAINING_DIRTY_MEDIA_APPROVAL_GATE.md`.
- `npx tsx --test tests/local-icon-assets.test.ts tests/navbar-categories-dropdown-redesign.test.ts tests/category-page-uiux.test.ts` passed: 18 tests, 0 failures.

Full `npm test` and `npm run build` were not rerun because Step 320 changed only audit/report evidence and intentionally did not change source code, tests, runtime media, or committed assets. Step 319 already completed full validation before this docs-only approval gate.

Evidence:

- `audit-reports/320-remaining-dirty-media-approval-gate/validation-diff-check.txt`
- `audit-reports/320-remaining-dirty-media-approval-gate/validation-terminal-loop-state.txt`
- `audit-reports/320-remaining-dirty-media-approval-gate/validation-advisor-state.txt`
- `audit-reports/320-remaining-dirty-media-approval-gate/validation-focused-icon-category-tests.txt`
- `audit-reports/320-remaining-dirty-media-approval-gate/pre-stage-git-status.txt`

## Files To Stage

Stage only Step 320 report/evidence files:

- `audit-reports/320_REMAINING_DIRTY_MEDIA_APPROVAL_GATE.md`
- `audit-reports/320_NEXT_PROMPT_DRAFT.md`
- `audit-reports/320-remaining-dirty-media-approval-gate/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG edits may be intended, but they are active storefront icons and still need explicit owner approval plus browser visual checks.
- The untracked hero upload may be a legitimate admin upload, but it is not source-controlled and should not be committed without an ownership decision.
- No media deletion ledger or provider object-storage policy exists yet.

## Recommended Next Step

Run Step 321 as a dedicated media approval decision step. The user should choose whether to keep or restore the eight category SVG icon edits, and whether the one untracked admin hero `.webp` upload should remain managed upload media, be removed as orphaned upload media, or be promoted to a source asset. Only after that decision should the next step run focused tests and browser screenshots before exact-file staging.
