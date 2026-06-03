# Step 118 - Remaining Media Localization Decision Plan

## Scope

Docs-only decision plan for remaining remote media localization before launch.

This step did not replace, download, generate, redesign, optimize, delete, or rename images. It did not change runtime behavior, seed data, DB rows, source code, tests, config, package files, Prisma schema, or migrations.

## Latest Commit Verified

- Latest commit verified before this step: `c6c97db test: add storefront media source guardrails`

## Initial Git Status

- Initial `git status --short`: clean.
- Initial staged files: none.

## Step 116/117 Summary

Step 116 repaired the storefront media source of truth:

- Category media now uses canonical local category assets.
- Toys & Collectibles has `/assets/categories/toys-collectibles.jpg`.
- `public/assets/categories/baby-kids.jpg` remains absent.
- iPhone and Galaxy hero banners now use canonical local banner assets.
- Seed and guarded repair scripts no longer reintroduce the retired iPhone/Galaxy hero remotes into active hero seed references.

Step 117 audited the repaired state and added guardrails:

- Added `scripts/audit-storefront-media-sources.mjs`.
- Added `tests/storefront-media-remote-policy.test.ts`.
- Confirmed Step 116 media stability.
- Confirmed Flash Deals remains removed and `/deals` plus `/api/admin/flash-sales` remain 404.
- Inventoried remaining accepted remote media risk.

## Remote Media Inventory From Step 117

Latest known remaining media risks:

- Sony hero remains an active remote storefront hero dependency.
- 21 product seed/ProductImage remote image references remain.
- 9 brand/logo placeholder remote references remain.
- 1 existing local order-item image reference remains remote from previous local/test data; raw value was not printed.
- 1 promotional seed image remote remains.
- Toys & Collectibles uses a slug-specific local file but shares Gaming pixels.
- Next/Image still allows `images.unsplash.com`, `uploadthing.com`, `utfs.io`, and `lh3.googleusercontent.com`.

Safe inventory command result from this step:

- `node scripts/audit-storefront-media-sources.mjs`: passed.
- Category assets present: true.
- Hero assets present: true.
- Baby Kids asset restored: false.
- Product seed remote images: 21.
- Unexpected seed hero remotes: 0.

## Decision Matrix

| Category | Current status | Launch risk | Blocks development now | Fix before production launch | Required source asset | Future files likely touched | Must not touch yet |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Sony active hero banner | Active remote hero image | Medium: external availability and visual consistency risk | No | Recommended if approved asset exists | Approved Sony hero image with clear rights | `public/assets/banners/*`, `prisma/seed.ts`, guarded repair script/report | Do not download random Sony image or edit DB now |
| Product seed/ProductImage remotes | 21 remote product images | Medium/high for launch polish and reliability | No | Recommended before production content freeze | Approved product images or approved placeholder policy | `public/assets/products/*`, `prisma/seed.ts`, product media repair/backfill script/tests | Do not replace with random or AI images without approval |
| Promotional seed remote image | 1 remote promo-style seed image | Low/medium | No | Optional before launch if promo remains active | Approved local promo/category image | `public/assets/*`, `prisma/seed.ts` | Do not alter promotional layout/content now |
| Brand/logo placeholders | 9 remote `placehold.co` references | Medium for launch credibility | No | Recommended before launch | Approved brand logos/placeholders with licensing clarity | `public/assets/brands/*`, `prisma/seed.ts` | Do not use real brand marks without rights/approval |
| Existing local order-item remote reference | Historical local/test order item image reference | Low for pre-launch, possible consistency issue in local data | No | Only if local data cleanup is needed | None, or mapped product image after product localization | Future local-only cleanup report/script | Do not print value or mutate order/history records now |
| Next/Image remotePatterns | Allows current external image hosts | Low now, policy risk later | No | Narrow later only after upload/OAuth/admin media policy is finalized | Hosting/CDN/upload/OAuth policy decision | `next.config.js`, CSP/security docs/tests | Do not narrow now and break OAuth/admin uploads/product remotes |
| Toys & Collectibles shared pixels | Local slug-specific file shares Gaming pixels | Low visual originality risk | No | Optional when distinct approved image exists | Approved Toys & Collectibles artwork | `public/assets/categories/toys-collectibles.jpg`, report/tests if intentional | Do not restore `baby-kids.jpg` or random asset |
| Step 116 category canonical assets | Local canonical category assets | Low | No | No immediate action | None unless user wants changes | No future change needed unless approved visual refresh | Do not modify current category assets without dedicated visual step |

