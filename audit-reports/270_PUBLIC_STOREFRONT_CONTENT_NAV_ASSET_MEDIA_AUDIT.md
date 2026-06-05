# Step 270 - Public Storefront Content, Navigation, Asset, And Media Audit

## Scope And Starting State

Step 270 combined public storefront content/navigation acceptance, owner-edit checklist creation, dirty public asset deletion hygiene, and offscreen/lazy product-media source risk auditing.

Starting state:

- Latest commit before Step 270: `a3bfa21 docs: add public storefront visual acceptance qa`
- Step 269 public visual/regression QA passed.
- Step 269 was report/evidence-only.
- Product detail QA used `/products/iphone-15-pro-128gb`.
- Product-view POSTs were intercepted during browser QA.
- Three tracked public asset deletions remained dirty after Step 269:
  - `public/assets/README.md`
  - `public/assets/branding/readme-storefront-preview.png`
  - `public/assets/readme/storefront-preview.png`

Step 270 did not change runtime behavior. The only non-report action was restoring those three tracked public assets exactly from `HEAD` after reference review showed the README preview deletion was unsafe.

## Latest Commit Verification

Verified with `git log -3 --oneline`:

- `a3bfa21 docs: add public storefront visual acceptance qa`
- `b9a30ed docs: add category image visual acceptance qa`
- `6bfd337 fix: make category image replacements reliable`

## Files Inspected

Primary files and areas inspected:

- `audit-reports/269_PUBLIC_STOREFRONT_VISUAL_ACCEPTANCE_QA.md`
- `audit-reports/269-public-storefront-visual-qa/public-storefront-visual-evidence.json`
- `audit-reports/270_NEXT_PROMPT_DRAFT.md`
- `README.md`
- `public/assets/README.md`
- `public/assets/branding/readme-storefront-preview.png`
- `public/assets/readme/storefront-preview.png`
- `src/frontend/components/layout/Header.tsx`
- `src/frontend/components/layout/Footer.tsx`
- `src/frontend/components/home/*`
- `src/frontend/components/product/*`
- `src/frontend/components/content/TrackOrderLookup.tsx`
- `src/app/(store)/**`
- `src/shared/category-media.ts`
- `src/shared/assets.ts`
- `src/shared/contact.ts`
- `prisma/seed.ts`
- `scripts/audit-storefront-media-sources.mjs`
- `scripts/repair-storefront-image-sources.mjs`
- `scripts/repair-known-broken-image-urls.mjs`
- `tests/category-media.test.ts`
- `tests/storefront-image-source.test.ts`
- `tests/storefront-media-remote-policy.test.ts`

## Multi-Agent Risk Decisions

Read-only lanes were used for:

- Dirty public asset deletion analysis.
- Public content/navigation and owner-facing copy audit.
- Product/media source inventory.

Coordinator decisions:

- Restore the three public asset deletions exactly from `HEAD`; do not commit accidental public asset deletion.
- Do not edit footer/payment logos, category images, product images, or PromoSection.
- Do not change owner-sensitive copy in this step.
- Document public copy risks instead of silently rewriting launch promises.
- Do not download, generate, replace, rename, recompress, or optimize images.
- Do not change payment, checkout, auth, order, seller, tracking, CSP, rate-limit, Prisma schema, migrations, or deployment behavior.

## Public Content And Navigation Acceptance Result

Result: accepted for technical navigation continuity, with owner-facing launch copy risks documented.

Public navigation was not found to contain removed Flash Deals links. Core storefront routes remained reachable in the safe route/browser check. However, several text/promise areas need owner approval before launch because they imply capabilities or policies that are not fully live yet.

## Header And Navigation Checklist

