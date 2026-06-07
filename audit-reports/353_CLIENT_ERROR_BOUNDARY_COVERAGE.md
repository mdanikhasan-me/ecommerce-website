# Step 353 Client Error Boundary Coverage

## Scope

Step 353 skips the still-blocked media decision and completes a bounded non-media no-DB test bundle for safe client error response helper boundaries.

Latest commit before Step 353:

```text
fb2386c test: cover public input boundaries
```

Step 352 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

The existing client-error suite covered safe validation messages, unauthorized status behavior, Prisma/database internals, stack traces, paths, token-like strings, full URLs, and unknown values. Several helper boundary contracts were still not directly locked down:

- safe client messages should collapse repeated whitespace before returning;
- returned client messages should be capped at the helper's 180-character limit;
- unsafe-error fallbacks should also be normalized before returning;
- blank fallbacks should use the generic safe default;
- safe errors should preserve caller-provided default status values;
- unsafe errors should keep the sanitized fallback while preserving caller-provided default status values.

These contracts protect admin and API catch paths that call `toSafeClientError` or `toSafeClientErrorMessage` before responding to clients.

## Fix

Expanded focused no-DB validation coverage in:

- `tests/client-error.test.ts`

No runtime code changed.

## Validation Results

Focused and standard validation passed:

- `git diff --check -- tests/client-error.test.ts audit-reports/353_CLIENT_ERROR_BOUNDARY_COVERAGE.md audit-reports/353_NEXT_PROMPT_DRAFT.md audit-reports/353-client-error-boundary-coverage` passed.
- `npx tsx --test tests/client-error.test.ts` passed: 8 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 663 tests, 84 suites, 0 failures.

Evidence:

- `audit-reports/353-client-error-boundary-coverage/baseline-git-status.txt`
- `audit-reports/353-client-error-boundary-coverage/source-diff.patch`
- `audit-reports/353-client-error-boundary-coverage/validation-diff-check.txt`
- `audit-reports/353-client-error-boundary-coverage/validation-focused-tests.txt`
- `audit-reports/353-client-error-boundary-coverage/validation-advisor-state.txt`
- `audit-reports/353-client-error-boundary-coverage/validation-terminal-loop-state.txt`
- `audit-reports/353-client-error-boundary-coverage/validation-typecheck.txt`
- `audit-reports/353-client-error-boundary-coverage/validation-lint.txt`
- `audit-reports/353-client-error-boundary-coverage/validation-npm-test.txt`
- `audit-reports/353-client-error-boundary-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only no-DB tests and audit docs. The changed safe client error helper contracts are covered by focused tests and the full test suite.

## Push Rule

The user gave standing permission in this chat to push each completed step to GitHub after commit.

Use:

```text
git push origin main
```

Git account targeting for this repo is pinned to:

```text
mdanikhasan-dev
```

Do not print or store GitHub credentials.

## Guardrail Confirmation

Step 353 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior

No seed, reset, db push, destructive SQL, migration, provider CLI, package update, media deletion, media restore, media move, media staging, or private env read was run.

## Files To Stage

Stage only:

- `tests/client-error.test.ts`
- `audit-reports/353_CLIENT_ERROR_BOUNDARY_COVERAGE.md`
- `audit-reports/353_NEXT_PROMPT_DRAFT.md`
- `audit-reports/353-client-error-boundary-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step adds no-DB client-error helper coverage only. It does not prove every route catch path, browser behavior, production logging, or provider/runtime error behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
