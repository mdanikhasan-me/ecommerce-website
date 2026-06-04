# Step 266 - Remote Product Image Source Of Truth Cleanup

## Scope

Step 266 was a high-effort storefront product-image source-of-truth cleanup batch.

The goal was to reduce remote storefront product image risk only where a committed, product-specific local asset already existed or where an exact canonical product hero asset could be safely reused. This was not a redesign, checkout, cart, payment, auth, SEO, footer, newsletter, category-image, Baby/Toys, Flash Deals, product lifecycle, migration, or deployment step.

## Latest Commit Verification

- Latest verified starting commit: `c50ad90 fix: improve cart checkout responsive visual flow`
- Starting working tree: clean.
- Starting staged set: empty.
- Private env files and secrets were not read or printed.

## Internal Agent Pipeline

Read-only lanes were used before implementation:

- Inspector lane: mapped remote product/seed/demo/repair media references and Step 265 image QA evidence.
- Risk lane: reviewed unsafe replacement risks, DB/source-of-truth drift, and generic placeholder risks.
- Mapping lane: identified high-confidence committed local assets.
- QA lane: proposed strict image-inclusive production QA with product-view interception.
- Review lane: classified approved replacements versus remote images that must remain until product-specific assets exist.

Coordinator implemented only the approved source, repair-script, test, report, and QA artifact changes.

## Files Changed

- `prisma/seed.ts`
- `scripts/audit-storefront-media-sources.mjs`
- `scripts/repair-known-broken-image-urls.mjs`
- `tests/runtime-stability.test.ts`
- `tests/storefront-image-source.test.ts`
- `tests/storefront-media-remote-policy.test.ts`
- `audit-reports/266_REMOTE_PRODUCT_IMAGE_SOURCE_OF_TRUTH_CLEANUP.md`
- `audit-reports/267_NEXT_PROMPT_DRAFT.md`
- `audit-reports/266-remote-product-image-qa/`

## Files And Areas Not Touched

No changes were made to:

- cart, checkout, order, payment, auth, coupon, review, return, search, product visibility, pricing, stock, SEO, sitemap, robots, or mobile app behavior,
- footer, newsletter, payment-logo assets, `PromoSection`, category image assets, Baby & Kids, Toys & Collectibles, Flash Deals, `/deals`, or `/api/admin/flash-sales`,
- Prisma schema or migrations,
- private env files,
- Docker/provider/deployment/package update files.

## Remote Image Inventory Result

Before Step 266, the storefront media audit found:

- remote product seed images: `21`
- remote brand logo placeholders: `9`
- accepted remaining remote hero: Sony WH-1000XM5 hero
- unexpected seed hero remotes: `0`

After Step 266, `node scripts/audit-storefront-media-sources.mjs` reports:

- remote product seed images: `14`
- product seed local replacements: `7`
- stale product replacement remotes: `0`
- unexpected seed hero remotes: `0`

The remaining remote product images were intentionally kept because no clearly product-specific committed local replacement was available.

## Safe Replacement Decision

Approved local replacements:

| Product | Local source | Decision |
| --- | --- | --- |
| iPhone 15 Pro 128GB | `/assets/banners/home-hero-iphone-15-pro.jpg` | Reused exact-product canonical hero asset as a temporary product image source until a dedicated product-card asset is supplied. |
| Samsung Galaxy S24 Ultra 256GB | `/uploads/products/samsung-galaxy-s24-ultra-256gb-mnyzjwut-55e72c0c.jpg` | Exact committed product upload. |
| Anker 737 Power Bank 24000mAh | `/uploads/products/anker-737-power-bank-24000mah-mnyzif42-a41aa5a6.webp` | Exact committed product upload. |
| Anker 511 Nano Pro 65W USB-C Charger | `/uploads/products/anker-511-nano-pro-65w-charger-mnyzoikz-37e76524.jpg` | Exact committed product upload. |
| Dell UltraSharp 27" 4K USB-C Monitor U2723DE | `/uploads/products/dell-ultrasharp-27-4k-usb-c-u2723de-mnyzrjgz-759f7168.jpg` | Exact committed product upload. |
| Samsung Galaxy Tab S9 128GB WiFi | `/uploads/products/samsung-galaxy-tab-s9-128gb-mnyvmwuo-057009f0.jpg` | Same-slug committed product upload. |
| Xiaomi Redmi Note 13 Pro 256GB | `/uploads/products/xiaomi-redmi-note-13-pro-256gb-mnyvj84s-d6198d84.webp` | Exact committed product upload. |