## Recommended Future Media Localization Sequence

1. Collect and approve exact source assets, ownership/licensing, and intended usage for:
   - Sony hero.
   - Product images.
   - Brand/logo placeholders.
   - Distinct Toys & Collectibles image if desired.
2. Define canonical local asset naming/path policy:
   - Hero banners: `public/assets/banners/<stable-slug>.jpg`.
   - Product images: `public/assets/products/<product-slug>-<index>.jpg` or a documented equivalent.
   - Brand assets: `public/assets/brands/<brand-slug>.svg|png|webp`.
   - Category assets: keep `public/assets/categories/<category-slug>.jpg`.
3. Localize seed-only product and brand images in a controlled asset commit.
4. Create a guarded local-only DB repair/backfill script only after approved assets exist.
5. Run browser, SEO metadata, image, and performance validation after any media replacement.
6. Narrow Next/Image `remotePatterns` only after upload, OAuth, admin media, hosting/CDN, and mobile app media URL policies are finalized.

## What Not To Do Yet

- Do not download random website images.
- Do not AI-generate production product or brand images without explicit approval.
- Do not use real brand logos without rights/approval.
- Do not mutate product/order/history records.
- Do not replace Sony/product/brand images until exact approved assets are available.
- Do not touch `public/assets/categories/baby-kids.jpg`.
- Do not undo Toys & Collectibles.
- Do not narrow Next/Image remotes before upload/OAuth/admin media requirements are settled.
- Do not edit seed data or DB rows in a planning step.

## Future Files Likely Involved, But Not Touched Now

Potential future implementation files:

- `public/assets/banners/**`
- `public/assets/products/**`
- `public/assets/brands/**`
- `public/assets/categories/toys-collectibles.jpg`
- `prisma/seed.ts`
- `scripts/audit-storefront-media-sources.mjs`
- `scripts/repair-storefront-image-sources.mjs`
- A future guarded product/brand media repair script
- `tests/storefront-media-remote-policy.test.ts`
- `next.config.js`, only after media/upload/OAuth policy is finalized
- Future audit report for the implementation step

None of those files were changed in Step 118 except this report.

## Mobile App Compatibility Notes

Stable local media paths are compatible with future iPhone and Android apps as long as the backend/API eventually returns stable absolute media URLs after hosting/CDN decisions are made.

For the future mobile app:

- Avoid web-only assumptions in media identifiers.
- Keep image URL response shapes stable.
- Prefer canonical local/CDN-backed media paths over transient third-party image URLs.
- Do not narrow allowed media hosts until mobile, OAuth avatar, admin upload, and CDN policies are known.
- When hosting is selected, define how `/assets/**` and `/uploads/**` become absolute URLs for mobile clients.

## Validation Results

- `node scripts/audit-storefront-media-sources.mjs`: passed.
- `npm run db:url:safety`: passed; no DB connection attempted.
- `npm run db:prisma:local:validate`: passed.
- `npm run db:prisma:local:generate`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, 273 tests across 51 suites.
- `npm run build`: passed.

No mutating repair script was run.

## Prohibited Actions Not Performed

Did not:

- Touch image assets.
- Download, generate, replace, optimize, rename, or delete images.
- Replace Sony hero, product images, brand logos, or placeholders.
- Edit seed data.
- Edit DB rows.
- Run mutating repair scripts.
- Touch footer, newsletter, payment-logo assets, `PromoSection.tsx`, payment, tracking, seller marketplace, product lifecycle, CSP enforcement/default collection, distributed rate limiting, mobile app, or authenticated admin password/session flows.
- Restore `public/assets/categories/baby-kids.jpg`.
- Undo Toys & Collectibles.
- Restore Flash Deals or Flash Sales.
- Run migrations, create migrations, edit Prisma schema, run `db push`, seed/reset, destructive SQL, deployment commands, package updates, GitHub fetch/pull/remote restore, or broad staging.
- Print secrets, full DB URLs, tokens, cookies, credentials, auth headers, session payloads, payment secrets, private connection strings, customer/order PII, or raw order-item image values.

## Recommended Next Step

Recommended next move: pause media implementation until approved source assets are available, then run a dedicated controlled media localization implementation step.

If no approved media assets are ready, proceed to the next non-visual technical roadmap item instead of continuing image work.