| Item | Result | Notes |
| --- | --- | --- |
| Header internal navigation | Pass with owner review | Core links were present and route checks passed. |
| Removed Flash Deals links | Pass | No active `/deals`, `flash-sales`, Flash Deals, or Flash Sale storefront/admin links found in inspected public source. |
| Category scope | Needs owner review | Header lists active launch categories, while About copy mentions "toys, and more". Keep generic or align once paused categories are finalized. |
| Search entry points | Pass | Search routes `/search?q=phone` and `/search?q=serum` returned 200. |

## Homepage Content And CTA Checklist

| Item | Result | Notes |
| --- | --- | --- |
| Homepage route | Pass | `/` returned 200. |
| Homepage visual baseline | Pass by Step 269 evidence | Step 269 screenshots and normalized in-viewport checks passed. |
| Homepage product/media references | Needs future media pass | Some seed product media remains remote and can surface in product sections depending on DB state. |
| Unsupported Flash Deals restoration | Pass | No restoration attempted. |

## Category, Search, And Product Content Checklist

| Item | Result | Notes |
| --- | --- | --- |
| Category index | Pass | `/category` returned 200. |
| Electronics category | Pass | `/category/electronics` returned 200. |
| Fashion category | Pass | `/category/fashion` returned 200. |
| Beauty & Health category | Pass | `/category/beauty-health` returned 200. |
| Search routes | Pass | `/search?q=phone` and `/search?q=serum` returned 200. |
| Product detail | Pass with interception | `/products/iphone-15-pro-128gb` returned 200; product-view POST was intercepted. |
| Product media | Needs dedicated future action | See media source audit. |

## Cart, Checkout, And Track-Order Checklist

| Item | Result | Notes |
| --- | --- | --- |
| Cart route | Pass | `/cart` returned 200. |
| Checkout unauthenticated boundary | Pass | `/checkout` redirected to `/auth/login?callbackUrl=/checkout&reason=checkout`; no place-order UI exposed. |
| Track-order route | Pass with owner copy review | `/track-order` returned 200. Copy references confirmation email/account order number; FAQ mentions email/SMS tracking and needs owner verification. |
| Order/payment/coupon actions | Not performed | No checkout submit, payment call, coupon submit, or order creation action was clicked. |

## Footer, Social, Payment, And COD Checklist

| Item | Result | Notes |
| --- | --- | --- |
| YouTube URL | Pass | Exact URL remained `https://www.youtube.com/@Boilabin`. |
| bKash logo | Pass | Present in footer. |
| Nagad logo | Pass | Present in footer. |
| Visa logo | Pass | Present in footer. |
| Mastercard logo | Pass | Present in footer. |
| COD in payment-logo row | Pass | COD absent from the footer payment-logo row. |
| Footer wording | Needs owner review | Footer says "We accept" while online/card payments are not enabled. Consider relabeling as planned/payment options or updating once payment providers are live. |

## SEO And Public Metadata Owner-Facing Notes

- `/robots.txt` returned 200.
- `/sitemap.xml` returned 200.
- Track-order remains a public utility route that should stay noindex/private-safe.
- Step 269 confirmed removed routes stayed removed.
- No search-engine provider verification or hosting deployment was attempted.

## Dirty Public Asset Deletion Analysis

All three dirty tracked deletions were restored exactly from `HEAD`.

| File | References Found | Runtime/App Reference | Decision |
| --- | --- | --- | --- |
| `public/assets/README.md` | `scripts/audit-ai-marketing-copy.mjs` scan target; audit inventories | No runtime link found | Restored. It is asset hygiene documentation and a known audit scan target. |
| `public/assets/branding/readme-storefront-preview.png` | Audit/inventory references only; same tracked blob as README preview image | No runtime link found | Restored conservatively because no explicit duplicate-cleanup approval existed. |
| `public/assets/readme/storefront-preview.png` | `README.md` preview image at line 32 | README documentation depends on it | Restored. Deleting it would break the README storefront preview. |

Final asset deletion hygiene result:

- The worktree no longer contains those three dirty deletions.
- No public asset deletion was staged or committed.
- If the duplicate branding preview should be deleted later, do it in a dedicated cleanup that updates inventories and confirms external/public-link impact.

