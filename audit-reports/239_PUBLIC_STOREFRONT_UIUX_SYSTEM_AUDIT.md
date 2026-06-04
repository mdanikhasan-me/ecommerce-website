# Step 239 - Public Storefront UI/UX System Audit

## Scope

This audit covers the public storefront visual system only. It does not approve backend, route, auth, checkout, payment, tracking, seller, Prisma, SEO canonical, robots, sitemap, JSON-LD, media asset, upload, or search-verification behavior changes.

## Latest Commit Verification

- Latest commit checked before edits: `33a37d2 test: add search verification readiness guardrails`.
- Baseline staged files: none.
- Baseline working tree status before edits: clean.

## Public Storefront Files Inspected

- `src/app/(store)/layout.tsx`
- `src/app/(store)/page.tsx`
- `src/app/(store)/category/page.tsx`
- `src/app/(store)/category/[slug]/page.tsx`
- `src/app/(store)/search/page.tsx`
- `src/app/(store)/products/[slug]/page.tsx`
- `src/frontend/components/layout/Header.tsx`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `src/frontend/components/home/HeroBanner.tsx`
- `src/frontend/components/home/FeaturedCategories.tsx`
- `src/frontend/components/home/ProductGrid.tsx`
- `src/frontend/components/home/PromoSection.tsx`
- `src/frontend/components/product/ProductCard.tsx`
- `src/frontend/components/product/ProductDetailClient.tsx`
- `src/frontend/components/product/SearchFiltersPanel.tsx`
- `src/frontend/components/product/MobileSearchFilters.tsx`
- `src/frontend/components/cart/CartDrawer.tsx`
- `src/app/globals.css`
- `scripts/local-runtime-smoke.mjs`
- `scripts/local-browser-runtime-check.mjs`
- `package.json`

## Exact Files Selected For Editing

Source files selected for visual-only implementation:

- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/Header.tsx`
- `src/frontend/components/home/FeaturedCategories.tsx`
- `src/frontend/components/home/ProductGrid.tsx`
- `src/frontend/components/product/ProductCard.tsx`
- `src/app/(store)/category/page.tsx`
- `src/app/(store)/category/[slug]/page.tsx`
- `src/app/(store)/search/page.tsx`

Report/docs files selected for this batch:

- `audit-reports/239_PUBLIC_STOREFRONT_UIUX_SYSTEM_AUDIT.md`
- `audit-reports/240_PUBLIC_STOREFRONT_UIUX_IMPLEMENTATION_REPORT.md`
- `audit-reports/241_PUBLIC_STOREFRONT_BROWSER_VISUAL_QA.md`
- `audit-reports/242_NEXT_PROMPT_DRAFT.md`

## Files Intentionally Not Touched

- `src/app/(store)/layout.tsx`: no layout wrapper issue found.
- `src/app/(store)/page.tsx`: data and section order are correct; source behavior should remain stable.
- `src/app/(store)/products/[slug]/page.tsx`: product detail route queries, metadata, and structured data are DB-backed and should remain untouched in this visual batch.
- `src/frontend/components/product/ProductDetailClient.tsx`: product detail has larger content and checkout state implications; deferred for a dedicated visual pass.
- `src/frontend/components/product/SearchFiltersPanel.tsx`: current behavior and controls are functional; listing wrappers can improve spacing without changing filter internals.
- `src/frontend/components/product/MobileSearchFilters.tsx`: bottom sheet is already compact enough for this batch.
- `src/frontend/components/cart/CartDrawer.tsx`: current drawer is visually acceptable and behavior-sensitive.
- `src/frontend/components/home/HeroBanner.tsx`: current hero assets and layout passed recent source-of-truth repair.
- `src/frontend/components/home/PromoSection.tsx`: previously sensitive visual/newsletter area; intentionally deferred.
- `src/frontend/components/layout/NewsletterForm.tsx`: no footer dependency and no need to change for this batch.
- `src/app/globals.css`: global visual tokens are already in use; local component changes are safer.
- `public/assets/**`: media assets are outside this batch.
- Backend, API, auth, checkout, payment, search, SEO, Prisma, scripts unrelated to QA, and tests outside visual smoke/reporting scope.

## Visual System Map

### Homepage

- Current homepage uses a clear sequence: hero, featured categories, product grids, promotional section, best sellers, and new arrivals.
- The section rhythm is mostly usable but product-grid headers are too desktop-oriented on narrow screens.
- Category cards are visually strong but mobile tiles are tall, making the page feel longer than needed.

### Header And Navigation

- Desktop header is conventional: top announcement/support bar, logo/search/actions, category navigation.
- Mobile header has search and a menu panel with account, categories, shopping, and support.
- Support links are direct links, but the mobile support area is missing a direct Track Order entry.
- The mobile menu card spacing is usable but can be tightened without changing behavior.

### Mobile Navigation

- Mobile nav uses one categories disclosure, not every section opened by default.
- Account, shopping, and support sections are clear enough.
- The support area should prioritize buyer tasks and avoid making Help/Track/Contact into dropdown parents.

### Footer

- Footer is currently too sparse for buyer support needs.
- Existing footer copy says "premium", "fast delivery", and "trust", which conflicts with the owner's factual-copy preference.
- Footer does not expose key buyer paths such as Track Order, Shipping, Returns, FAQ, Help, Contact, Terms, and Privacy in a scannable grid.
- Payment logos are correctly derived from available payment configuration, so unavailable methods are not shown as live.

### Category And All-Categories

- All-categories page uses compact accordion rows and preserves subcategory links.
- Category listing page has correct filters and sorting but mobile header/filter/sort wrapping can be cleaner.
- Category chips are horizontally scrollable but could use slightly tighter spacing and clearer selected state.

### Product Cards

- Product cards are consistent and image-led, but mobile cards can feel dense due to large price typography and action overlays.
- The add-to-cart action is useful, but product card text and price need a more compact mobile scale.
- List card mode is acceptable but can be made more stable through tighter image and action sizing.

### Product Detail

- Product detail has a conventional gallery, price, variant, quantity, action, and support block structure.
- It is deferred because a product-detail redesign should be browser-tested with real product pages and avoid changing checkout/cart behavior in this broad batch.

### Search And Filter

- Search and category listing share the same product-card grid and filter controls.
- Wrapping around "Sort by" and mobile filters can be improved by making the control cluster more mobile-aware.
- Query parsing, status codes, metadata, and search behavior must remain unchanged.

### Cart Drawer

- Cart drawer already has a practical mobile-first structure.
- It is behavior-sensitive because it manipulates quantities, stock limits, subtotal, and checkout navigation.
- Deferred to avoid unnecessary cart behavior risk.

### Support And Trust Blocks

- Public support pages already exist and are linked in header and footer.
- This batch should expose support links without inventing claims.
- No new "trusted", "premium", "best", "guaranteed", seller, customer-count, or payment promises should be added.

## Desktop Issues Found

- Footer does not have enough scannable link structure for desktop buyers.
- Product grid headers are acceptable but can better align CTA and copy without cramped spacing.
- All-categories page has a large title with little supporting context.

## Mobile Issues Found

- Footer lacks a compact buyer-task layout and useful direct support links.
- Mobile featured category tiles are taller than necessary.
- Product cards use large price sizing on small screens.
- Listing headers can wrap awkwardly when filter and sort controls sit beside result counts.

## Footer Issues Found

- Unsupported tone: "premium", "fast delivery", and "trust" language appears in the footer.
- Missing buyer-first link groups: Help, Track Order, Shipping, Returns, FAQ, Contact, Terms, Privacy.
- No clear shop/support/account/legal scan pattern.
- Footer is compact, but compact at the cost of usefulness.

## Category And Product-Card Issues Found

- All-categories page would benefit from a short factual intro and clearer browse context.
- Category listing and search grids should use slightly tighter mobile gaps and more controlled headers.
- Product card price/text hierarchy should be easier to scan on mobile.
- Product card actions should not make cards look like an overdesigned template.

## Consistency Issues

- Spacing: section spacing varies between tight and roomy; wrappers can be tightened on mobile.
- Typography: product price and category mobile tile title sizing are a little large for narrow screens.
- Buttons: CTAs are consistent, but product/card actions need better mobile proportions.
- Cards: card radius and borders are consistent enough; local class tweaks should preserve system style.
- Colors: current palette is consistent; no palette redesign needed.
- Responsive breakpoints: mobile wrappers need more deliberate stacking, especially listings and footer.

## SEO And Search Behavior To Preserve

- Canonical URL behavior must not change.
- Noindex rules must not change.
- JSON-LD/schema output must not change.
- Sitemap, robots, and search-verification behavior must not change.
- Product/category/search links and query parameters must remain stable.
- Product visibility, sorting, category counts, and search parsing must remain unchanged.

## Backend Behavior To Preserve

- No DB queries should be added or changed.
- No route handlers, auth/session code, checkout/payment code, seller code, tracking code, rate-limit code, or lifecycle logic should be modified.
- No Prisma schema, migrations, seed/reset, db push, SQL, Docker, provider CLI, deployment, or package commands should run.
- `/deals` and `/api/admin/flash-sales` must remain removed.

## Highest-Impact Safe Changes To Implement Now

- Rewrite footer intro to factual, non-hype copy.
- Add compact buyer-first footer link groups with direct links.
- Keep payment logos tied to available payment configuration only.
- Add Track Order to mobile support navigation.
- Tighten Featured Categories mobile tile height and spacing.
- Improve ProductGrid header wrapping and grid spacing.
- Make product-card typography/action spacing more mobile-readable.
- Improve category and search listing headers/control wrapping without changing search/filter behavior.
- Add a small factual intro to the all-categories page.

## Changes Deferred To Later

- Product detail page visual redesign.
- Cart drawer visual pass.
- PromoSection/newsletter-specific visual pass.
- Media-derived replacement images.
- Any content claim policy rewrite outside the footer.
- Any search, SEO, backend, payment, checkout, seller, auth, or DB-backed behavior work.

## Risk Assessment Before Edits

- Primary risk: broad visual edits can accidentally affect route behavior or search/filter links. Mitigation: only edit selected component markup/classes and preserve hrefs/query behavior.
- Footer risk: adding too many links can make mobile footer long. Mitigation: use compact columns, direct links, and no open mobile accordions.
- Product-card risk: changing card structure can affect click/add-to-cart behavior. Mitigation: preserve handlers, hrefs, data reads, and only adjust class names/visual wrappers.
- Search/category risk: filter controls are behavior-sensitive. Mitigation: leave filter helper components untouched and only adjust surrounding layout classes.
- Content risk: unsupported claims may be introduced accidentally. Mitigation: use factual wording only and run the marketing-copy audit.
