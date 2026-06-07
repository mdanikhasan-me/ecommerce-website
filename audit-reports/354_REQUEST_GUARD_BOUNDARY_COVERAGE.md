# Step 354 Request Guard Boundary Coverage

## Scope

Step 354 skips the still-blocked media decision and completes a bounded non-media no-DB test bundle for mutation request source-guard boundaries.

Latest commit before Step 354:

```text
f2d4711 test: cover client error boundaries
```

Step 353 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

The existing request-guard suite covered safe methods, same-origin mutation origins, configured origins, same-origin referers, cross-site blocking, explicit origin precedence, missing-source behavior, and origin normalization. Several boundary contracts were still not directly locked down:

- lower-case unsafe mutation methods should still be treated as unsafe;
- configured origins should normalize protocol casing, whitespace, path, and query values before allowlist comparison;
- explicit blocked referers should take precedence over trusted Fetch Metadata;
- trusted Fetch Metadata values should tolerate casing and surrounding whitespace;
- trusted Fetch Metadata should allow `same-origin`, `same-site`, and `none` only when origin and referer are absent.

These contracts protect admin and public mutation routes that call `protectMutationRequest` before auth, validation, or database work.

## Fix

Expanded focused no-DB validation coverage in:

- `tests/request-guard.test.ts`

No runtime code changed.

## Validation Results

Focused and standard validation passed:

- `git diff --check -- tests/request-guard.test.ts audit-reports/354_REQUEST_GUARD_BOUNDARY_COVERAGE.md audit-reports/354_NEXT_PROMPT_DRAFT.md audit-reports/354-request-guard-boundary-coverage` passed.
- `npx tsx --test tests/request-guard.test.ts` passed: 10 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 666 tests, 84 suites, 0 failures.

Evidence:

- `audit-reports/354-request-guard-boundary-coverage/baseline-git-status.txt`
- `audit-reports/354-request-guard-boundary-coverage/source-diff.patch`
- `audit-reports/354-request-guard-boundary-coverage/validation-diff-check.txt`
- `audit-reports/354-request-guard-boundary-coverage/validation-focused-tests.txt`
- `audit-reports/354-request-guard-boundary-coverage/validation-advisor-state.txt`
- `audit-reports/354-request-guard-boundary-coverage/validation-terminal-loop-state.txt`
- `audit-reports/354-request-guard-boundary-coverage/validation-typecheck.txt`
- `audit-reports/354-request-guard-boundary-coverage/validation-lint.txt`
- `audit-reports/354-request-guard-boundary-coverage/validation-npm-test.txt`
- `audit-reports/354-request-guard-boundary-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only no-DB tests and audit docs. The changed request-guard helper contracts are covered by focused tests and the full test suite.

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

Step 354 did not touch:

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

- `tests/request-guard.test.ts`
- `audit-reports/354_REQUEST_GUARD_BOUNDARY_COVERAGE.md`
- `audit-reports/354_NEXT_PROMPT_DRAFT.md`
- `audit-reports/354-request-guard-boundary-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step adds no-DB request-guard helper coverage only. It does not prove every route wiring path, browser behavior, proxy production configuration, or future token-based CSRF strategy.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
