# Step 318 Browser Runtime Smoke Cleanup

## Scope

This step investigated the remaining Edge/CDP browser runtime smoke warnings after Step 317. It did not redo the Step 317 ARIA cleanup and did not change navbar/header visuals, homepage visuals, Help visuals, product media repair logic, auth logic, payment/tracking, env files, packages, Prisma schema/migrations, seed data, or DB rows.

Pre-existing dirty files intentionally left untouched:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Baseline Smoke

Command:

```bash
node scripts/local-browser-runtime-check.mjs --mode dev --port 3118 --cdp-port 9418 --startup-timeout-ms 90000 --request-timeout-ms 20000
```

Saved evidence:

- `audit-reports/318-browser-runtime-smoke-cleanup/baseline-runtime-check.json`
- `audit-reports/318-browser-runtime-smoke-cleanup/baseline-runtime-output.txt`
- `audit-reports/318-browser-runtime-smoke-cleanup/baseline-git-status.txt`

Result: failed, exit code 1.

Baseline nonzero items:

- 32 Next.js image `localPatterns` future-compat warnings across homepage viewports.
- 1 NextAuth `ClientFetchError` console error on `/category/electronics` at `mobile-390`.
- 1 failed accessibility helper result: `mobile search focus and Escape`.

## Warning Classification

| Item | Classification | Root cause |
| --- | --- | --- |
| Next image `localPatterns` query warnings | Next.js future-compat warning | Local category image URLs use `?v=` cache-busting query strings, but `next.config.js` had no `images.localPatterns`, so Next emitted the future Next 16 warning. |
| NextAuth `ClientFetchError` | Environment/session-only smoke warning | `Header.tsx` uses `useSession`, so public pages trigger the normal NextAuth session fetch. The smoke helper starts Next on arbitrary ports but did not pin `AUTH_URL`/`NEXTAUTH_URL` to that local smoke origin. Baseline CDP evidence did not record a failed request URL/status; it recorded only the browser console `ClientFetchError`. |
| Mobile search focus helper miss | Test/helper bug | The helper clicked `input[type="search"]` before opening the mobile search panel. The app already exposes a labeled mobile search button: `data-testid="mobile-search-button"` and `aria-label="Search products"`. |

## Image Warning Details

Exact warning family:

```txt
Image with src "/assets/categories/...jpg?v=..." is using a query string which is not configured in images.localPatterns. This config will be required starting in Next.js 16.
```

Triggering URLs were local category source assets, not remote images:

- `/assets/categories/electronics.jpg?v=75b478cf761d`
- `/assets/categories/fashion.jpg?v=50f7092c1d2d`
- `/assets/categories/home-appliances.jpg?v=4ea4173c04ae`
- `/assets/categories/beauty-health.jpg?v=5709ce7f5817`
- `/assets/categories/sports-fitness.jpg?v=f91b7397630a`
- `/assets/categories/books-stationery.jpg?v=9b0fa704b0cb`
- `/assets/categories/gaming.jpg?v=1ec2f8930d9a`
- `/assets/categories/toys-collectibles.jpg?v=18811d8fecf3`

Installed Next matcher evidence showed `search: ''` would reject these query-string URLs, while omitting `search` allows the version query. The safe config fix is therefore:

- allow local source assets with `{ pathname: '/assets/**' }`
- allow managed uploads with `{ pathname: '/uploads/**' }`
- leave remote patterns unchanged

## Fixes Made

- Added `images.localPatterns` in `next.config.js` for `/assets/**` and `/uploads/**`.
- Updated `scripts/local-browser-runtime-check.mjs` so the spawned smoke-only Next process sets `AUTH_URL` and `NEXTAUTH_URL` to the current local smoke origin.
- Updated the mobile search smoke helper to click the accessible mobile search button before clicking the visible search input.
- Updated `scripts/audit-local-asset-dependencies.mjs` so Next image glob patterns such as `/assets/**` are not reported as missing literal media files.
- Added focused tests in:
  - `tests/runtime-stability.test.ts`
  - `tests/local-asset-dependency-policy.test.ts`

## Intentionally Not Fixed

- No app auth/security logic was changed. The NextAuth item was treated as smoke environment setup, not a production auth behavior change.
- No mobile navbar/search UI was redesigned. The app controls already had accessible labels.
- No category JPG/version pair was changed, including the Step 316 Toys & Collectibles pair.
- No category SVG edits were touched.
- No managed upload/orphan directory was touched.

## After Smoke

Command:

```bash
node scripts/local-browser-runtime-check.mjs --mode dev --port 3118 --cdp-port 9418 --startup-timeout-ms 90000 --request-timeout-ms 20000
```

Saved evidence:

- `audit-reports/318-browser-runtime-smoke-cleanup/after-runtime-check.json`
- `audit-reports/318-browser-runtime-smoke-cleanup/after-runtime-output.txt`

Result: passed, exit code 0.

After-result summary:

- `ok: true`
- bad page count: 0
- bad accessibility count: 0
- image localPatterns warning count: 0
- NextAuth ClientFetchError count: 0
- mobile search helper: passed, `mobileSearchButtonClicked: true`, `mobileSearchInputClicked: true`, query `phone`, suggestions closed after Escape

## Validation

Focused checks already run:

- `npm exec -- tsx --test tests/runtime-stability.test.ts --test-reporter=spec` passed.
- `npm exec -- tsx --test tests/runtime-stability.test.ts tests/local-asset-dependency-policy.test.ts tests/ui-ux-redesign-readiness.test.ts --test-reporter=spec` passed.
- `npm run typecheck` passed.
- `npx eslint next.config.js scripts/local-browser-runtime-check.mjs tests/runtime-stability.test.ts --max-warnings=0` passed.

Full required validation passed:

- `git status --short` saved to `audit-reports/318-browser-runtime-smoke-cleanup/pre-validation-git-status.txt`.
- `npm run db:url:safety` passed.
- `npm run db:prisma:local:validate` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 552 tests, 83 suites, 0 failures.
- `npm run build` passed.

Prisma generate:

- `npm run db:prisma:local:generate` reached Prisma generate but failed with the known Windows engine lock:
  `EPERM: operation not permitted, rename ... query_engine-windows.dll.node.tmp... -> query_engine-windows.dll.node`
- Candidate Node processes were listed in `audit-reports/318-browser-runtime-smoke-cleanup/prisma-generate-locking-processes.txt`.
- No processes were killed.

## Staged/Committed Files

Stage only Step 318 files:

- `next.config.js`
- `scripts/audit-local-asset-dependencies.mjs`
- `scripts/local-browser-runtime-check.mjs`
- `tests/local-asset-dependency-policy.test.ts`
- `tests/runtime-stability.test.ts`
- `audit-reports/318_BROWSER_RUNTIME_SMOKE_CLEANUP.md`
- `audit-reports/318_NEXT_PROMPT_DRAFT.md`
- `audit-reports/318-browser-runtime-smoke-cleanup/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The browser smoke still depends on a local Chromium/Edge-compatible browser being available.
- The NextAuth baseline did not expose a failed request status, so the classification is based on the observed console error, the global `useSession` trigger, and the previous smoke env mismatch.
- Remote product catalog media backlog remains separate and unchanged.

## Recommended Next Step

Run a final validation and commit this Step 318 cleanup. Then continue with the next prelaunch closure item from the current audit queue without touching the protected category SVG and upload-directory worktree changes unless explicitly approved.
