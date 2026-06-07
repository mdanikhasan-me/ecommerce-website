# Step 373 Request Guard Explicit Origin Hardening

## Scope

Step 373 skips the still-blocked media decision and completes a bounded non-media request source guard hardening step.

Latest commit before Step 373:

```text
712b8d9 fix: harden auth host origin userinfo
```

Step 372 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`src/backend/security/request-guard.ts` normalized valid HTTP(S) origins, but invalid explicit `Origin` or `Referer` values returned `null`.

That meant a malformed or unsupported explicit source value could be treated the same as a missing source and then fall through to trusted Fetch Metadata such as `Sec-Fetch-Site: same-origin`.

The same normalizer also accepted HTTP(S) URLs containing username/password userinfo before returning the parsed origin.

Examples:

- `Origin: javascript:alert(1)`
- `Referer: https://user:pass@boilabin.test/admin`

## Fix

Updated:

- `src/backend/security/request-guard.ts`
- `tests/request-guard.test.ts`

The request guard now:

- rejects username/password userinfo during origin normalization
- treats a non-empty invalid explicit `Origin` as `blocked-source`
- treats a non-empty invalid explicit `Referer` as `blocked-source`
- only falls through to Fetch Metadata when both explicit source headers are absent or blank

Focused tests cover invalid explicit origin handling, userinfo referer handling, Fetch Metadata precedence, and `normalizeOrigin` userinfo rejection.

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 372 handoff, Step 321 media gate, current status, request guard behavior, and request/API focused tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused request guard tests, API error-contract coverage, and standard validation.
- Docs Auditor: created this Step 373 report, evidence folder, and Step 374 handoff prompt.
- Implementer: edited only the request guard and focused request guard tests.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/request-guard.test.ts` passed: 11 tests, 1 suite, 0 failures.
- `npx tsx --test tests/api-error-contract.test.ts` passed: 28 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 697 tests, 86 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/373-request-guard-explicit-origin-hardening/baseline-git-status.txt`
- `audit-reports/373-request-guard-explicit-origin-hardening/pre-stage-git-status.txt`
- `audit-reports/373-request-guard-explicit-origin-hardening/finding-note.txt`
- `audit-reports/373-request-guard-explicit-origin-hardening/source-diff.patch`
- `audit-reports/373-request-guard-explicit-origin-hardening/validation-diff-check.txt`
- `audit-reports/373-request-guard-explicit-origin-hardening/validation-focused-tests.txt`
- `audit-reports/373-request-guard-explicit-origin-hardening/validation-api-contract-tests.txt`
- `audit-reports/373-request-guard-explicit-origin-hardening/validation-advisor-state-initial.txt`
- `audit-reports/373-request-guard-explicit-origin-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/373-request-guard-explicit-origin-hardening/validation-advisor-state.txt`
- `audit-reports/373-request-guard-explicit-origin-hardening/validation-terminal-loop-state.txt`
- `audit-reports/373-request-guard-explicit-origin-hardening/validation-typecheck.txt`
- `audit-reports/373-request-guard-explicit-origin-hardening/validation-lint.txt`
- `audit-reports/373-request-guard-explicit-origin-hardening/validation-npm-test.txt`
- `audit-reports/373-request-guard-explicit-origin-hardening/validation-build.txt`

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

Step 373 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside request source validation

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/backend/security/request-guard.ts`
- `tests/request-guard.test.ts`
- `audit-reports/373_REQUEST_GUARD_EXPLICIT_ORIGIN_HARDENING.md`
- `audit-reports/373_NEXT_PROMPT_DRAFT.md`
- `audit-reports/373-request-guard-explicit-origin-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens request source validation only. It does not change auth providers, sessions, distributed rate limiting, payment/tracking/seller behavior, or media handling.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
