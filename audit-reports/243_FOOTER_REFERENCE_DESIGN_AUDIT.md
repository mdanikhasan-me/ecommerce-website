# Step 243 - Footer Reference Design Audit

## 1. Latest Commit Verification

- Latest expected commit: `01a9d4d feat: polish public storefront ui`.
- Verified latest local commit: `01a9d4d feat: polish public storefront ui`.
- Step 239-242 public storefront polish is the current baseline.

## 2. Working Tree Status

- Initial `git status --short`: clean.
- Initial `git diff --cached --name-only`: no staged files.
- No source files were edited before this audit report was created.

## 3. Current Footer Problems From Screenshot/Prompt

The uploaded prompt described the current Boilabin footer as:

- too dark,
- too plain,
- too empty,
- visually disconnected from the storefront,
- awkward in the bottom copyright/payment row,
- not close enough to the preferred e-commerce footer reference.

The current implementation matched that diagnosis: `Footer.tsx` used a single dark `bg-foreground text-background` block, a compact two-column desktop layout, no service strip, and a bottom payment/copyright row that carried most of the visual weight.

No separate image file was available in the attached prompt directory; this audit uses the owner's written screenshot description as the reference evidence.

## 4. Reference Footer Strengths From Screenshot/Prompt

The preferred direction is a light, practical e-commerce footer with:

- a light surface connected to the storefront palette,
- a factual service/trust strip above the main footer,
- a left brand/contact/social block,
- clear link columns for shop, support, account, and legal pages,
- available payment display without claiming unavailable gateways,
- a compact newsletter row only if existing behavior can be reused safely,
- a clean bottom legal/copyright row,
- a compact mobile layout that avoids squeezing the desktop footer into a phone viewport.

## 5. Files Inspected

- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`
- `src/frontend/components/layout/Header.tsx`
- `src/backend/config/payment.ts`
- `src/shared/assets.ts`
- `src/shared/contact.ts`
- `src/app/globals.css`
- `scripts/local-browser-runtime-check.mjs`
- `scripts/audit-ai-marketing-copy.mjs`
- `scripts/audit-search-verification-readiness.mjs`
- `tests/api-error-contract.test.ts`
- `tests/security-runtime-boundary.test.ts`

## 6. Files Selected For Editing

Selected source files:

- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`

Selected audit files:

- `audit-reports/243_FOOTER_REFERENCE_DESIGN_AUDIT.md`
- `audit-reports/244_FOOTER_REDESIGN_IMPLEMENTATION_REPORT.md`
- `audit-reports/245_FOOTER_BROWSER_VISUAL_QA.md`
- `audit-reports/246_NEXT_PROMPT_DRAFT.md`

`Header.tsx` was inspected for support-link consistency and mobile route behavior, but no header edit is planned unless validation finds a directly related footer regression.

`globals.css` was inspected for existing footer helper classes. The current dark-footer helper classes can be avoided by using component-level Tailwind classes, so no global CSS edit is planned.

## 7. Desktop Footer Target Structure

Desktop target:

1. Light footer wrapper with soft top border.
2. Factual service strip with neutral wording:
   - Delivery information,
   - Returns/refunds,
   - Cash on Delivery / available payments,
   - Support/contact.
3. Main content grid:
   - brand/contact/social block,
   - Shop links,
   - Support links,
   - Account links,
   - Legal links.
4. Compact newsletter panel using existing newsletter behavior if safe.
5. Payment row using only currently available gateway logos from `PAYMENT_GATEWAYS.filter((gateway) => gateway.isAvailable)`.
6. Bottom legal row with copyright and legal links.

## 8. Mobile Footer Target Structure

Mobile target:

1. Light background and brand/contact/social summary first.
2. Compact factual service strip in a two-column grid.
3. Grouped link sections using native disclosure/accordion behavior so every section is not open by default.
4. Direct single-purpose support links retained in their grouped section.
5. Compact newsletter if it remains readable and not oversized.
6. Compact payment row and legal row.
7. No tiny text, no horizontal overflow, and no giant always-open footer.

## 9. Payment Logo Behavior To Preserve

The footer must continue to derive visible payment logos from:

```ts
PAYMENT_GATEWAYS
  .filter((gateway) => gateway.isAvailable)
  .flatMap((gateway) => gateway.logos ?? [])
```

Current payment facts:

- Cash on Delivery is available and may be shown.
- bKash and Nagad are only available when `NEXT_PUBLIC_BANGLADESH_ONLINE_PAYMENTS === 'true'`.
- Visa/Mastercard via the Stripe/international-card config are not available and must not be shown as live payment options.

No payment config, payment backend, checkout logic, or gateway availability flag should be changed in this footer batch.

## 10. Protected Account Prefetch Behavior To Preserve

Footer account links that can hit protected routes must keep `prefetch={false}` to avoid public-page prefetch console errors and auth redirect noise:

- `/account`
- `/account/orders`

The redesign may preserve the same link objects and apply `prefetch={link.prefetch}` consistently.

## 11. Content Claims Allowed Vs Prohibited

Allowed factual copy:

- Browse products,
- Manage orders,
- Contact support,
- Delivery information,
- Returns/refunds,
- Cash on Delivery,
- Available payments,
- Help center,
- Track order.

Prohibited or avoided copy:

- trusted,
- premium,
- best,
- authentic,
- guaranteed,
- fast delivery,
- free delivery,
- 24/7 support,
- secure/protected checkout claims beyond existing factual security work,
- seller promotion or "Become a seller" highlighting,
- claims that online payment gateways are live when the availability flag says they are not.

## 12. Implementation Plan

1. Refactor `Footer.tsx` into a light e-commerce footer with factual service items, a brand/contact/social block, responsive link groups, payment display, and bottom legal row.
2. Keep link destinations and protected route `prefetch={false}` behavior stable.
3. Reuse `HomepageNewsletterForm` only after making it visually neutral enough for a light footer while preserving its POST behavior and response handling.
4. Avoid editing `Header.tsx` unless a directly related footer support-link inconsistency or protected prefetch regression is found.
5. Avoid `globals.css` unless component-level classes cannot satisfy the design safely.
6. Run validation and reduced production browser QA focused on footer routes and removed `/deals` surfaces.

## 13. Risk Assessment

- **Payment risk:** showing unavailable logos would mislead buyers. Mitigation: keep existing availability filtering untouched.
- **Auth prefetch risk:** protected account links can cause public-page console noise. Mitigation: keep `prefetch={false}` on protected footer account links.
- **Newsletter risk:** newsletter submits to a DB-backed API. Mitigation: visual checks do not submit the form; implementation preserves existing behavior.
- **Mobile height risk:** grouped links can make the footer too tall. Mitigation: use collapsed mobile disclosure sections.
- **Unsupported-claims risk:** footer copy could accidentally imply guarantees. Mitigation: use neutral factual wording only and run the marketing-copy audit.
- **Scope risk:** footer work could drift into backend, payment, SEO, or route behavior. Mitigation: exact allowlist and exact-file staging only.
