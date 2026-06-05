# Step 287 - Storefront Card Filter Accessibility Foundation

## Scope And Starting State

Step 287 implemented the first bounded UI/UX foundation pass after the Step 286 transition inventory.

Latest starting commit:

```text
1e1313d test: add ui ux redesign readiness inventory
```

The scope was limited to repeated storefront product-card, listing filter, mobile filter, and sort controls. This was not a full-site redesign and did not change backend behavior, routes, catalog queries, checkout, payment, tracking, seller marketplace, SEO architecture, Prisma schema, migrations, or media lifecycle behavior.

The requested 18-agent responsibilities were covered through one coordinator plus six real read-only subagent groups. The coordinator was the only writer.

## Files Inspected

- `audit-reports/286_UI_UX_REDESIGN_TRANSITION_INVENTORY.md`
- `audit-reports/286-ui-ux-redesign-transition-inventory/summary.json`
- `audit-reports/286-ui-ux-redesign-transition-inventory/design-system-token-inventory.json`
- `audit-reports/286-ui-ux-redesign-transition-inventory/responsive-browser-evidence.json`
- `audit-reports/286-ui-ux-redesign-transition-inventory/ui-surface-inventory.json`
- `audit-reports/287_NEXT_PROMPT_DRAFT.md`
- `src/frontend/components/product/ProductCard.tsx`
- `src/frontend/components/product/SearchFiltersPanel.tsx`
- `src/frontend/components/product/MobileSearchFilters.tsx`
- `src/frontend/components/search/SortSelect.tsx`
- `src/app/globals.css`
- product-card usage sites in home, category, search, new-arrivals, wishlist, and related-products surfaces
- existing UI readiness/runtime/guardrail tests and browser evidence helpers

## Files Changed

Source:

- `src/frontend/components/product/ProductCard.tsx`
- `src/frontend/components/product/SearchFiltersPanel.tsx`
- `src/frontend/components/product/MobileSearchFilters.tsx`
- `src/frontend/components/search/SortSelect.tsx`

Tests:

- `tests/storefront-product-card-filter-ui.test.ts`

Reports/evidence:

- `audit-reports/287_STOREFRONT_CARD_FILTER_ACCESSIBILITY_FOUNDATION.md`
- `audit-reports/288_NEXT_PROMPT_DRAFT.md`
- `audit-reports/287-storefront-card-filter-accessibility-foundation/summary.json`
- `audit-reports/287-storefront-card-filter-accessibility-foundation/ui-surface-inventory.json`
- `audit-reports/287-storefront-card-filter-accessibility-foundation/design-system-token-inventory.json`
- `audit-reports/287-storefront-card-filter-accessibility-foundation/responsive-evidence-plan.json`
- `audit-reports/287-storefront-card-filter-accessibility-foundation/responsive-browser-evidence.json`
- `audit-reports/287-storefront-card-filter-accessibility-foundation/media-local-asset-constraint-postcheck.json`
- `audit-reports/287-storefront-card-filter-accessibility-foundation/screenshots/*.png`

## Step 286 Findings Used

Step 286 showed that `ProductCard` is the highest-leverage first UI target because it is shared by homepage grids, category listings, search results, new arrivals, wishlist, and related products.

Key inputs used:

- product-card/listing surfaces passed browser baseline but were dense on mobile;
- grid wishlist and compare controls had generic accessible names;
- filter rating controls used radio-like buttons and needed stronger grouping;
- sort select used generic labeling;
- design-system primitives are not mature enough for broad redesign yet;
- media/static-asset guardrails must remain unchanged;
- product-view POSTs must be intercepted during browser QA.

## ProductCard Issues Found

- Grid wishlist button used a static accessible name even when the item was already wished.
- Grid compare button used a generic `Compare` name even when the next action opens the compare page.
- Add-to-cart buttons were visible but not product-aware for assistive tech.
- Product links did not have explicit product-aware accessible names across the image and content link surfaces.
- Rating displays were visual text/star groups without a single product-aware rating label.
- Mobile overlay action buttons were compact, and badges could compete with the same image corner.

## Filter And Sort Issues Found

- Category, price, minimum rating, and availability groups were visually headed but not grouped with `fieldset`/`legend`.
- Rating buttons used `role="radio"` without a parent `radiogroup`.
- Price inputs were labeled with `aria-label`, but the visual/input grouping could be stronger.
- Mobile filter trigger did not expose dialog state.
- Mobile filter sheet did not identify itself as a modal dialog.
- Sort select used the generic label `Select option`.