## Product And Media Source Audit

Evidence files:

- `audit-reports/270-public-storefront-content-nav-asset-media-audit/asset-media-content-summary.json`
- `audit-reports/270-public-storefront-content-nav-asset-media-audit/route-browser-check.json`

Current classification:

| Source Type | Result |
| --- | --- |
| Category assets | Local stable assets in `src/shared/category-media.ts`; Baby & Kids remains intentionally absent. |
| Primary homepage hero assets | iPhone and Galaxy hero seed references use local `/assets/banners/*` files. |
| Product local upload paths | 6 seed product image references use local `/uploads/products/*` paths. |
| Product seed remotes | 14 product seed image references still use Unsplash remote URLs. |
| Accepted unresolved hero remote | 1 Sony hero remote remains accepted/inventoried. |
| Sample order remote | 1 sample-order image remote remains in seed data. |
| Brand logos | Remote placeholder logos remain in seed data. |
| Stale replacement remotes | 0 stale product replacement remotes reported by the audit script. |
| Unexpected seed hero remotes | 0 unexpected seed hero remotes reported by the audit script. |

Decision:

- Do not replace remote media in Step 270.
- The remaining remote media requires owner-approved local replacement assets or a dedicated product-media localization step.
- Do not restore `/assets/categories/baby-kids.jpg`; tests intentionally assert that it remains absent.

## Owner-Edit Checklist Before Launch

Owner/product decisions needed before launch:

- Decide whether footer "We accept" should be changed while online/card payment providers are disabled.
- Decide whether "Secure checkout" copy should be neutralized until payment/security claims are formally approved.
- Confirm real email/SMS/tracking behavior before keeping FAQ tracking promises.
- Pick one delivery timing policy and align FAQ, Shipping, and Checkout copy.
- Decide whether About/category copy should mention toys while paused category/image work is still not fully owner-approved.
- Provide approved local product/brand/Sony/sample-order media if full storefront media localization is desired.
- Decide whether the duplicate branding README preview image should remain or be removed in a future cleanup.

## Links, Copy, Or Content Needing Owner Approval

Known owner-facing copy risks:

- `src/app/(store)/checkout/page.tsx`: "Secure checkout" metadata copy.
- `src/frontend/components/checkout/CheckoutClient.tsx`: "Secure checkout" visible copy and checkout delivery estimate.
- `src/frontend/components/layout/Footer.tsx`: "We accept" payment wording while online payments are not live.
- `src/frontend/components/content/TrackOrderLookup.tsx`: order number source wording.
- `src/app/(store)/faq/page.tsx`: email/SMS tracking and delivery timing claims.
- `src/app/(store)/shipping/page.tsx`: delivery timing policy.
- `src/app/(store)/about/page.tsx`: broad category scope wording.

## Items Intentionally Skipped

- No source copy changes were made because the flagged wording needs owner/product approval.
- No footer visual or payment-logo layout edits were made.
- No product/category/hero image replacement was attempted.
- No remote image download/generation/optimization was attempted.
- No authenticated checkout, order creation, coupon submit, payment provider, seller, tracking, deployment, schema, migration, or seed action was attempted.
- No private env files were read.

## Route And Browser Safety Result

Compact route/browser safety evidence passed:

| Check | Result |
| --- | --- |
| Route statuses | Pass |
| Product detail `/products/iphone-15-pro-128gb` | Pass |
| Product-view POST interception | Pass, 1 intercepted / 1 fulfilled / 0 continued |
| Checkout unauthenticated redirect | Pass |
| Footer YouTube/payment/COD | Pass |
| Removed `/deals` route | Pass, 404 |
| Removed `/api/admin/flash-sales` route | Pass, 404 |
| Console/network hard failures | None found |

## Validation Commands And Results

Validation passed.

