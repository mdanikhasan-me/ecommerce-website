# 390 Real Invoice PDF

## Current Problem

Step 388 made the invoice control real enough to open a protected print-friendly HTML invoice at `/account/orders/[id]/invoice`, but the main order-details button still depended on browser print/save behavior. The user wanted a direct downloadable PDF invoice file.

## Chosen PDF Approach

- Added a small server-side PDF writer in project code.
- No new dependency was added.
- The generator writes a real `%PDF-1.4` document using built-in PDF Type1 fonts and uncompressed text streams so order number and totals remain inspectable in proof/tests.
- This avoids a heavy browser/PDF dependency and keeps the route compatible with the existing Next.js server route model.

## Route And Page Status

- HTML invoice page remains: `/account/orders/[id]/invoice`
- New PDF route: `/api/account/orders/[id]/invoice`
- Order Details button now points to the PDF API route and uses `download`.
- HTML invoice page now has a primary `Download PDF` link and a secondary `Print` button.

## Security / Owner Check

- The PDF route requires `auth()`.
- Unauthenticated requests redirect to `/auth/login`.
- Order lookup is owner-scoped through `getOwnedOrderInvoiceContext`, which uses `db.order.findFirst({ where: { id: orderId, userId } })`.
- Missing or wrong-owner orders receive a safe `404` JSON response.
- No public order-number-only invoice route was added.
- No raw customer/order/address/payment data is logged.

Wrong-user browser proof was skipped because the local admin seed login was unavailable in this session. Owner scoping is still enforced by the shared query helper and focused source tests.

## Invoice Fields Included

- Boilabin name.
- `Order Invoice` title.
- Real order number and placed date.
- Customer name and email when available.
- Delivery address for the authenticated owner.
- Payment method and payment status.
- Order status.
- Product line items, SKU, quantity, unit price, and line total.
- Subtotal, shipping, discount/coupon when present, tax only if the stored order tax is greater than zero, and grand total.
- Existing support email and phone.

## Fake Fields Excluded

No fake VAT number, VAT invoice label, tax registration, paid status, transaction ID, courier/tracking number, business license, or legal company address was added.

## Proof

- Owner PDF response status: `200`
- Owner PDF content type: `application/pdf`
- Owner PDF content disposition: `attachment; filename="boilabin-invoice-ZN-2024-00001.pdf"`
- PDF size: `2265` bytes
- PDF SHA-256: `d2715c6fda5b3c702e6ded9f667c672d96ec480737ac63e339e11b28cb2c382a`
- PDF signature check: passed (`%PDF-`)
- PDF contains public order number: yes
- PDF contains total: yes
- Unauthenticated PDF response: `307` to `/auth/login`
- Button-triggered download filename: `boilabin-invoice-ZN-2024-00001.pdf`

## Proof Files

- PDF: `audit-reports/390-real-invoice-pdf/proof/boilabin-invoice-ZN-2024-00001.pdf`
- Button-triggered PDF: `audit-reports/390-real-invoice-pdf/proof/button-triggered-download.pdf`
- Metadata: `audit-reports/390-real-invoice-pdf/proof/response-metadata.json`
- Order details desktop: `audit-reports/390-real-invoice-pdf/proof/order-details-download-button-1520x900.png`
- Order details mobile: `audit-reports/390-real-invoice-pdf/proof/order-details-download-button-390x844.png`
- Invoice page desktop: `audit-reports/390-real-invoice-pdf/proof/invoice-page-download-print-1520x900.png`
- Invoice page mobile: `audit-reports/390-real-invoice-pdf/proof/invoice-page-download-print-390x844.png`

## Files Changed

- `src/backend/orders/order-invoice.ts`
- `src/app/api/account/orders/[id]/invoice/route.ts`
- `src/app/(store)/account/orders/[id]/page.tsx`
- `src/app/(store)/account/orders/[id]/invoice/page.tsx`
- `src/frontend/components/account/PrintInvoiceButton.tsx`
- `tests/order-invoice-route.test.ts`
- `tests/order-invoice-pdf.test.ts`
- `.gitattributes`
- `audit-reports/390-real-invoice-pdf.md`
- `audit-reports/390-real-invoice-pdf/proof/*`

## Validation

- `npm run typecheck`: passed
- `npm run lint`: passed
- `npx tsx --test tests/order-invoice-route.test.ts tests/order-invoice-pdf.test.ts tests/order-progress.test.ts`: passed, 9 tests
- `npm run build`: passed
- `npm test`: passed, 736 tests

## Commit / Push

- Commit message planned: `feat: add real downloadable invoice pdf`
- Exact pushed commit hash and push result will be recorded in the final Codex response after validation and push.

## Guardrails

- No payment gateway behavior changed.
- No database schema or migration changed.
- No Google OAuth files changed.
- No category media storage files changed.
- Added a minimal `*.pdf binary` Git attribute so proof PDF files are not corrupted by line-ending normalization.
- `public/assets/icons/ui/categories/*.svg` was left untouched.
- `public/uploads/admin/banners/hero/` was left untouched.
