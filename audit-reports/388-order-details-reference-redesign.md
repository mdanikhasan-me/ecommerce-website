# 388 Order Details Reference Redesign

## Summary

The order details page was redesigned to match the desktop/mobile reference more closely and the Download Invoice control is now a real secure route instead of a decorative button.

## Before

- The page used a simpler order details layout with a weaker hierarchy.
- The invoice control was not routed as a real invoice surface.
- Mobile order-item presentation stacked awkwardly and wasted vertical space.

## What Changed

- Added a structured top summary row with order number, copy action, placed date, status, total, and a real Download Invoice link.
- Added a five-step order progress tracker driven by shared progress helpers.
- Kept real owner-scoped order data, items, delivery address, payment state, and return logic.
- Added a print-friendly invoice page at the secure owner-only route.
- Tightened the mobile order-item row so image, text, and line total stay compact.

## Invoice Download

### What existed before

- The order details page did not have a real secure invoice route.

### What powers it now

- Route: `/account/orders/[id]/invoice`
- Page file: `src/app/(store)/account/orders/[id]/invoice/page.tsx`
- Button target on order details: `/account/orders/${order.id}/invoice`

### Format

- Print-friendly HTML, not PDF.
- No new PDF dependency was added.

### Security / ownership

- Requires authentication.
- Uses `db.order.findFirst({ where: { id, userId: session.user.id } })`.
- Unauthenticated access redirects to login.
- Wrong-user access returns `notFound()`.
- No fake VAT, transaction ID, courier, or paid claims were added.

### Proof

- Owner invoice response: `200 text/html; charset=utf-8`
- Owner invoice body includes the real order number and total.
- Unauthenticated access returns `307` to the login callback.

### Screenshot evidence

- `audit-reports/388-order-details-reference-redesign/screenshots/order-details-1520x900.png`
- `audit-reports/388-order-details-reference-redesign/screenshots/order-details-1250x900.png`
- `audit-reports/388-order-details-reference-redesign/screenshots/order-details-1024x900.png`
- `audit-reports/388-order-details-reference-redesign/screenshots/order-details-390x844.png`
- `audit-reports/388-order-details-reference-redesign/screenshots/invoice-owner-1520x900.png`
- `audit-reports/388-order-details-reference-redesign/screenshots/invoice-owner-390x844.png`
- `audit-reports/388-order-details-reference-redesign/screenshots/invoice-unauth-redirect-login.png`

## Files Changed

- `src/app/(store)/account/orders/[id]/page.tsx`
- `src/app/(store)/account/orders/[id]/invoice/page.tsx`
- `src/backend/orders/order-progress.ts`
- `src/frontend/components/account/CopyOrderNumberButton.tsx`
- `src/frontend/components/account/PrintInvoiceButton.tsx`
- `tests/order-invoice-route.test.ts`
- `tests/order-progress.test.ts`

## Validation

- `npm run lint` passed.
- `npm run typecheck` failed on an existing auth config type issue in `src/backend/auth/config.ts`.
- `npm test` failed on pre-existing `tests/admin-media-orphan-audit.test.ts` issues unrelated to this step.
- `npm run build` failed on the same pre-existing auth config type issue.

## Notes

- The protected category SVG edits were left alone.
- `public/uploads/admin/banners/hero/` was left alone.
- Wrong-user browser proof was not practical in this local DB because the only other non-owner account with a password did not have a working matching password, and the remaining extra customer is Google-only. The code and tests still enforce owner-scoped access.
