# Step 383 - Homepage Commercial Hierarchy + Header Dropdown Polish

## Scope

- Previous HEAD: `36200ee`
- Guardrails honored:
  - Did not touch payment, checkout, footer payment logos, seller/auth/security, database schema, migrations, or Step 382 category media storage logic.
  - Did not touch `public/assets/icons/ui/categories/*.svg`.
  - Did not touch `public/uploads/admin/banners/hero/`.
  - Did not add fake products or fake sales data.

## Homepage Order

Previous homepage order:

1. Hero/banner
2. Shop by Category
3. Featured Products
4. Best Sellers
5. New Arrivals
6. Existing footer/support sections

New homepage order:

1. Hero/banner
2. Featured Products
3. Shop by Category
4. Best Sellers
5. New Arrivals
6. Existing footer/support sections

Featured Products is available and not empty in the current app data: 8 buyer-visible products were found. Best Sellers is also real catalog data: 8 buyer-visible products filtered by `isBestSeller: true` and sorted by `soldCount`, not a fake fallback.

Empty-section behavior:

- Featured Products renders only when `featured.length > 0`.
- If Featured Products is empty and Best Sellers has products, Best Sellers becomes the first post-hero commercial product section.
- Best Sellers is not duplicated when used as that fallback lead product section.
- Category, Best Sellers, and New Arrivals sections continue to be skipped when their data is empty.

## Header Dropdown Root Cause

The desktop Categories dropdown had three fragile interaction paths:

- The Categories button only opened the dropdown; it did not toggle closed on a second click.
- `onFocus={openCategoriesDropdown}` also reset the selected category to Electronics, so focus transitions could override a category row click.
- The dropdown root used `onBlur` to close the menu. Some internal clicks can report an incomplete `relatedTarget`, which made row clicks close the menu before the row state update felt reliable.

Fix:

- Replaced the open-only handler with `toggleCategoriesDropdown`.
- Removed the focus-open reset path and blur-close path.
- Kept document outside-click and Escape dismissal.
- Internal category row buttons now only update selected state.
- Navigation links still close the dropdown intentionally.
- The dropdown shell now has stable desktop dimensions: `h-[25rem]`, `max-h-[calc(100vh-7rem)]`, and a full-height two-column grid.

Browser metrics confirmed stable dropdown shell size:

- `1250x900`: width `960`, height `400` across Electronics, Fashion, Sports & Fitness, and Toys & Collectibles.
- `1520x900`: width `960`, height `400` across Electronics, Fashion, Sports & Fitness, and Toys & Collectibles.

Interaction checks passed:

- Categories button opens and closes on repeated clicks.
- Internal category switching stays open and updates the active row/panel immediately.
- Outside click closes.
- Escape closes.
- Toys & Collectibles does not resize or collapse the shell.

## Profile Avatar Rule

Implemented display readiness only:

- Logged-out users still see the default profile icon.
- Logged-in users without a session image still see the default profile icon.
- Logged-in users with `session.user.image` render that image in desktop account, mobile profile, and mobile menu account surfaces.
- Broken/missing image loads fall back to the default profile icon through `HeaderAvatar` `onError` state.
- No Google OAuth setup, secrets, provider config, or fake auth data was added.

## Files Changed

- `src/app/(store)/page.tsx`
- `src/frontend/components/layout/Header.tsx`
- `tests/homepage-product-grid-rhythm.test.ts`
- `tests/navbar-categories-dropdown-redesign.test.ts`
- `audit-reports/383-homepage-commercial-hierarchy.md`
- `audit-reports/383-homepage-commercial-hierarchy/browser-qa-metrics.json`
- `audit-reports/383-homepage-commercial-hierarchy/screenshots/*.png`
- `audit-reports/383-homepage-commercial-hierarchy/validation-*.txt`

## Screenshot Evidence

Homepage:

- `audit-reports/383-homepage-commercial-hierarchy/screenshots/homepage-1520x900.png`
- `audit-reports/383-homepage-commercial-hierarchy/screenshots/homepage-1250x900.png`
- `audit-reports/383-homepage-commercial-hierarchy/screenshots/homepage-1024x900.png`
- `audit-reports/383-homepage-commercial-hierarchy/screenshots/homepage-390x844.png`

Dropdown:

- `audit-reports/383-homepage-commercial-hierarchy/screenshots/dropdown-1250x900-electronics.png`
- `audit-reports/383-homepage-commercial-hierarchy/screenshots/dropdown-1250x900-fashion.png`
- `audit-reports/383-homepage-commercial-hierarchy/screenshots/dropdown-1250x900-sports-fitness.png`
- `audit-reports/383-homepage-commercial-hierarchy/screenshots/dropdown-1250x900-toys-collectibles.png`
- `audit-reports/383-homepage-commercial-hierarchy/screenshots/dropdown-1520x900-electronics.png`
- `audit-reports/383-homepage-commercial-hierarchy/screenshots/dropdown-1520x900-fashion.png`
- `audit-reports/383-homepage-commercial-hierarchy/screenshots/dropdown-1520x900-sports-fitness.png`
- `audit-reports/383-homepage-commercial-hierarchy/screenshots/dropdown-1520x900-toys-collectibles.png`

Mobile header sanity:

- `audit-reports/383-homepage-commercial-hierarchy/screenshots/mobile-header-menu-390x844.png`

Metrics:

- `audit-reports/383-homepage-commercial-hierarchy/browser-qa-metrics.json`

## Visual QA

- Homepage at `1250x900` now shows Hero -> Featured Products immediately, then category and product sections later.
- Mobile `390x844` also starts commerce with Featured Products directly after the hero.
- Product cards remain compact and use the existing shared `ProductGrid` rhythm.
- Category cards still appear after products and remain polished.
- The removed dark New Arrivals promo band remains absent.
- No horizontal overflow was reported in browser metrics.

Remaining visual concerns:

- None found inside this step's scope.

## Validation

- `npm run typecheck` - PASS
- `npm run lint` - PASS (`next lint` deprecation notice only)
- Focused tests - PASS, 19 tests
- `npm test` - PASS, 722 tests
- `npm run build` - PASS