Explicitly rejected as unsafe:

- generic placeholders,
- category images as product substitutes,
- remote-to-remote swaps,
- PS5 controller upload as a PS5 console image,
- ambiguous images for products that did not have exact committed local assets.

## Image Source-Of-Truth Changes

`prisma/seed.ts` now uses the seven approved local image sources above.

`scripts/audit-storefront-media-sources.mjs` now exports `CANONICAL_PRODUCT_IMAGE_REPLACEMENTS` and reports:

- whether each replacement local file exists,
- whether seed data uses the local source,
- whether seed data still uses the stale remote source,
- whether the guarded repair script maps the stale remote URL to the local source.

`scripts/repair-known-broken-image-urls.mjs` now includes guarded local-only mappings for the same approved product image replacements plus existing legacy Galaxy/Tab repair entries. The repair script remains protected by the DB URL safety checker.

## Local DB Repair Result

The first strict production browser QA after source edits failed because the local database still contained stale old remote product image rows. This was not a source-code failure; it was local DB source-of-truth drift.

Before touching DB rows, `npm run db:url:safety` reported:

- `DATABASE_URL`: local
- `SHADOW_DATABASE_URL`: local
- shadow database separate: yes
- local migration ready: yes

Then the existing guarded repair script was run:

- command: `node scripts/repair-known-broken-image-urls.mjs`
- rows updated: iPhone `1`, Galaxy current product image `1`, Anker 737 `1`, Anker 511 `1`, Dell monitor `1`, Tab S9 current product image `1`, Redmi `1`
- rows unchanged where already clean or absent: Galaxy legacy product image `0`, Tab S9 legacy product image `0`, Galaxy hero banner `0`

No migration, seed, reset, db push, SQL, Docker, deployment, or schema change was run.

## Tests And Guardrails Result

Tests/guardrails added or updated:

- `tests/storefront-media-remote-policy.test.ts` now verifies all approved product replacements exist locally, are used by seed data, are not stale remotes, and are mapped by the repair script.
- `tests/storefront-image-source.test.ts` now verifies approved product seed image replacements use local source-of-truth assets.
- `tests/runtime-stability.test.ts` now derives expected repair model coverage from `KNOWN_BROKEN_IMAGE_REPLACEMENTS`, preserving exact-match repair behavior while supporting the expanded mapping list.

Targeted test result:

- `npx tsx --test tests/storefront-media-remote-policy.test.ts tests/storefront-image-source.test.ts tests/runtime-stability.test.ts`: passed, `22/22`.

## Strict Image QA Result

QA artifacts were written under `audit-reports/266-remote-product-image-qa/`.

Evidence files:

- `strict-image-qa-before-local-repair.json`
- `strict-image-qa-summary.json`
- selected screenshots for home, category electronics, search, cart, removed deals, and updated product detail routes.

Final strict production image QA result:

- failure count: `0`
- known remote risk count from the checked routes: `0`
- runtime console errors: none
- failed requests: none
- server errors: none
- image failures: none
- horizontal overflow: none in checked viewports

Checked routes and surfaces included:

- `/`
- `/category`
- `/category/electronics`
- `/search?q=phone`
- `/cart`
- `/deals`
- `/api/admin/flash-sales`
- product detail pages for the seven updated products
- one known remote-risk product page: `/products/sony-playstation-5-slim`
- viewports: `360`, `390`, `430`, `480`, `600`, `700`, `768`, `900`, `1024`, `1366`

The temporary QA harness scroll-loaded displayed images before measurement so offscreen lazy images were not misclassified as broken.

## Product-View And Network Guardrail Result

Final QA counters:

- product-view POST attempts observed by CDP: `80`
- product-view POSTs fulfilled by CDP: `80`
- product-view POSTs continued to server: `0`
- product-view requests seen by proxy: `0`
- product-view requests forwarded to Next: `0`
- forbidden network calls: `{}`