## Accessibility Improvements Made

`ProductCard`:

- Added product-aware `productLinkLabel`.
- Added state-aware `wishlistActionLabel` for both list and grid card variants.
- Added state-aware `compareActionLabel` for grid cards.
- Added product-aware `addToCartActionLabel` for list and grid add-to-cart buttons.
- Added product-aware `ratingLabel` and exposed rating groups with `role="img"`.
- Hid decorative star icons from assistive tech where the rating group now has a single label.
- Added focus-visible rings to grid overlay action and add-to-cart controls.

`SearchFiltersPanel`:

- Converted category, price range, minimum rating, and availability sections to `fieldset`/`legend`.
- Added `role="radiogroup"` around minimum-rating radio buttons.
- Added clearer accessible labels for clear-all and apply-price actions.
- Added hidden text labels plus numeric input hints to the price range inputs.

`MobileSearchFilters`:

- Added `aria-expanded`, `aria-haspopup="dialog"`, and `aria-controls` to the filter trigger.
- Added `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` to the mobile filter sheet.
- Added stable local IDs for the mobile filter panel and title.

`SortSelect`:

- Replaced the generic `Select option` accessible name/title with `Sort products`.

## Visual And Density Improvements Made

- Grid card overlay actions now use slightly larger base touch targets.
- Grid card add-to-cart bar has a slightly taller mobile tap area.
- Grid card content padding was nudged up at the mobile base size.
- Badge stacks now cap their width within the image area and truncate rather than competing with action buttons.
- Focus states are more visible for icon and add-to-cart controls.

No global theme, header, footer, homepage hero, category image, product image, payment-logo, newsletter, or PromoSection redesign was performed.

## Behavior Preservation Result

Preserved:

- product detail link destinations;
- add-to-cart store behavior, toast behavior, and cart drawer open behavior;
- wishlist toggle behavior;
- compare add/open behavior;
- product image source selection;
- price/sale/original-price rendering;
- stock label rendering;
- category/search filter query keys;
- filter `page` reset behavior;
- search clear preserving `q`;
- category clear preserving no query parameters;
- sort query behavior and full-page navigation behavior;
- mobile filter close-on-navigation behavior;
- product-view tracking implementation.

No API route behavior, response shape, auth behavior, checkout behavior, payment behavior, tracking behavior, seller behavior, SEO architecture, product lifecycle behavior, Prisma schema, or migration behavior changed.

## Media Local-Asset Copy SEO Guardrail Result

Media:

- Remote static UI asset count remained 0.
- Missing local source asset warnings remained 0.
- No files under `public/assets` or `public/uploads` were changed.
- No media deletion, replacement, regeneration, compression, or upload-root change occurred.

Copy/SEO:

- Marketing-copy audit passed with 0 findings.
- No unsupported checkout, trust, guarantee, delivery, tracking, payment, or SLA claims were introduced.
- SEO metadata/canonical/noindex/JSON-LD source files were not changed.
- Removed promotion routes remained removed.

## Browser And Screenshot Evidence Result

Evidence directory:

- `audit-reports/287-storefront-card-filter-accessibility-foundation/`

Production browser evidence:

- route checks: 130
- screenshots: 12
- product-view POSTs intercepted locally: 10
- horizontal overflow count: 0
- broken visible image count: 0
- console error count: 0
- failed request count: 0
- server error count: 0
- browser evidence result: passed

Representative screenshots manually sampled:

- category electronics mobile 390
- category electronics desktop 1366
- search phone mobile 390
- home mobile 390
- home desktop 1366
- product detail mobile 390

The sampled screenshots rendered nonblank and did not show card collapse, distorted visible images, header/footer drift, or payment-logo/newsletter changes from this patch.

## Tests Added Or Updated

Added:

- `tests/storefront-product-card-filter-ui.test.ts`

Coverage:

- ProductCard wishlist labels are product-aware and state-aware.
- ProductCard compare labels are product-aware and state-aware.
- Add-to-cart labels are product-aware.
- Product image alt, price, rating, and badge semantics remain renderable without DB access.
- Filter sections use explicit groups.
- Rating filters have a radiogroup contract.
- Filter query behavior source contracts are preserved.
- Sort select has a specific accessible label.
- Mobile filter trigger and dialog semantics are present.
- Changed UI files do not introduce blocked public claims.

## Validation Results

Commands run:

