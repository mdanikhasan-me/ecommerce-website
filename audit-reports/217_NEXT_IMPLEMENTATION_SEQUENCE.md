# Step 217 - Next Implementation Sequence

## Scope

Compared next implementation batches after schema/social/metadata alignment.

## Options

| Option | Benefit | Risk | Backend impact | Before UI/UX? | Validation required | Owner approval |
| --- | --- | --- | --- | --- | --- | --- |
| A. Public storefront UI/UX redesign, visual-only | Improves buyer trust and conversion | High visual regression risk | None if scoped | After schema/content baseline | Screenshots, browser smoke, build | Yes |
| B. Media derived image variants | Improves image performance and discovery | Medium/high upload behavior risk | Upload/media pipeline | Can happen before visual polish | image tests, browser image checks, build | Yes |
| C. Buying-guide/collection content system | Adds useful crawlable content | Medium owner-fact risk | New routes/content model if built deeply | Yes if content approved | content audit, route tests, build | Yes |
| D. Merchant feed readiness | Helps product discovery later | High product data contract risk | Feed/export helpers | After product data policy | feed tests, schema tests, build | Yes |
| E. Sitemap scaling/performance | Improves crawl scale | Medium DB-backed risk | Sitemap generation | Before public launch scale | sitemap tests, build, DB smoke | Yes |
| F. Seed/demo copy cleanup | Removes public-data risk if seeded locally | Medium because seed is DB-adjacent | Seed/demo data only | Before DB-backed public demo | content audit, seed review, tests | Yes |
| G. Footer/mobile footer redesign | Resolves protected visual area | High visual/browser QA risk | Frontend visual only | After owner approves visual step | screenshots, browser smoke, build | Yes |
| H. Product/category content fields and alt text | Improves accessibility and image discovery | Medium schema/admin/data risk | Admin/product data | Before merchant feed | tests, DB-backed smoke | Yes |
| I. Search Console/Bing/staging planning | Prepares launch | Low docs/config risk | Hosting/env planning | Before hosting | docs review, no deploy | Yes |

## Recommended Next Batch

Recommended next: Option I, provider-neutral Search Console/Bing/staging verification planning.

## Why

The schema/social baseline is cleaner, but production launch still needs hosting/staging decisions before Search Console, Bing Webmaster Tools, social previews, and rich-result validation can be meaningful. A planning-only launch verification step is safer than starting visual redesign or merchant feed work immediately.

## Secondary Next Choices

1. Seed/demo copy cleanup if owner wants to reduce remaining scanner findings before DB-backed demo work.
2. Visual-only public storefront QA/redesign if owner wants to resume visual work with browser screenshots.
3. Media derived variants if performance/image delivery becomes the priority.

## Recommended Timing

- Do staging/search-verification planning before deployment.
- Do seed/demo cleanup before using seed data for public demos.
- Do merchant feed only after product data policy and image policy are stable.

## Recommended Next Step

Create a provider-neutral staging, Search Console, Bing Webmaster, rich-result, and social-preview verification plan without selecting a hosting provider or deploying.
