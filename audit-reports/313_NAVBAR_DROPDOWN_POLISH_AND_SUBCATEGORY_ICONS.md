# Step 313 Navbar Dropdown Polish And Subcategory Icons

## Scope

This was a focused desktop navbar `Categories` dropdown polish pass after Step 312. It did not redesign the Help page, homepage hero/banner/category cards, footer, `/category` page, product/media work, payment, tracking, seller, sale, collections, Flash Deals, env, packages, DB rows, Prisma schema, or migrations.

## What Was Wrong After Step 312

- The desktop dropdown was structurally correct but visually oversized.
- The panel height, rail row height, right-panel spacing, tile height, tile icon size, and text weights felt closer to a modal than a compact premium menu.
- The Step 312 subcategory icons were placed directly under `public/assets/icons/ui/`, mixing one-off subcategory assets with shared UI icons.
- The dropdown opened and switched categories too aggressively on hover.

## Visual Scale Reductions

Source-level reductions:

| Area | Step 312 | Step 313 |
| --- | --- | --- |
| Panel max width | `70rem` | `60rem` |
| Panel min height | `25rem` | `18rem` |
| Rail width | `17.5rem` | `15.75rem` |
| Rail padding | `p-5` | `p-3` |
| Rail row min height | `3.85rem` | `2.75rem` |
| Rail text | `15px` | `13px` |
| Right panel padding | `px-12 py-11` | `px-8 py-8` |
| Category heading | `1.45rem` | `text-xl` |
| Heading icon container | `4rem` | `3rem` |
| Tile top gap | `mt-14` | `mt-8` |
| Tile min height | `10rem` | `7.5rem` |
| Tile icon | `h-11 w-11` | `h-8 w-8` |
| Tile label | `text-sm font-semibold` | `13px font-medium` |

Measured Step 313 screenshot evidence:

| Viewport | Panel | First tile | First tile icon | Heading | Tile label |
| --- | --- | --- | --- | --- | --- |
| Desktop home `1920x1080` | `960 x 392` | `115.6 x 120` | `32 x 32` | `20px` | `13px` |
| Desktop home `1536x864` | `960 x 392` | `115.6 x 120` | `32 x 32` | `20px` | `13px` |
| Desktop home `1366x768` | `960 x 392` | `115.6 x 120` | `32 x 32` | `20px` | `13px` |
| Desktop help `1536x864` | `960 x 392` | `115.6 x 120` | `32 x 32` | `20px` | `13px` |

The five Electronics tiles remain on one row at `1366px`, `1536px`, and `1920px`, with no horizontal overflow.

## Subcategory Icon Folder Strategy

Main category icons remain owned by:

```txt
public/assets/icons/ui/categories/
```

Dropdown subcategory icons are now owned by:

```txt
public/assets/icons/ui/subcategories/
```

Added:

```txt
public/assets/icons/ui/subcategories/mobile-phone.svg
public/assets/icons/ui/subcategories/laptop.svg
public/assets/icons/ui/subcategories/headphones.svg
public/assets/icons/ui/subcategories/watch.svg
public/assets/icons/ui/subcategories/grid.svg
```

Removed because no longer referenced after the mapping change:

```txt
public/assets/icons/ui/laptop.svg
public/assets/icons/ui/headphones.svg
public/assets/icons/ui/watch.svg
```

`phone` and `grid` remain available as shared UI icons for existing surfaces, but the dropdown uses dedicated `subcategory-mobile-phone` and `subcategory-grid` mappings so subcategory ownership is explicit.

No remote icons, external icon URLs, or new icon libraries were introduced.

## Category SVG Untouched Confirmation

No Step 313 edits were made to:

```txt
public/assets/icons/ui/categories/*.svg
```

Those files were already dirty before this step and remain unstaged.

## Interaction Behavior Changes

- Removed hover-open from the desktop Categories nav root.
- Removed mouse-leave auto-close from the desktop Categories nav root.
- Removed hover-driven left-rail category selection.
- The navbar trigger opens the dropdown on click/focus.
- Rail category buttons select the right panel on click/focus.
- Rail route chevrons remain links to the category routes.
- Escape, outside click, route change, and blur outside still close the dropdown.

Evidence confirms:

- `opensByClick`: true
- `noAggressiveHoverOpen`: true
- `railHoverDoesNotSwitch`: true
- `railClickSelectsCategory`: true
- `electronicsSelectedAfterRestore`: true

## Accessibility Behavior

- The Categories trigger keeps `aria-haspopup`, `aria-expanded`, and `aria-controls`.
- The dropdown panel keeps `role="region"` and `aria-label="Categories menu"`.
- Rail selection controls use buttons with `aria-pressed`.
- Category route access remains keyboard reachable through focused rail chevron links.
- Focus-visible outlines remain on trigger, rail buttons, rail route links, and subcategory tiles.
- Escape, blur outside, outside click, and route-change dismissal remain wired.

## Route And Link Mapping

Electronics tiles:

| Label | Route |
| --- | --- |
| Mobile Phones | `/category/mobile-phones` |
| Laptops | `/category/laptops` |
| Audio | `/category/audio` |
| Wearables | `/category/wearables` |
| View all electronics | `/category/electronics` |

Main rail route chevrons:

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

No `/deals`, `/collections`, `/payments`, sale, or fake payment routes were introduced.

## Screenshot QA Results

Evidence file:

