# Step 190 - JSON-LD Schema Wording Review

## Scope

This loop reviewed JSON-LD/schema wording surfaces. The active JSON-LD helper is `src/backend/seo/structured-data.ts`; the allowed edit list referenced `src/backend/seo/jsonld.ts`, which does not exist.

## Files Changed

None in this loop.

## Review Result

- Product JSON-LD uses product name, description, images, SKU, URL, category, offer price, currency, availability, seller name, shipping details, return policy, ratings, and reviews from existing inputs.
- Website JSON-LD uses `SEO.defaultDescription`; this wording was improved indirectly through `src/backend/seo/constants.ts`.
- Organization and OnlineStore JSON-LD use existing contact/config fields.
- FAQ JSON-LD is generated from visible FAQ page content; the FAQ wording was cleaned in the allowed FAQ file.

## Claims Not Added

No new schema claims were added for brand, GTIN, MPN, review snippets, shipping promises, return guarantees, seller relationships, or payment providers.

## Remaining Risk

`structured-data.ts` still deserves a dedicated future schema/content alignment pass because it contains shipping and return policy properties. That file was outside this batch's edit allowlist, so it was reviewed but not changed.
