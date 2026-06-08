# 391 Invoice PDF Reference Redesign

## Goal

Make the downloaded invoice PDF match the provided white A4 reference layout closely, while keeping the same secure owner-scoped route and real order data.

## What Changed

- Reworked `src/backend/orders/order-invoice.ts` into a real page-layout PDF generator with built-in fonts and vector rules.
- Kept the existing secure PDF route unchanged.
- Added focused PDF layout assertions in `tests/order-invoice-pdf.test.ts`.

## Layout Result

- White A4 portrait page.
- Large `Boilabin` wordmark at the top-left.
- `Order Invoice` title below it.
- Strong divider line under the header.
- Left metadata block with label/value rows.
- Two-column customer and delivery address section with a vertical divider.
- Item table with `Item`, `SKU`, `Qty`, `Unit`, and `Line total`.
- Right-aligned totals block with subtotal, shipping, and grand total.
- Bottom support row with icon, email, phone, and divider.

## Security And Data

- The PDF route still requires authentication.
- Ownership scoping is unchanged.
- The PDF uses real order data only.
- No fake VAT, tax registration, transaction ID, courier data, or legal claims were added.
- No new PDF dependency was added.

## Proof

- PDF: `audit-reports/391-invoice-pdf-reference-redesign/proof/boilabin-invoice-ZN-2024-00001.pdf`
- Rendered PDF screenshot: `audit-reports/391-invoice-pdf-reference-redesign/proof/invoice-pdf-rendered-page.png`
- Chromium viewer screenshot: `audit-reports/391-invoice-pdf-reference-redesign/proof/_pdf-viewer-full.png`
- Metadata: `audit-reports/391-invoice-pdf-reference-redesign/proof/response-metadata.json`
- PDF size: `5156` bytes
- PDF SHA-256: `83ce032df6e261f155dc5e1e4bf8cd6fac5fac449063129f081e10b0d1a78c4d`
- Rendered screenshot size: `807x1124`
- Chromium viewer screenshot size: `1280x1600`

## Route Status

- PDF route path: `/api/account/orders/[id]/invoice`
- Unauthenticated fetch: `307` to `/auth/login`
- Owner-scoped route contract remains covered by focused source tests.

## Validation

- `npx tsx --test tests/order-invoice-pdf.test.ts tests/order-invoice-route.test.ts`: passed
- `npm run typecheck`: passed
- `npm run lint`: passed
- `npm run build`: passed
- `npm test`: passed

## Commit

- Pending.
