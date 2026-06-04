# Step 189 - Metadata Fallback Copy Cleanup

## Scope

This loop cleaned unsupported wording in metadata and SEO fallback helpers without changing canonical URL behavior, noindex/follow rules, route paths, metadata object shapes, or structured data shape.

## Files Updated

- `src/app/layout.tsx`
- `src/backend/config/site.ts`
- `src/backend/seo/constants.ts`
- `src/backend/seo/metadata.ts`
- `src/frontend/components/admin/ProductEditorForm.tsx`

## Metadata Changes

- Global default title changed from "Shop Quality Products Online in Bangladesh" to "Online Shopping in Bangladesh".
- Global descriptions now describe browsing categories and current delivery/payment facts.
- `best price bangladesh` keyword changed to `product price bangladesh`.
- Site config description changed from "premium online marketplace" to "Bangladesh-based online marketplace".
- Product metadata fallback now describes price, product details, category, availability, and checkout options.
- Category metadata fallback now describes visible category listings instead of "best prices".
- Category metadata titles now use "Products in Bangladesh" instead of "Best Prices in Bangladesh".

## Open Graph/Twitter Result

Open Graph and Twitter fallback descriptions now use the same factual global wording.

## Admin Metadata Helper Result

Product editor SEO placeholders and previews no longer suggest "best price", "fast delivery", or "secure checkout" copy.

## Preserved Behavior

- Canonical URLs were unchanged.
- Robots rules were unchanged.
- Metadata generation functions and return shapes were unchanged.
- Product/category route behavior was unchanged.
