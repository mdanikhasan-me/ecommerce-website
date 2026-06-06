# Step 312 Navbar Categories Dropdown Redesign

## Scope

Redesigned only the desktop global navbar `Categories` dropdown to match the supplied mega-menu direction. No Help page, homepage hero/banner, homepage category cards, footer, `/category` page, product media, DB, Prisma schema, package, env, payment, tracking, seller, Flash Deals, sale, or collections work was performed.

## Dropdown Redesign Summary

- Replaced the compact desktop category menu with a centered mega panel.
- Added a left department rail with the eight existing top-level storefront categories.
- Added a right selected-category panel defaulting to `Electronics`.
- Rendered Electronics subcategory tiles for `Mobile Phones`, `Laptops`, `Audio`, and `Wearables`, followed by a final `View all electronics` tile.
- Kept the redesign scoped to desktop navbar dropdown markup; the mobile header remains the existing compact icon header.

## Current-To-Target Visual Match Notes

- The new menu follows the target structure: large white panel, left category rail, right category heading, icon-led subcategory tiles, and a `View all` tile.
- The final desktop capture shows the five Electronics tiles on one row at `1536x864`, matching the supplied desktop direction more closely than the previous wrapped layout.
- Boilabin's existing warm-white surfaces, current navbar spacing, local category icon style, and subtle chevrons are retained instead of pixel-copying the reference.
- No product photos, remote imagery, or decorative SVG hero work was added to the dropdown.

## Icon And Local Asset Strategy

- Reused existing local category SVGs through `LocalIcon` and `STOREFRONT_ICON_ASSETS`.
- Added three small local UI icons for the subcategory tiles:
  - `public/assets/icons/ui/laptop.svg`
  - `public/assets/icons/ui/headphones.svg`
  - `public/assets/icons/ui/watch.svg`
- Reused existing `phone` and `grid` UI icons.
- No remote icon URLs or hotlinked assets were introduced.
- Existing user-owned category SVG edits under `public/assets/icons/ui/categories/*.svg` were not modified by this step and must remain unstaged.

## Route And Link Mapping

Desktop rail links:

| Label | Route |
| --- | --- |
| Electronics | `/category/electronics` |
| Fashion | `/category/fashion` |
| Home & Appliances | `/category/home-appliances` |
| Beauty & Health | `/category/beauty-health` |
| Sports & Fitness | `/category/sports-fitness` |
| Books & Stationery | `/category/books-stationery` |
| Gaming | `/category/gaming` |
| Toys & Collectibles | `/category/toys-collectibles` |

Electronics tile links:

| Label | Route |
| --- | --- |
| Mobile Phones | `/category/mobile-phones` |
| Laptops | `/category/laptops` |
| Audio | `/category/audio` |
| Wearables | `/category/wearables` |
| View all electronics | `/category/electronics` |

No `/deals`, `/collections`, `/payments`, or other fake storefront routes were introduced.

## Accessibility Behavior

- The Categories trigger keeps `aria-haspopup`, `aria-expanded`, and `aria-controls`.
- The open panel uses `role="region"` and `aria-label="Categories menu"`.
- Rail items expose selected state with `data-selected` and `aria-current`.
- Focus opens the dropdown; focusing a rail item selects that department.
- Escape, outside click, route change, mouse leave, and blur outside the menu close the dropdown.
- Links keep focus-visible outlines.

## Screenshot QA Summary

Evidence file:

```txt
audit-reports/312-navbar-categories-dropdown-redesign/browser-dropdown-evidence.json
```

Screenshots:

```txt
audit-reports/312-navbar-categories-dropdown-redesign/screenshots/desktop-home-dropdown-1920x1080.png
audit-reports/312-navbar-categories-dropdown-redesign/screenshots/desktop-home-dropdown-1536x864.png
audit-reports/312-navbar-categories-dropdown-redesign/screenshots/desktop-home-dropdown-1366x768.png
audit-reports/312-navbar-categories-dropdown-redesign/screenshots/desktop-help-dropdown-1536x864.png
audit-reports/312-navbar-categories-dropdown-redesign/screenshots/mobile-home-header-390x844.png
```

Screenshot evidence summary:

- `screenshotCount`: 5
- `allDropdownsOpen`: true
- `allRailsVisible`: true
- `allRightPanelsVisible`: true
- `electronicsSelectedByDefault`: true
- `subcategoryTilesVisible`: true
- `viewAllElectronicsVisibleAndLast`: true
- `noHorizontalOverflow`: true
- `noConsoleRuntimeHydrationErrors`: true
- `noFailedLocalIconRequests`: true
- `mobileHeaderStillOkay`: true
- `pass`: true

