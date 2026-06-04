# Step 203 - Schema And Metadata Pipeline Inventory

## Scope

This report inventories current Search Everywhere surfaces before source edits.

## Pipeline Inventory

| Surface | Source file | Current value source | Visible support | Risk | Safe action now | Tests needed |
| --- | --- | --- | --- | --- | --- | --- |
| Product `name` | `src/backend/seo/structured-data.ts` | Product input | Product page data | Low | Keep | Product JSON-LD presence |
| Product `description` | `src/backend/seo/structured-data.ts` | Product input | Product page data | Medium if product copy is inflated | Keep data-driven | No unsupported schema claims |
| Product `image` | `src/backend/seo/structured-data.ts` | Product images, absolute URL helper | Product page images | Low | Keep | Absolute URL test |
| Product `sku` | `src/backend/seo/structured-data.ts` | SKU or slug fallback | Product input/URL | Low/medium | Keep, no GTIN/MPN | No GTIN/MPN test |
| Product `url` | `src/backend/seo/structured-data.ts` | Canonical product slug | Product route | Low | Keep | Absolute URL test |
| Product `category` | `src/backend/seo/structured-data.ts` | Category input | Product page/category data | Low | Keep | Existing tests |
| Offer `price`/`priceCurrency` | `src/backend/seo/structured-data.ts` | Product price, BDT | Product page price | Low | Keep | Existing tests |
| Offer `availability` | `src/backend/seo/structured-data.ts` | Product lifecycle/stock helper | Product visibility | Low | Keep | Existing tests |
| Offer `seller` | `src/backend/seo/structured-data.ts` | Boilabin organization name | Site owner/merchant name | Low | Keep as Organization name only | No seller marketplace overclaim |
| Offer `shippingDetails.shippingRate` | `src/backend/seo/structured-data.ts` | `siteConfig.shipping.baseFee` | Shipping page states Tk 60 and free threshold | Medium | Keep base rate only | Shipping schema test |
| Offer `shippingDetails.deliveryTime` | `src/backend/seo/structured-data.ts` | Hard-coded handling/transit ranges | Visible page gives delivery estimates but no handling/transit split | High | Remove for now | Assert absent |
| Offer `hasMerchantReturnPolicy` | `src/backend/seo/structured-data.ts` | Hard-coded BD finite 7 days and ReturnByMail | FAQ says seven-day window; returns page mentions window but not method | Medium | Keep finite days, remove method, align returns page text | Return policy test |
| Aggregate rating | `src/backend/seo/structured-data.ts` | Product rating and review count inputs | Only if product data exists | Low | Keep gated | Test no invented ratings |
| Reviews | `src/backend/seo/structured-data.ts` | Product reviews input | Only if review data exists | Low/medium | Keep gated | Test no invented reviews |
| Breadcrumb | `src/backend/seo/structured-data.ts` | Breadcrumb input | Navigation/page route | Low | Keep | Existing URL test |
| Organization | `src/backend/seo/structured-data.ts`, `constants.ts`, `site.ts` | SEO constants/contact constants | Contact/about/site identity | Low/medium | Keep, do not add sameAs/social/legal claims | Organization availability test |
| WebSite SearchAction | `src/backend/seo/structured-data.ts` | Canonical `/search` URL | Search page exists and is noindex | Low | Keep | WebSite test |
| OnlineStore | `src/backend/seo/structured-data.ts` | SEO/site config | Homepage identity and COD policy | Medium | Keep COD only, no payment providers | OnlineStore test |
| FAQ schema | `src/app/(store)/faq/page.tsx` | Visible FAQ array | Visible FAQ content | Low | Keep | FAQ parity guidance |
| ItemList/category schema | `src/backend/seo/structured-data.ts` | Visible product list inputs | Category page product list | Low | Keep | Existing ItemList test |
| Product metadata | `src/backend/seo/metadata.ts` | Product inputs/fallbacks | Product page facts | Low/medium | Keep; ensure no hype | Metadata guardrail test |
| Category metadata | `src/backend/seo/metadata.ts` | Category inputs/fallbacks | Category page facts | Low | Keep; ensure no hype | Metadata guardrail test |
| Open Graph/Twitter metadata | `src/backend/seo/metadata.ts`, `constants.ts` | Page/product/category inputs | Page summaries | Low/medium | Keep factual | Metadata guardrail test |
| OpenGraph image copy | `src/app/opengraph-image.tsx` | Static image JSX | Global social preview | Medium | Replace authenticity/smooth-checkout copy with factual copy | Scanner/test coverage |
| Content scanner | `scripts/audit-ai-marketing-copy.mjs` | Pattern-based scan | N/A | Medium | Add social/schema classification without weakening patterns | Scanner tests |
| SEO/content tests | `tests/seo-policy.test.ts`, `tests/content-quality-policy.test.ts` | Current regression tests | N/A | Low | Harden around schema/social claims | Targeted tests |

## Proposed Action Summary

- Keep useful Product/Offer/Breadcrumb/Organization/WebSite/OnlineStore/FAQ/ItemList surfaces.
- Remove exact shipping delivery timing from Product Offer schema until policy supports handling/transit values.
- Remove unsupported `ReturnByMail` return method while keeping the FAQ-supported seven-day finite return window.
- Replace OpenGraph image authenticity/smooth-checkout wording with factual site-summary copy.
- Add tests to prevent reintroducing unsupported schema, social-preview, and metadata claims.
- Add scanner classification for structured-data and social-preview surfaces.