| Command | Result |
| --- | --- |
| `git status --short` | Passed; only Step 270 report/evidence files were dirty after public asset restore |
| `git log -3 --oneline` | Passed; latest commit was `a3bfa21 docs: add public storefront visual acceptance qa` |
| `git diff --cached --name-only` | Passed; no files staged before exact-file staging |
| `git diff --check -- audit-reports/270_PUBLIC_STOREFRONT_CONTENT_NAV_ASSET_MEDIA_AUDIT.md audit-reports/271_NEXT_PROMPT_DRAFT.md audit-reports/270-public-storefront-content-nav-asset-media-audit` | Passed |
| `git diff --check -- public/assets/README.md public/assets/branding/readme-storefront-preview.png public/assets/readme/storefront-preview.png` | Passed; no remaining diff after restore |
| `node scripts/boilabin-terminal-loop-state.mjs` | Passed |
| `node scripts/boilabin-advisor-state.mjs` | Passed |
| `npm run db:url:safety` | Passed; no database connection attempted |
| `npm run db:prisma:local:validate` | Passed |
| `npm run db:prisma:local:generate` | Passed |
| `node scripts/audit-local-auth-fixture-readiness.mjs` | Passed with `manual-owner-action-required` |
| `node scripts/audit-ai-marketing-copy.mjs` | Completed with 51 known findings, including public claim/copy items documented in this report |
| `node scripts/audit-search-verification-readiness.mjs` | Passed |
| `node scripts/audit-storefront-media-sources.mjs` | Passed; 14 product seed remotes, 7 local replacements, 0 stale replacement remotes |
| `npx tsx --test tests/category-media.test.ts tests/storefront-image-source.test.ts tests/storefront-media-remote-policy.test.ts` | Passed, 11/11 |
| `npm run typecheck` | Passed |
| `npm run lint` | Passed |
| `npm test` | Passed, 389/389 |
| `npm run build` | Passed |

## Exact Files Changed Or Staged

Expected Step 270 commit files:

- `audit-reports/270_PUBLIC_STOREFRONT_CONTENT_NAV_ASSET_MEDIA_AUDIT.md`
- `audit-reports/271_NEXT_PROMPT_DRAFT.md`
- `audit-reports/270-public-storefront-content-nav-asset-media-audit/asset-media-content-summary.json`
- `audit-reports/270-public-storefront-content-nav-asset-media-audit/route-browser-check.json`

The three public assets were restored to match `HEAD`, so they are not expected to appear in the final staged diff.

## Prohibited Actions Confirmation

Step 270 did not:

- Read private env files.
- Print secrets, full DB URLs, tokens, cookies, auth headers, customer/order PII, payment secrets, or private connection strings.
- Run migrations, `db push`, seed/reset, destructive SQL, Docker setup, provider CLI, package updates, or deployment.
- Change checkout/payment/order/auth behavior.
- Create orders.
- Click Place Order.
- Submit payment/coupon/order forms.
- Call payment providers.
- Restore Flash Deals.
- Edit Prisma schema or migrations.
- Edit seller, tracking backend, CSP enforcement, rate-limit, deployment, or mobile app files.
- Replace, generate, download, rename, recompress, or optimize images.
- Use broad staging.

## Remaining Risks

- Owner-facing copy still contains claims/policies needing launch approval.
- Footer payment wording may overstate live payment acceptance while online payments remain disabled.
- 14 product seed image references, 1 Sony hero, 1 sample-order image, and brand logo placeholders remain remote.
- Full authenticated checkout shell QA still depends on local buyer fixture setup.
- Product media localization requires approved local assets; it should not be invented automatically.

## Recommended Next Step

Run Step 271 as a bounded owner-facing public claims/copy correction batch. Focus on neutralizing "secure checkout", clarifying payment/footer wording while online payments are disabled, aligning delivery/tracking copy, and keeping changes text-only with no footer visual redesign or payment-logo changes.