No order, payment, coupon, review, return, auth-submit, or order-confirmation network actions were made.

## Footer And Removed Route Regression Result

Footer/payment regression checks passed on the checked home/cart mobile surfaces:

- YouTube footer link signal present.
- bKash present.
- Nagad present.
- Visa present.
- Mastercard present.
- Cash on delivery/COD absent.

Removed routes remained removed in QA:

- `/deals` expected 404 behavior preserved.
- `/api/admin/flash-sales` expected 404 behavior preserved.

## Validation Results

Commands run:

- `git diff --check -- ...`: passed.
- `node scripts/boilabin-terminal-loop-state.mjs`: passed.
- `node scripts/boilabin-advisor-state.mjs`: passed after `audit-reports/267_NEXT_PROMPT_DRAFT.md` was given an explicit `Recommended Next Step` section.
- `npm run db:url:safety`: passed.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: passed.
- `node scripts/audit-local-auth-fixture-readiness.mjs`: passed with `manual-owner-action-required` status.
- `node scripts/audit-ai-marketing-copy.mjs`: exited successfully and reported existing content-quality findings outside this image cleanup.
- `node scripts/audit-search-verification-readiness.mjs`: passed.
- `node scripts/audit-storefront-media-sources.mjs`: passed, product seed local replacements `7`, stale replacement remotes `0`.
- `npx tsx --test tests/storefront-media-remote-policy.test.ts tests/storefront-image-source.test.ts tests/runtime-stability.test.ts`: passed, `22/22`.
- `npm run typecheck`: passed.
- `npm run lint`: passed with the existing Next.js lint deprecation notice.
- `npm test`: initially failed because the new latest audit file lacked the Advisor `Recommended Next Step` marker; after adding that docs-only section, rerun passed `388/388`.
- `npm run build`: passed.

## Remaining Remote Images Intentionally Kept

Remaining remote product seed images require product-specific local assets or owner approval before replacement:

- Xiaomi Buds 4 Pro
- Sony WH-1000XM5 Wireless Headphones
- Dell XPS 15 9520 Core i7 OLED
- HP Spectre x360 14 2-in-1 Laptop
- Apple Watch Series 9 41mm
- Samsung Galaxy Watch 6 Classic 44mm
- Sony PlayStation 5 Slim Console
- Xiaomi Pad 6 128GB WiFi
- Nike Air Max 270 Running Shoes
- Bose QuietComfort 45 Headphones
- Samsung 55" Neo QLED 4K Smart TV QN90C
- Sony Alpha a7 IV Mirrorless Camera Body
- Xiaomi Mi Smart Band 8
- Apple AirPods Pro (2nd Generation)

Other remote media intentionally left:

- Sony WH-1000XM5 hero remote.
- brand logo `placehold.co` placeholders.
- sample order AirPods demo image.
- repair-script-only stale remote keys used as exact local repair inputs.

## Confirmation No Prohibited Behavior Changed

Confirmed:

- no product behavior, cart, checkout, order, payment, auth, coupon, review, return, SEO, search, footer, newsletter, payment-logo, category-image, Baby/Toys, Flash Deals, seller, tracking, lifecycle, mobile, or CSP behavior was changed,
- no Prisma schema or migration file was changed,
- no migration, seed, reset, db push, destructive SQL, Docker, package update, deployment, or provider command was run,
- no private env values, full DB URLs, secrets, tokens, cookies, auth headers, payment secrets, or customer/order PII were printed.

## Remaining Risks

- Fourteen product seed images still depend on remote Unsplash sources until exact committed local product assets are supplied.
- Sony WH-1000XM5 hero remains remote by accepted policy.
- brand logo placeholders remain remote.
- sample order image remains remote demo data.
- iPhone product seed temporarily reuses the exact canonical hero asset rather than a dedicated product-card asset.

## Recommended Next Step

Step 267 should plan the remaining remote product/brand/demo media localization decisions without guessing: identify which exact product-specific assets are needed, whether any owner-provided originals exist, and whether a later dedicated asset batch should add or replace local media.
