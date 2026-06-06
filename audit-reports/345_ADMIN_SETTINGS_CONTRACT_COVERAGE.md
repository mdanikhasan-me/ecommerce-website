# Step 345 Admin Settings Contract Coverage

## Scope

Step 345 skips the still-blocked media decision and completes a bounded non-media no-DB test bundle for admin settings parser contracts.

Latest commit before Step 345:

```text
1c78a07 test: cover admin notification audience
```

Step 344 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

The existing settings validation suite covered basic normalization and several rejection cases, but a few admin settings contracts were not directly locked down:

- supported setting keys and their groups;
- zero low-stock threshold acceptance and numeric string normalization;
- malformed non-object settings payload rejection;
- fractional and non-numeric low-stock threshold rejection;
- remaining text length boundaries for tagline and address.

These contracts protect admin settings saves without requiring database access, media changes, browser auth, migrations, or provider decisions.

## Fix

Expanded focused no-DB validation coverage in:

- `tests/settings-validation.test.ts`

No runtime code changed.

## Validation Results

Focused and standard validation passed:

- `git diff --check -- tests/settings-validation.test.ts audit-reports/345_ADMIN_SETTINGS_CONTRACT_COVERAGE.md audit-reports/345_NEXT_PROMPT_DRAFT.md audit-reports/345-admin-settings-contract-coverage` passed.
- `npx tsx --test tests/settings-validation.test.ts` passed: 8 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 631 tests, 84 suites, 0 failures.

Evidence:

- `audit-reports/345-admin-settings-contract-coverage/baseline-git-status.txt`
- `audit-reports/345-admin-settings-contract-coverage/source-diff.patch`
- `audit-reports/345-admin-settings-contract-coverage/validation-diff-check.txt`
- `audit-reports/345-admin-settings-contract-coverage/validation-focused-tests.txt`
- `audit-reports/345-admin-settings-contract-coverage/validation-advisor-state.txt`
- `audit-reports/345-admin-settings-contract-coverage/validation-terminal-loop-state.txt`
- `audit-reports/345-admin-settings-contract-coverage/validation-typecheck.txt`
- `audit-reports/345-admin-settings-contract-coverage/validation-lint.txt`
- `audit-reports/345-admin-settings-contract-coverage/validation-npm-test.txt`
- `audit-reports/345-admin-settings-contract-coverage/pre-stage-git-status.txt`

`npm run build` was not rerun because this step changed only no-DB tests and audit docs. The changed admin settings contracts are covered by focused tests and the full test suite.

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

Step 345 did not touch:

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

- `tests/settings-validation.test.ts`
- `audit-reports/345_ADMIN_SETTINGS_CONTRACT_COVERAGE.md`
- `audit-reports/345_NEXT_PROMPT_DRAFT.md`
- `audit-reports/345-admin-settings-contract-coverage/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step adds no-DB settings parser coverage only. It does not prove database-backed settings saves, browser rendering, or production provider behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
