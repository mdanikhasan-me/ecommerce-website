# Step 247 - Footer Reference Image Alignment

## Scope

The owner provided the actual preferred footer reference image after Step 243-246 was committed.

This step refines the already-redesigned footer to align more closely with the image structure while preserving Boilabin facts, existing routes, current payment availability logic, and backend behavior.

Reference image observed:

- light footer surface,
- top service strip,
- brand and social block on the left,
- desktop link columns in the main row,
- payment and newsletter row separated below the main links,
- mobile accordion link groups,
- compact mobile newsletter row with an arrow button,
- compact payment row,
- bottom copyright/legal links with separators.

## Latest Commit Verification

- Starting commit: `639e065 feat: redesign storefront footer`.
- Starting working tree: clean before this follow-up edit.
- No files were staged before this follow-up edit.

## Files Changed

Source files changed:

- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/layout/NewsletterForm.tsx`

Audit file added:

- `audit-reports/247_FOOTER_REFERENCE_IMAGE_ALIGNMENT.md`

No backend, route, auth, payment, tracking, seller, Prisma, SEO, sitemap/robots, media asset, category image, or deployment files were changed.

## Reference Alignment Changes

Footer structure was adjusted closer to the provided image:

- Changed the top service strip from card-like blocks to a lighter inline strip.
- Changed the desktop main area to brand/social plus link columns only.
- Moved newsletter out of the main grid into the lower row.
- Added a lower row that mirrors the reference layout:
  - `We accept` payment area,
  - `Stay in the loop` newsletter area.
- Added a compact inline footer newsletter mode with an icon-only mobile submit button and explicit accessible label.
- Added `About Us` and `Policies` grouped sections to better match the reference.
- Kept the required `Account` section because Boilabin footer requirements include buyer account links.
- Added a bottom `Sitemap` link to the existing `/sitemap.xml` route.
- Added bottom legal separators similar to the reference.

## Preserved Boilabin Facts

The reference image contains generic claims such as free delivery, secure payments, 24/7 support, and trusted destination. Those were not copied.

The Boilabin footer keeps neutral factual wording only:

- Delivery information,
- Returns and refunds,
- Cash on Delivery,
- Support and contact,
- payment methods follow current checkout availability,
- launch alerts, selected offers, and useful updates.

No seller promotion was added.

## Payment Behavior

Payment logo behavior remains unchanged:

```ts
PAYMENT_GATEWAYS
  .filter((gateway) => gateway.isAvailable)
  .flatMap((gateway) => gateway.logos ?? [])
```

The footer does not manually add Visa, Mastercard, bKash, Nagad, or other unavailable methods. It only displays logos made available by the existing payment configuration.

No payment backend or checkout logic was changed.

## Protected Link / Prefetch Behavior

Protected account links still keep prefetch disabled:

- `/account`
- `/account/orders`

This preserves the previous protection against public-page protected-route prefetch noise.

## Newsletter Behavior

Newsletter behavior was preserved.

`HomepageNewsletterForm` now supports:

- `layout="stacked"` as the default existing behavior,
- `layout="inline"` for the footer reference-style row.

The form still posts to `/api/newsletter` with `email` and `source`. No API route or database behavior was changed.

## Validation Results So Far

Commands run before this report was created:

```powershell
git diff --check -- src/frontend/components/layout/Footer.tsx src/frontend/components/layout/NewsletterForm.tsx
npm run typecheck
npm run lint
```

Results:

- `git diff --check`: passed with CRLF warnings only.
- `npm run typecheck`: passed.
- `npm run lint`: passed.

Final validation and browser QA are recorded below after reruns.

## Final Validation Results

Final commands run:

```powershell
node scripts/boilabin-terminal-loop-state.mjs
node scripts/boilabin-advisor-state.mjs
npm run db:url:safety
node scripts/audit-ai-marketing-copy.mjs
node scripts/audit-search-verification-readiness.mjs
npm run typecheck
npm run lint
npm test
npm run build
```

Results:

- `node scripts/boilabin-terminal-loop-state.mjs`: passed.
- `node scripts/boilabin-advisor-state.mjs`: passed.
- `npm run db:url:safety`: passed; no database connection attempted, app/shadow URLs classify local and separate.
- `node scripts/audit-ai-marketing-copy.mjs`: completed with the known 52 pre-existing findings; no changed footer source finding was introduced.
- `node scripts/audit-search-verification-readiness.mjs`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, `373/373`.
- `npm run build`: passed.

## Browser QA Result

Reduced production browser QA command:

```powershell
node --input-type=module -e "const m = await import('./scripts/local-browser-runtime-check.mjs'); m.BROWSER_RUNTIME_ROUTES.splice(0, m.BROWSER_RUNTIME_ROUTES.length, '/', '/category', '/category/electronics', '/search?q=phone', '/cart', '/track-order', '/deals', '/api/admin/flash-sales'); const result = await m.runBrowserRuntimeCheck(m.parseBrowserCheckArgs(['--mode','start','--port','3131','--cdp-port','9331','--startup-timeout-ms','90000','--request-timeout-ms','20000'])); console.log(JSON.stringify(result, null, 2)); if (!result.ok) process.exit(1);"
```

Result:

- passed in production `next start` mode,
- 32 page/viewport checks,
- 7 accessibility checks,
- no horizontal overflow,
- no broken visible images,
- no console errors,
- no failed requests,
- no server errors,
- no protected account prefetch noise,
- `/deals` remains removed,
- `/api/admin/flash-sales` remains removed.

Focused changed-source claim search found no prohibited claim text in:

- `src/frontend/components/layout/Footer.tsx`,
- `src/frontend/components/layout/NewsletterForm.tsx`.

## Prohibited Actions Confirmation

Not performed:

- migrations,
- Prisma schema edits,
- `prisma db push`,
- seed/reset,
- SQL,
- Docker,
- deployment/provider CLI,
- package updates,
- backend behavior changes,
- payment behavior changes,
- tracking changes,
- seller marketplace changes,
- product lifecycle changes,
- media/category asset edits,
- Flash Deals restoration,
- broad staging.

No secrets, DB URLs, tokens, credentials, cookies, auth headers, payment secrets, private connection strings, or customer/order PII were printed.

## Remaining Risks

- Human visual review is still needed to compare the final Boilabin footer against the reference screenshot.
- The reference image includes unsupported generic claims and unavailable payment logos; Boilabin intentionally does not copy those.
- The footer now includes five mobile accordions instead of the reference's four because Boilabin keeps required account links.

## Recommended Next Step

Recommended next step: rerun focused product detail/cart/checkout visual QA only after a tracking-safe product-detail preflight, as described in `audit-reports/246_NEXT_PROMPT_DRAFT.md`.
