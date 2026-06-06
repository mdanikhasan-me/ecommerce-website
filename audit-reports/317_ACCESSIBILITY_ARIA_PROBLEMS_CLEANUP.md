# Step 317 Accessibility ARIA Problems Cleanup

## Summary

Step 317 cleaned up active-source ARIA state and role patterns that can show up in VS Code / Microsoft Edge Tools as invalid `{expression}` ARIA values.

The quoted literal anti-pattern scan found no active-source matches like `aria-expanded="{isOpen}"`, but the whole-project state scan found direct TSX expression attributes in active source that match the visible Problems wording.

## Root Cause

The active source did not contain quoted literal ARIA strings. Instead, the likely Problems root was direct TSX expression attributes for ARIA state/role values, such as:

```txt
aria-expanded={isOpen}
aria-checked={selected}
aria-pressed={isSelected}
aria-current={isSelected ? 'page' : undefined}
aria-hidden={decorative ? true : undefined}
role={decorative ? undefined : 'img'}
```

Those are valid React patterns, but source analyzers can surface them as `{expression}` instead of evaluating the rendered DOM value. Step 317 moved the problem-prone state attributes behind typed helpers that emit valid ARIA strings, and rewrote `LocalIcon` so decorative and meaningful icon branches use static ARIA/role attributes.

## Five-Lane Review

### Lane 1 - ARIA Syntax Inspector

Required literal scan:

```txt
rg/node scan for (aria-*|role)="\{...\}"
```

Result:

```txt
before: 0 quoted literal ARIA/role matches
after: 0 quoted literal ARIA/role matches
```

Problem-prone direct state/role scan before found:

```txt
src/frontend/components/ui/LocalIcon.tsx
src/frontend/components/product/SearchFiltersPanel.tsx
src/frontend/components/product/MobileSearchFilters.tsx
src/frontend/components/layout/Header.tsx
src/app/(store)/category/page.tsx
src/app/(admin)/admin/settings/page.tsx
```

After the fix:

```txt
0 direct dynamic TSX state/role matches for aria-expanded, aria-checked, aria-hidden, aria-pressed, aria-selected, aria-current, aria-invalid, or role.
```

### Lane 2 - Component Semantics Inspector

Reviewed:

```txt
Header.tsx
MobileSearchFilters.tsx
SearchFiltersPanel.tsx
LocalIcon.tsx
category/page.tsx
admin/settings/page.tsx
```

The changes keep the existing UI behavior and route structure. No visual redesign was made.

### Lane 3 - Accessibility Behavior Inspector

Confirmed:

```txt
aria-expanded values are emitted through typed true/false helpers.
aria-pressed values are emitted through typed true/false helpers.
aria-current is emitted only when the category link is current.
LocalIcon decorative icons render aria-hidden="true".
LocalIcon meaningful icons render role="img" with an accessible label.
Product rating filters no longer use radio semantics for a control that can clear itself; they now use native buttons with aria-pressed.
```

### Lane 4 - Static Tooling/Test Inspector

Added:

```txt
tests/accessibility-aria-problems.test.ts
```

Updated:

```txt
tests/storefront-product-card-filter-ui.test.ts
```

The new test rejects quoted literal ARIA/role expression values and rejects direct dynamic TSX state/role attributes for the attributes that triggered the Problems cleanup.

### Lane 5 - Browser/Problems Reproduction Inspector

In-app Browser was attempted but unavailable in this session:

```txt
Browser is not available: iab
```

Fallback browser QA used the repo's Edge/CDP smoke helper:

```txt
node scripts/local-browser-runtime-check.mjs --mode dev --port 3117 --cdp-port 9417 --startup-timeout-ms 90000 --request-timeout-ms 20000
```

The helper launched Microsoft Edge against a temporary fresh dev server and then stopped its own processes.

Step 317-relevant result:

```txt
No remaining active-source invalid ARIA/role literal patterns.
No remaining direct dynamic TSX state/role attributes for the problem-prone ARIA/role list.
Focused routes including /category/toys-collectibles and /search?q=phone rendered without broken images, horizontal overflow, unnamed buttons, failed requests, or server/image failures in the smoke output.
```

Fallback smoke nonzero items were classified unrelated/pre-existing:

```txt
Homepage Next.js 16 future image localPatterns query-string warnings.
One NextAuth ClientFetchError during /category/electronics mobile-390 session fetch.
Mobile search focus helper miss in the existing browser smoke path.
```

## Files Fixed

```txt
src/frontend/components/ui/aria.ts
src/frontend/components/ui/LocalIcon.tsx
src/frontend/components/layout/Header.tsx
src/frontend/components/product/MobileSearchFilters.tsx
src/frontend/components/product/SearchFiltersPanel.tsx
src/app/(store)/category/page.tsx
src/app/(admin)/admin/settings/page.tsx
tests/accessibility-aria-problems.test.ts
tests/storefront-product-card-filter-ui.test.ts
```

## Header Changes

`Header.tsx` now uses typed `ariaExpanded` / `ariaPressed` helpers for:

```txt
desktop categories trigger
desktop category rail selected state
desktop search trigger
account menu trigger
mobile search trigger
```

