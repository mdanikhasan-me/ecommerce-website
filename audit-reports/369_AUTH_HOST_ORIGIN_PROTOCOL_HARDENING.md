# Step 369 Auth Host Origin Protocol Hardening

## Scope

Step 369 skips the still-blocked media decision and completes a bounded non-media auth host origin protocol hardening step.

Latest commit before Step 369:

```text
0ef3b44 fix: harden safe callback encoded paths
```

Step 368 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`src/backend/auth/host.ts` parsed configured auth origins by constructing a `URL` and returning `.origin`.

That accepted unsupported URL protocols as configured origins, for example:

- `javascript:alert(1)`
- `data:text/plain,boilabin`
- `file:///tmp/boilabin`

Those values do not produce valid canonical web origins for auth host trust. Treating them as configured could suppress the missing canonical origin warning or create confusing host-trust evaluation.

## Fix

Updated:

- `src/backend/auth/host.ts`

Added focused coverage in:

- `tests/auth-host.test.ts`

`parseOrigin` now:

- trims configured values before parsing
- accepts only `http:` and `https:` origins
- ignores unsupported protocols as invalid canonical origins

Focused tests cover unsupported protocols and whitespace-normalized canonical origins.

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 368 handoff, current status, auth host config, and auth host tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused auth-host tests plus standard validation.
- Docs Auditor: created this Step 369 report, evidence folder, and Step 370 handoff prompt.
- Implementer: edited only the authorized auth host parser and focused test files.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/auth-host.test.ts` passed: 10 tests, 1 suite, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 689 tests, 85 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/369-auth-host-origin-protocol-hardening/baseline-git-status.txt`
- `audit-reports/369-auth-host-origin-protocol-hardening/pre-stage-git-status.txt`
- `audit-reports/369-auth-host-origin-protocol-hardening/finding-note.txt`
- `audit-reports/369-auth-host-origin-protocol-hardening/source-diff.patch`
- `audit-reports/369-auth-host-origin-protocol-hardening/validation-diff-check.txt`
- `audit-reports/369-auth-host-origin-protocol-hardening/validation-focused-tests.txt`
- `audit-reports/369-auth-host-origin-protocol-hardening/validation-advisor-state-initial.txt`
- `audit-reports/369-auth-host-origin-protocol-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/369-auth-host-origin-protocol-hardening/validation-advisor-state.txt`
- `audit-reports/369-auth-host-origin-protocol-hardening/validation-terminal-loop-state.txt`
- `audit-reports/369-auth-host-origin-protocol-hardening/validation-typecheck.txt`
- `audit-reports/369-auth-host-origin-protocol-hardening/validation-lint.txt`
- `audit-reports/369-auth-host-origin-protocol-hardening/validation-npm-test.txt`
- `audit-reports/369-auth-host-origin-protocol-hardening/validation-build.txt`

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

Step 369 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside auth host origin parsing

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/backend/auth/host.ts`
- `tests/auth-host.test.ts`
- `audit-reports/369_AUTH_HOST_ORIGIN_PROTOCOL_HARDENING.md`
- `audit-reports/369_NEXT_PROMPT_DRAFT.md`
- `audit-reports/369-auth-host-origin-protocol-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens auth host origin parsing only. It does not change auth providers, session validation, callback target normalization, middleware matching, or payment/tracking/seller behavior.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
