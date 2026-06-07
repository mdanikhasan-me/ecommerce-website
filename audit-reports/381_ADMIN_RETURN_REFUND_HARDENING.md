# Step 381 Admin Return Refund Hardening

## Scope

Step 381 skips the still-blocked media decision and completes a bounded non-media admin return refund amount hardening step.

Latest commit before Step 381:

```text
f2c587a fix: harden admin user list filters
```

Step 380 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`src/backend/admin/return-editor.ts` used `z.coerce.number()` for admin return `refundAmount`.

That allowed JavaScript numeric spellings such as:

- `0x10`
- `1e3`
- `Infinity`
- `NaN`

Those values could reach admin return mutation parsing even though the admin refund amount field should accept plain decimal strings or finite non-negative numbers only.

## Fix

Updated:

- `src/backend/admin/return-editor.ts`
- `tests/return-validation.test.ts`

The admin return refund parser now:

- normalizes omitted, null, and blank refund amounts to `null`
- accepts finite non-negative number values
- accepts plain decimal string values such as `250.5`
- rejects hex, exponent, negative string, non-finite, and NaN values
- preserves the existing `Refund amount is invalid` validation message

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 380 handoff, Step 321 media gate, current status, admin return validation, and focused tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused return validation, API contract tests, and standard validation.
- Docs Auditor: created this Step 381 report, evidence folder, and Step 382 handoff prompt.
- Implementer: completed the existing non-media return refund hardening changes and focused tests.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/return-validation.test.ts` passed: 13 tests, 1 suite, 0 failures.
- `npx tsx --test tests/api-error-contract.test.ts` passed: 28 tests, 0 suites, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 706 tests, 87 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/381-admin-return-refund-hardening/baseline-git-status.txt`
- `audit-reports/381-admin-return-refund-hardening/pre-stage-git-status.txt`
- `audit-reports/381-admin-return-refund-hardening/finding-note.txt`
- `audit-reports/381-admin-return-refund-hardening/source-diff.patch`
- `audit-reports/381-admin-return-refund-hardening/validation-diff-check.txt`
- `audit-reports/381-admin-return-refund-hardening/validation-focused-tests.txt`
- `audit-reports/381-admin-return-refund-hardening/validation-api-contract-tests.txt`
- `audit-reports/381-admin-return-refund-hardening/validation-advisor-state-initial.txt`
- `audit-reports/381-admin-return-refund-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/381-admin-return-refund-hardening/validation-advisor-state.txt`
- `audit-reports/381-admin-return-refund-hardening/validation-terminal-loop-state.txt`
- `audit-reports/381-admin-return-refund-hardening/validation-typecheck.txt`
- `audit-reports/381-admin-return-refund-hardening/validation-lint.txt`
- `audit-reports/381-admin-return-refund-hardening/validation-npm-test.txt`
- `audit-reports/381-admin-return-refund-hardening/validation-build.txt`

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

Step 381 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside admin return refund amount parsing

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/backend/admin/return-editor.ts`
- `tests/return-validation.test.ts`
- `audit-reports/381_ADMIN_RETURN_REFUND_HARDENING.md`
- `audit-reports/381_NEXT_PROMPT_DRAFT.md`
- `audit-reports/381-admin-return-refund-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens admin return refund amount parsing only. It does not change return status workflows, DB data, auth, payment/tracking/seller behavior, storefront visuals, or media handling.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
