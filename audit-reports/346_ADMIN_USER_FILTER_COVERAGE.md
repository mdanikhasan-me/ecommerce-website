# Step 346 Admin User Filter Coverage

## Scope

Step 346 skips the still-blocked media decision and completes a bounded non-media no-DB test bundle for admin user update and list-filter contracts.

Latest commit before Step 346:

```text
0a68c16 test: cover admin settings contracts
```

Step 345 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

The existing admin user validation suite covered core payload normalization and several filter basics, but a few role and list-filter contracts were not directly locked down:

- managed role enum order for admin UI/filter use;
- explicit inactive and super-admin update payload preservation;
- malformed non-object user update rejection;
- default list filter shape for missing query parameters;
- exact search `OR` branches for name, email, and phone;
- role-only `where` clauses that do not add search branches.

These contracts protect admin user management without requiring database access, media changes, browser auth, migrations, or provider decisions.

## Fix

Expanded focused no-DB validation coverage in:

- `tests/admin-user-validation.test.ts`

No runtime code changed.

## Validation Results

Focused and standard validation passed:

- `git diff --check -- tests/admin-user-validation.test.ts audit-reports/346_ADMIN_USER_FILTER_COVERAGE.md audit-reports/346_NEXT_PROMPT_DRAFT.md audit-reports/346-admin-user-filter-coverage` passed.
- `npx tsx --test tests/admin-user-validation.test.ts` passed: 13 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 636 tests, 84 suites, 0 failures.

Evidence:

- `audit-reports/346-admin-user-filter-coverage/baseline-git-status.txt`
- `audit-reports/346-admin-user-filter-coverage/source-diff.patch`
- `audit-reports/346-admin-user-filter-coverage/validation-diff-check.txt`
- `audit-reports/346-admin-user-filter-coverage/validation-focused-tests.txt`
- `audit-reports/346-admin-user-filter-coverage/validation-advisor-state.txt`
- `audit-reports/346-admin-user-filter-coverage/validation-terminal-loop-state.txt`
- `audit-reports/346-admin-user-filter-coverage/validation-typecheck.txt`
- `audit-reports/346-admin-user-filter-coverage/validation-lint.txt`
- `audit-reports/346-admin-user-filter-coverage/validation-npm-test.txt`
- `audit-reports/346-admin-user-filter-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only no-DB tests and audit docs. The changed admin user contracts are covered by focused tests and the full test suite.

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

Step 346 did not touch:

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

- `tests/admin-user-validation.test.ts`
- `audit-reports/346_ADMIN_USER_FILTER_COVERAGE.md`
- `audit-reports/346_NEXT_PROMPT_DRAFT.md`
- `audit-reports/346-admin-user-filter-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step adds no-DB admin user helper coverage only. It does not prove database-backed admin user saves, browser rendering, or production auth behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
