# 389 Post-388 Validation Recovery

## Exact Failures Before Fix

- `npm run typecheck`
  - Failed at `src/backend/auth/config.ts:47`.
  - Error: `Type 'string | undefined' is not assignable to type 'string'.`
- `npm run build`
  - Failed on the same `src/backend/auth/config.ts:47` type error.
- `npx tsx --test tests/admin-media-orphan-audit.test.ts`
  - Failed in DB-aware mode.
  - One branch returned exit status `1` instead of `0`.
  - Another branch threw `ERR_MODULE_NOT_FOUND` for `src/backend/admin/media-lifecycle.ts?namespace=...` imported through `src/backend/admin/media-reference-guard.ts`.
- `npm test`
  - Previously failed on `tests/admin-media-orphan-audit.test.ts`.

## Root Cause: Auth Config Type / Build Failure

- The JWT callback assigned `token.id = userWithRole.id ?? user.id`.
- `user.id` was still typed as `string | undefined` in the callback context.
- That made the assignment fail strict type checking and blocked the production build.

### Fix

- Guarded the assignment so `token.id` is only written when the resolved user id is a real non-empty string.
- Kept the existing auth behavior intact.
- Did not weaken Google OAuth or redirect safety.

## Root Cause: Admin Media Orphan Audit Test Failure

- The admin media orphan audit loader used `tsx` module import resolution with cache-busting namespace behavior.
- That broke relative TS module resolution on Windows for `media-reference-guard.ts -> media-lifecycle.ts`.
- The DB-aware CLI path therefore failed before the mocked reference source could complete.

### Fix

- Switched the admin media reference imports to alias imports.
- Updated the audit script module importer so, when already running under `tsx`, it uses direct file-URL imports instead of the namespace-wrapped `tsImport` path.
- Preserved all media safety rules and managed-upload policy.

## Files Changed

- `src/backend/auth/config.ts`
- `src/backend/admin/media-reference-guard.ts`
- `src/backend/admin/media-reference-adapter.ts`
- `scripts/audit-admin-media-orphans.mjs`
- `tests/order-invoice-route.test.ts`

## Invoice Proof Status

- Route remains `/account/orders/[id]/invoice`.
- Owner-scoped invoice tests still pass.
- The invoice page remains print-friendly HTML, not PDF.
- The Download Invoice button still points to the real protected route.
- The invoice source test now also asserts the `notFound()` wrong-user path and `window.print()` behavior.

## Validation Results

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npx tsx --test tests/admin-media-orphan-audit.test.ts` passed.
- `npx tsx --test tests/order-progress.test.ts tests/order-invoice-route.test.ts` passed.
- `npx tsx --test tests/auth-host.test.ts tests/google-oauth-config.test.ts tests/auth-redirect.test.ts` passed.
- `npm run build` passed.
- `npm test` passed.

## Step 388 Behavior

- No Step 388 order-details or invoice behavior was changed.
- The redesign, protected invoice route, and print-friendly output remain intact.

## Commit / Push

- Commit hash: see the final response for the exact pushed commit.
- Push result: see the final response for the exact push outcome.

## Guardrails Kept

- `public/assets/icons/ui/categories/*.svg` was left untouched.
- `public/uploads/admin/banners/hero/` was left untouched.
- No env files, OAuth secrets, or media-policy rules were changed.