No navbar/dropdown/header visual redesign happened.

## Product Filters / Mobile Filters / LocalIcon Changes

`MobileSearchFilters.tsx` now uses `ariaExpanded(open)` for the filter dialog trigger.

`SearchFiltersPanel.tsx` changed minimum-rating controls from custom `role="radio"` buttons to native buttons with typed `ariaPressed(selected)`, matching the actual select-or-clear behavior.

`LocalIcon.tsx` now renders decorative and meaningful icon branches separately:

```txt
decorative: aria-hidden="true"
meaningful: role="img" plus aria-label
```

## Guardrail Confirmation

Step 314 admin banner upload code was untouched.

Step 315 source banner asset was untouched:

```txt
public/assets/banners/home-hero-iphone-15-pro.jpg
```

Step 316 Toys & Collectibles JPG/version pair was untouched:

```txt
public/assets/categories/toys-collectibles.jpg
src/shared/category-media.ts
```

Category SVG edits were untouched and unstaged:

```txt
public/assets/icons/ui/categories/*.svg
```

The untracked upload directory was untouched and unstaged:

```txt
public/uploads/admin/banners/hero/
```

No DB mutation happened. No seed, reset, migration, db push, destructive SQL, package update, or external package add was run.

## Validation

| Command | Result |
| --- | --- |
| `npx tsx --test tests/accessibility-aria-problems.test.ts tests/storefront-product-card-filter-ui.test.ts tests/help-navbar-redesign.test.ts tests/navbar-categories-dropdown-redesign.test.ts tests/navbar-banner-footer-polish.test.ts tests/category-page-uiux.test.ts` | Pass, 34 tests |
| `npm run db:url:safety` | Pass |
| `npm run db:prisma:local:validate` | Pass |
| `npm run typecheck` | Pass |
| `npm run lint` | Pass |
| `npm test` | Pass, 549 tests |
| `npm run build` | Pass |

## Prisma Generate Status

`npm run db:prisma:local:generate` was not run because the known local Windows Prisma/Next lock risk remains. Active listeners were present:

```txt
port 3000 owner PID 5144
port 3108 owner PID 29140
```

No processes were killed.

## Evidence

```txt
audit-reports/317-accessibility-aria-problems-cleanup/baseline-git-status.txt
audit-reports/317-accessibility-aria-problems-cleanup/lane1-aria-role-inventory-before.txt
audit-reports/317-accessibility-aria-problems-cleanup/lane1-invalid-literal-aria-node-before.txt
audit-reports/317-accessibility-aria-problems-cleanup/lane1-invalid-literal-aria-node-after.txt
audit-reports/317-accessibility-aria-problems-cleanup/lane1-direct-dynamic-state-after.txt
audit-reports/317-accessibility-aria-problems-cleanup/focused-static-tests.txt
audit-reports/317-accessibility-aria-problems-cleanup/browser-plugin-status.txt
audit-reports/317-accessibility-aria-problems-cleanup/browser-runtime-check.json
audit-reports/317-accessibility-aria-problems-cleanup/browser-qa-summary.txt
audit-reports/317-accessibility-aria-problems-cleanup/db-url-safety.txt
audit-reports/317-accessibility-aria-problems-cleanup/prisma-local-validate.txt
audit-reports/317-accessibility-aria-problems-cleanup/typecheck.txt
audit-reports/317-accessibility-aria-problems-cleanup/lint.txt
audit-reports/317-accessibility-aria-problems-cleanup/prisma-generate-lock-check.txt
audit-reports/317-accessibility-aria-problems-cleanup/full-test.txt
audit-reports/317-accessibility-aria-problems-cleanup/build.txt
```

## Exact Staging Set

Stage only these Step 317 files:

```txt
src/frontend/components/ui/aria.ts
src/frontend/components/ui/LocalIcon.tsx
src/frontend/components/layout/Header.tsx
src/frontend/components/product/MobileSearchFilters.tsx
src/frontend/components/product/SearchFiltersPanel.tsx
src/app/(store)/category/page.tsx
src/app/(admin)/admin/settings/page.tsx
tests/accessibility-aria-problems.test.ts
tests/storefront-product-card-filter-ui.test.ts
audit-reports/317-accessibility-aria-problems-cleanup/
audit-reports/317_ACCESSIBILITY_ARIA_PROBLEMS_CLEANUP.md
audit-reports/317_NEXT_PROMPT_DRAFT.md
```

Do not stage category SVG files or upload/orphan directories.

## Remaining Risks

The fallback Edge/CDP browser smoke still reports unrelated/pre-existing nonzero items listed above. They were not caused by Step 317 ARIA source edits and should be handled only in a dedicated browser-runtime cleanup step.

The category SVG files and admin banner upload directory remain dirty/untracked outside Step 317.

## Recommended Next Step

Run a narrow Step 318 browser-runtime cleanup decision pass for the existing Edge/CDP smoke warnings and mobile-search helper issue, while leaving Step 314, Step 315, Step 316, Step 317, category SVG edits, and upload/orphan media untouched unless explicitly approved.