| Command | Result |
| --- | --- |
| `git status --short` | Passed; only allowed Step 287 files changed before reports/evidence. |
| `git log -5 --oneline` | Passed; starting commit `1e1313d`. |
| `git diff --cached --name-only` | Passed; empty before staging. |
| `git diff --check -- <exact changed files>` | Passed; line-ending notices only. |
| `node scripts/boilabin-terminal-loop-state.mjs` | Passed. |
| `node scripts/boilabin-advisor-state.mjs` | Passed after `audit-reports/288_NEXT_PROMPT_DRAFT.md` was created; latest recommended next step detected. |
| `npm run db:url:safety` | Passed; app/shadow URLs classified local and separate; no DB connection attempted. |
| `npm run db:prisma:local:validate` | Passed. |
| `npm run db:prisma:local:generate` | Passed. |
| `npx tsx --test tests/storefront-product-card-filter-ui.test.ts` | Passed; 5/5. |
| `npx tsx --test tests/ui-ux-redesign-readiness.test.ts` | Passed; 3/3. |
| `node scripts/audit-local-asset-dependencies.mjs --evidence` | Passed; remote static UI assets 0, missing local source warnings 0. |
| `node scripts/audit-admin-media-orphans.mjs` | Passed; dry-run only, no deletion, no DB. |
| `node scripts/audit-admin-media-orphans.mjs --db-aware-readonly-local` | Passed; local read-only DB-aware aggregate classification, no deletion. |
| `node scripts/audit-ai-marketing-copy.mjs` | Passed; 233 files scanned, 0 findings. |
| `node scripts/audit-search-verification-readiness.mjs` | Passed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed; no ESLint warnings or errors. |
| `npm test` | Passed after report/prompt creation; 473/473 tests. Initial pre-report run exposed the expected advisor-state ordering gap and was resolved by this report plus the Step 288 prompt draft. |
| `npm run build` | Passed. |
| `node scripts/local-runtime-smoke.mjs --mode start --host 127.0.0.1 --port 3130 --startup-timeout-ms 90000 --request-timeout-ms 20000` | Passed. |
| `node scripts/audit-ui-ux-redesign-readiness.mjs --out-dir audit-reports/287-storefront-card-filter-accessibility-foundation --browser --mode start --host 127.0.0.1 --port 3142 --cdp-port 9342 --timeout-ms 120000` | Passed. |

## Exact Files Changed Or Planned For Staging

Expected staged files for the final Step 287 commit:

- `src/frontend/components/product/ProductCard.tsx`
- `src/frontend/components/product/SearchFiltersPanel.tsx`
- `src/frontend/components/product/MobileSearchFilters.tsx`
- `src/frontend/components/search/SortSelect.tsx`
- `tests/storefront-product-card-filter-ui.test.ts`
- `audit-reports/287_STOREFRONT_CARD_FILTER_ACCESSIBILITY_FOUNDATION.md`
- `audit-reports/288_NEXT_PROMPT_DRAFT.md`
- `audit-reports/287-storefront-card-filter-accessibility-foundation/**`

## Prohibited Files And Actions Confirmation

Not touched:

- footer files;
- newsletter files;
- payment-logo assets;
- `PromoSection`;
- header files;
- homepage hero files;
- category image assets;
- product image files;
- `public/assets`;
- `public/uploads`;
- Prisma schema;
- migrations;
- API route behavior;
- auth/checkout/payment/tracking/seller/CSP/rate-limit/mobile/product lifecycle implementation.

Not run:

- migrations;
- seed/reset/db push;
- destructive SQL;
- Docker;
- provider CLI;
- deployment;
- package updates.

No secrets, full DB URLs, tokens, cookies, auth headers, payment secrets, private connection strings, customer/order PII, upload filenames, or raw private media values were printed in reports.

## Remaining Risks

- ProductCard still carries dense mobile content; this step improved foundation and touch semantics but did not redesign the whole card system.
- Overlay focus trapping remains a later dedicated task for mobile filters, cart drawer, header menu, and admin overlays.
- Header/search/mobile navigation remains a likely next large UI surface.
- Footer/newsletter/payment-logo/PromoSection remains a separate approval lane.
- Remote catalog/product media remains separate backlog.
- Product detail layout polish remains separate from this ProductCard/listing foundation step.

## Recommended Next Step

Proceed to Step 288: homepage section and product-grid rhythm polish, using the improved ProductCard foundation while keeping header/footer/newsletter/payment-logo/PromoSection/media assets out of scope unless explicitly approved.