The in-app Browser surface was not available in this session, so the screenshot evidence used an isolated local Edge/Chrome CDP capture against a fresh production server on `127.0.0.1:3122`. The temporary server and temporary browser profile were removed after capture.

## Validation Results

| Command | Result |
| --- | --- |
| `git status --short` | Reviewed; Step 312 files plus unrelated user-owned category SVG edits present. |
| `npm run db:url:safety` | Pass. Local DB and shadow DB URL-shape guardrails passed; no DB connection attempted. |
| `npm run db:prisma:local:validate` | Pass. Prisma schema is valid. |
| `npm run db:prisma:local:generate` | Blocked by Windows `EPERM` rename lock; see Prisma section. |
| `npm run typecheck` | Pass. |
| `npm run lint` | Pass. `next lint` reports no warnings/errors; deprecation notice only. |
| `npm test` | Pass. 536 tests passed, 0 failed. |
| `npm run build` | Pass. Production build compiled, type/lint checks passed, and 72 static pages generated. |

Focused Step 312 validation also passed:

```txt
npx tsx --test tests/navbar-categories-dropdown-redesign.test.ts tests/help-navbar-redesign.test.ts tests/navbar-banner-footer-polish.test.ts
```

Result: 14 tests passed, 0 failed.

## Prisma Generate Status

`npm run db:prisma:local:generate` failed with:

```txt
EPERM: operation not permitted, rename 'node_modules\.prisma\client\query_engine-windows.dll.node.tmp35720' -> 'node_modules\.prisma\client\query_engine-windows.dll.node'
```

Likely local lock holders identified and left untouched:

| Port | Process tree |
| --- | --- |
| 3108 | `28032` npm -> `35216` cmd -> `29140` node `next start -p 3108` |
| 3000 | `36468` npm -> `20072` cmd -> `22932` node `next dev` -> `37080` node `start-server.js` |

No process was killed for the Prisma generate failure.

## Exact Files Changed

Source and tests:

```txt
src/frontend/components/layout/Header.tsx
src/shared/storefront-icons.ts
public/assets/icons/ui/headphones.svg
public/assets/icons/ui/laptop.svg
public/assets/icons/ui/watch.svg
tests/navbar-categories-dropdown-redesign.test.ts
```

Evidence and reports:

```txt
audit-reports/312-navbar-categories-dropdown-redesign/browser-dropdown-evidence.json
audit-reports/312-navbar-categories-dropdown-redesign/screenshots/desktop-home-dropdown-1920x1080.png
audit-reports/312-navbar-categories-dropdown-redesign/screenshots/desktop-home-dropdown-1536x864.png
audit-reports/312-navbar-categories-dropdown-redesign/screenshots/desktop-home-dropdown-1366x768.png
audit-reports/312-navbar-categories-dropdown-redesign/screenshots/desktop-help-dropdown-1536x864.png
audit-reports/312-navbar-categories-dropdown-redesign/screenshots/mobile-home-header-390x844.png
audit-reports/312_NAVBAR_CATEGORIES_DROPDOWN_REDESIGN.md
audit-reports/312_NEXT_PROMPT_DRAFT.md
```

## Guardrail Confirmation

- No DB rows were mutated.
- No Prisma schema or migration files were edited.
- No category page UI, Help page, footer, homepage hero/banner, homepage category cards, product media, product lifecycle, seller, payment, tracking, env, package, or route feature files were edited.
- No remote icons, remote dropdown imagery, fake sale route, fake collection route, or fake payment route were introduced.
- User-owned category SVG edits remain unstaged and outside this Step 312 commit.

## Commit

Exact Step 312 files staged are the files listed in `Exact Files Changed`. The final commit hash is reported in the assistant final response after `git commit`; it is not embedded in this committed report because this file is part of that same commit.

## Remaining Risks

- The dropdown category list is still static in `Header.tsx`, matching the existing navbar pattern. Future DB-driven category navigation would need a separate scoped data-contract step.
- Some subcategory routes depend on current seeded category slugs existing in the local dataset.
- Prisma generate remains blocked until the local Next process lock is released.

## Recommended Next Step

Step 313 should return to the previously identified source-code cleanup-readiness item: repair admin cleanup path resolution for approved subcategory managed media paths under `/assets/categories/subcategories/**`, without deleting media or mutating DB rows.
