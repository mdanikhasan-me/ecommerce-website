# Step 380 Admin User List Filter Hardening

## Scope

Step 380 skips the still-blocked media decision and completes a bounded non-media admin user list pagination hardening step.

Latest commit before Step 380:

```text
c4ace3c fix: harden SEO faceted page parsing
```

Step 379 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`src/backend/admin/user-editor.ts` parsed admin user list `page` and `limit` query values with `Number(...)`.

That preserved useful existing behavior for decimal values such as `2.8`, but also accepted JavaScript numeric spellings such as:

- `0x10`
- `1e3`
- `Infinity`
- unsafe-large integer strings

Those values could reach admin user list pagination and `skip` calculation even though the admin UI expects plain numeric pagination input.

## Fix

Updated:

- `src/backend/admin/user-editor.ts`
- `tests/admin-user-validation.test.ts`

The admin user list filter parser now:

- accepts only trimmed plain decimal numeric strings before numeric conversion
- preserves existing decimal/floor behavior, including `page=2.8` becoming page `2`
- preserves existing negative clamp behavior, including `limit=-5` becoming limit `1`
- rejects hex, exponent, partial, non-finite, and unsafe-large values
- caps safe page values at `MAX_ADMIN_USER_LIST_PAGE`
- keeps limit capped at `MAX_ADMIN_USER_LIST_LIMIT`

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 379 handoff, Step 321 media gate, current status, admin user list filter parser, and focused tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused admin user validation, API contract tests, and standard validation.
- Docs Auditor: created this Step 380 report, evidence folder, and Step 381 handoff prompt.
- Implementer: edited only the admin user filter parser and focused admin user validation tests.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/admin-user-validation.test.ts` passed: 14 tests, 1 suite, 0 failures.
- `npx tsx --test tests/api-error-contract.test.ts` passed: 28 tests, 0 suites, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 705 tests, 87 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/380-admin-user-list-filter-hardening/baseline-git-status.txt`
- `audit-reports/380-admin-user-list-filter-hardening/pre-stage-git-status.txt`
- `audit-reports/380-admin-user-list-filter-hardening/finding-note.txt`
- `audit-reports/380-admin-user-list-filter-hardening/source-diff.patch`
- `audit-reports/380-admin-user-list-filter-hardening/validation-diff-check.txt`
- `audit-reports/380-admin-user-list-filter-hardening/validation-focused-tests.txt`
- `audit-reports/380-admin-user-list-filter-hardening/validation-api-contract-tests.txt`
- `audit-reports/380-admin-user-list-filter-hardening/validation-advisor-state-initial.txt`
- `audit-reports/380-admin-user-list-filter-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/380-admin-user-list-filter-hardening/validation-advisor-state.txt`
- `audit-reports/380-admin-user-list-filter-hardening/validation-terminal-loop-state.txt`
- `audit-reports/380-admin-user-list-filter-hardening/validation-typecheck.txt`
- `audit-reports/380-admin-user-list-filter-hardening/validation-lint.txt`
- `audit-reports/380-admin-user-list-filter-hardening/validation-npm-test.txt`
- `audit-reports/380-admin-user-list-filter-hardening/validation-build.txt`

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

Step 380 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside admin user list filter parsing

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/backend/admin/user-editor.ts`
- `tests/admin-user-validation.test.ts`
- `audit-reports/380_ADMIN_USER_LIST_FILTER_HARDENING.md`
- `audit-reports/380_NEXT_PROMPT_DRAFT.md`
- `audit-reports/380-admin-user-list-filter-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens admin user list filter parsing only. It does not change user mutation behavior, DB data, auth, payment/tracking/seller behavior, storefront visuals, or media handling.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