```txt
audit-reports/313-navbar-dropdown-polish/browser-dropdown-polish-evidence.json
```

Screenshots:

```txt
audit-reports/313-navbar-dropdown-polish/screenshots/desktop-home-dropdown-1920x1080.png
audit-reports/313-navbar-dropdown-polish/screenshots/desktop-home-dropdown-1536x864.png
audit-reports/313-navbar-dropdown-polish/screenshots/desktop-home-dropdown-1366x768.png
audit-reports/313-navbar-dropdown-polish/screenshots/desktop-help-dropdown-1536x864.png
audit-reports/313-navbar-dropdown-polish/screenshots/mobile-home-header-390x844.png
```

Evidence summary:

- `screenshotCount`: 5
- `allDropdownsOpen`: true
- `opensByClick`: true
- `noAggressiveHoverOpen`: true
- `railHoverDoesNotSwitch`: true
- `railClickSelectsCategory`: true
- `subcategoryTilesVisible`: true
- `viewAllElectronicsVisibleAndLast`: true
- `subcategoryIconsFromDedicatedFolder`: true
- `categoryIconsStillFromCategoryFolder`: true
- `scaleReducedAgainstStep312Css`: true
- `noHorizontalOverflow`: true
- `noConsoleRuntimeHydrationErrors`: true
- `noFailedLocalIconRequests`: true
- `mobileHeaderStillOkay`: true
- `pass`: true

The in-app Browser surface was unavailable in this session, so QA used an isolated Edge/Chrome CDP capture against a temporary local production server on `127.0.0.1:3133`. The temporary server, capture runner, and browser profile were removed.

## Validation Results

| Command | Result |
| --- | --- |
| `git status --short` | Reviewed; Step 313 files plus unrelated user-owned category SVG edits present. |
| `npm run db:url:safety` | Pass. Local DB and shadow DB URL-shape guardrails passed; no DB connection attempted. |
| `npm run db:prisma:local:validate` | Pass. Prisma schema is valid. |
| `npm run db:prisma:local:generate` | Blocked by Windows `EPERM` rename lock; see Prisma section. |
| `npm run typecheck` | Pass. |
| `npm run lint` | Pass. `next lint` reports no warnings/errors; deprecation notice only. |
| `npm test` | Pass. 537 tests passed, 0 failed. |
| `npm run build` | Pass. Production build compiled, type/lint checks passed, and 72 static pages generated. |

Focused validation also passed:

```txt
npx tsx --test tests/navbar-categories-dropdown-redesign.test.ts tests/help-navbar-redesign.test.ts tests/navbar-banner-footer-polish.test.ts
```

Result: 15 tests passed, 0 failed.

## Prisma Generate Status

`npm run db:prisma:local:generate` failed with:

```txt
EPERM: operation not permitted, rename 'node_modules\.prisma\client\query_engine-windows.dll.node.tmp36192' -> 'node_modules\.prisma\client\query_engine-windows.dll.node'
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
tests/navbar-categories-dropdown-redesign.test.ts
```

Icon files:

```txt
public/assets/icons/ui/subcategories/mobile-phone.svg
public/assets/icons/ui/subcategories/laptop.svg
public/assets/icons/ui/subcategories/headphones.svg
public/assets/icons/ui/subcategories/watch.svg
public/assets/icons/ui/subcategories/grid.svg
public/assets/icons/ui/laptop.svg
public/assets/icons/ui/headphones.svg
public/assets/icons/ui/watch.svg
```

Evidence and reports:

```txt
audit-reports/313-navbar-dropdown-polish/browser-dropdown-polish-evidence.json
audit-reports/313-navbar-dropdown-polish/screenshots/desktop-home-dropdown-1920x1080.png
audit-reports/313-navbar-dropdown-polish/screenshots/desktop-home-dropdown-1536x864.png
audit-reports/313-navbar-dropdown-polish/screenshots/desktop-home-dropdown-1366x768.png
audit-reports/313-navbar-dropdown-polish/screenshots/desktop-help-dropdown-1536x864.png
audit-reports/313-navbar-dropdown-polish/screenshots/mobile-home-header-390x844.png
audit-reports/313_NAVBAR_DROPDOWN_POLISH_AND_SUBCATEGORY_ICONS.md
audit-reports/313_NEXT_PROMPT_DRAFT.md
```

## Guardrail Confirmation

- No DB rows were mutated.
- No Prisma schema or migration files were edited.
- No Help page, footer, homepage hero/banner/category cards, `/category` page, product/media repair files, seller, payment, tracking, env, package, sale, collection, Flash Deals, or `/deals` work was touched.
- No remote icons/images, external icon URLs, or new icon library were introduced.
- User-owned category SVG edits remain unstaged and outside this Step 313 commit.

## Commit

Exact Step 313 files staged are the files listed in `Exact Files Changed`. The final commit hash is reported in the assistant final response after `git commit`; it is not embedded in this committed report because this file is part of that same commit.

## Remaining Risks

- The desktop dropdown category data remains static in `Header.tsx`, matching the existing navbar pattern.
- Main rail category navigation is now through the chevron route link so the rail label click can intentionally select the right panel.
- Prisma generate remains blocked until local Next processes release the query-engine DLL lock.

## Recommended Next Step

Step 314 should return to the source-code cleanup-readiness item: repair admin cleanup path resolution for approved subcategory managed media paths under `/assets/categories/subcategories/**`, without deleting media or mutating DB rows.
