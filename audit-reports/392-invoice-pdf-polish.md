# 392 Invoice PDF Polish

## Current Visual Problems

- The Step 391 support icon was drawn from several simple polylines and rendered like a broken house shape rather than a clean headset.
- The support row sat low and looked cramped beside the icon.
- The item table columns were too tight. Product names and SKUs could visually collide because item and SKU text were not width-limited.
- SKU, quantity, unit, and line-total columns did not have an explicit layout contract.

## Root Cause

The PDF writer is intentionally dependency-free and draws raw PDF text/vector operations. The old support icon depended on hand-tuned path geometry that did not survive PDF viewer scaling well. The table issue came from fixed x positions plus unconstrained text output, so long strings could run into adjacent columns.

## Fixes

- Replaced the messy support vector with a simple, reliable circle + `?` support mark.
- Re-aligned the support title, email, phone, and separator.
- Added table layout constants for item, SKU, quantity, unit, and line-total columns.
- Added max-width fitting for PDF text so long SKUs/prices truncate safely with `...`.
- Wrapped product names into a bounded item column.
- Kept totals right-aligned to the same right edge as the line-total column.

## Security And Data

- Secure PDF route stayed unchanged: `/api/account/orders/[id]/invoice`.
- Owner-scoped order lookup stayed unchanged through `getOwnedOrderInvoiceContext`.
- Unauthenticated live route proof returned `307` to `/auth/login`.
- No fake VAT, tax registration, transaction ID, tracking number, paid status, or legal company claims were added.
- No new PDF dependency was added.

## Proof

- PDF: `audit-reports/392-invoice-pdf-polish/proof/boilabin-invoice-ZN-2024-00001.pdf`
- Rendered first-page screenshot: `audit-reports/392-invoice-pdf-polish/proof/invoice-pdf-rendered-page.png`
- Chromium 100% PDF viewer screenshot: `audit-reports/392-invoice-pdf-polish/proof/_pdf-viewer-full.png`
- Metadata: `audit-reports/392-invoice-pdf-polish/proof/response-metadata.json`
- PDF size: `4923` bytes
- PDF SHA-256: `96fefadcb3aae9ae906ce680858d4f9212e5e289a56f0039e886a27ff4ba85c5`
- Rendered screenshot: `807x1124`, SHA-256 `ee3b3a56733adb370491374d951726c04e97feed043da06744f6a5257b9a009d`

## Before vs After

- Support row: fixed; simplified icon now renders cleanly.
- Icon treatment: intentionally simplified to avoid raw-vector artifacting.
- Table columns: improved with explicit column positions and text bounds.
- Long product/SKU handling: now wraps/truncates safely instead of overlapping.
- Totals: remain aligned to the line-total column.

## Product Detail Image Scroll Addendum

### Problem

The product image/gallery column could follow the page scroll into lower product content. On product detail pages this made the media feel detached from the buy box and risked overlapping Product Description, Specifications, Customer Reviews, and related-product content.

### Root Cause

`src/frontend/components/product/ProductDetailClient.tsx` applied `md:sticky md:top-24` to the media column while Product Description was still rendered inside the same product-detail grid. The sticky gallery was therefore allowed to remain fixed while lower grid rows moved underneath it.

### Fix

Removed the desktop sticky positioning from the product media column. The gallery now stays in its normal document position, so it cannot float over Product Description or Customer Reviews.

### Product Proof

- Product page top 1520x900: `audit-reports/392-invoice-pdf-polish/product-proof/product-1520-top.png`
- Product Description 1520x900: `audit-reports/392-invoice-pdf-polish/product-proof/product-1520-description-forced.png`
- Customer Reviews 1520x900: `audit-reports/392-invoice-pdf-polish/product-proof/product-1520-reviews.png`
- Product Description 1250x900: `audit-reports/392-invoice-pdf-polish/product-proof/product-1250-description-forced.png`
- Customer Reviews 1250x900: `audit-reports/392-invoice-pdf-polish/product-proof/product-1250-reviews.png`
- Product page top 1024x900: `audit-reports/392-invoice-pdf-polish/product-proof/product-1024-top.png`
- Mobile top 390x844: `audit-reports/392-invoice-pdf-polish/product-proof/product-390-top.png`
- Mobile Product Description 390x844: `audit-reports/392-invoice-pdf-polish/product-proof/product-390-description.png`
- Mobile Customer Reviews 390x844: `audit-reports/392-invoice-pdf-polish/product-proof/product-390-reviews.png`
- Measurement proof: `audit-reports/392-invoice-pdf-polish/product-proof/product-overlap-measurements.json`

### Product Verification

- 1520px forced Product Description: gallery bottom was `-103`, description top was `110`, overlap `false`.
- 1250px forced Product Description: gallery bottom was `-180`, description top was `110`, overlap `false`.
- 1520px Customer Reviews: gallery bottom was `-574`, reviews top was `187`, overlap `false`.
- 1250px Customer Reviews: gallery bottom was `-677`, reviews top was `187`, overlap `false`.
- 390px Product Description and Customer Reviews: overlap `false` in both scrolled states.

## Files Changed

- `src/backend/orders/order-invoice.ts`
- `src/frontend/components/product/ProductDetailClient.tsx`
- `tests/order-invoice-pdf.test.ts`
- `audit-reports/392-invoice-pdf-polish.md`
- `audit-reports/392-invoice-pdf-polish/proof/*`
- `audit-reports/392-invoice-pdf-polish/product-proof/*`

## Validation

- `npm run typecheck`: passed
- `npm run lint`: passed
- `npx tsx --test tests/order-invoice-pdf.test.ts tests/order-invoice-route.test.ts`: passed
- `npm run build`: passed
- `npm test`: passed, 738 tests

## Commit

- `style: polish invoice pdf layout`
