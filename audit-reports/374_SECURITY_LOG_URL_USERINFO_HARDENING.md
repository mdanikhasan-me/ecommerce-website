# Step 374 Security Log URL Userinfo Hardening

## Scope

Step 374 skips the still-blocked media decision and completes a bounded non-media security log sanitizer hardening step.

Latest commit before Step 374:

```text
4a99ec2 fix: harden request guard explicit origins
```

Step 373 was pushed to GitHub:

```text
git push origin main
```

Remote push target:

```text
origin https://mdanikhasan-dev@github.com/mdanikhasan-dev/ecommerce-website.git
branch main
```

## Problem

`src/backend/security/security-log.ts` stripped query strings and fragments from logged URLs, but HTTP(S) URLs containing username/password userinfo were still parsed and canonicalized.

Examples:

- `https://user:pass@boilabin.com/account`
- `https://user:pass@evil.example.test/path`

Those values did not leak userinfo through `URL.origin`, but they could make credential-bearing hostile inputs look like ordinary sanitized URL or origin fields in security event output.

Focused testing also exposed that camelCase metadata keys such as `sourceOrigin` were not classified as origin fields. They could therefore fall through to generic string sanitization instead of origin sanitization.

## Fix

Updated:

- `src/backend/security/security-log.ts`
- `tests/security-log.test.ts`

The security log sanitizers now:

- reject username/password userinfo in `sanitizeUrlForLog`
- reject username/password userinfo in `sanitizeOriginForLog`
- classify camelCase origin metadata keys such as `sourceOrigin` as origin fields
- keep `original-policy`-style metadata distinct from origin metadata

Focused tests cover URL sanitizer rejection, origin sanitizer rejection, structured security event output, and metadata behavior for credential-bearing URL and origin fields.

## Workflow Lanes

Real subagent tooling was not requested for this `next` step, so this was handled in the same VS Code Codex chat with simulated workflow lanes:

- Explorer: reviewed Step 373 handoff, Step 321 media gate, current status, security log sanitizer behavior, and security/CSP tests.
- Guardian: kept media/upload/env/package/Prisma/DB/provider/payment/tracking/seller surfaces out of scope.
- Validator: selected focused security log tests, CSP report tests, and standard validation.
- Docs Auditor: created this Step 374 report, evidence folder, and Step 375 handoff prompt.
- Implementer: edited only the security log sanitizer and focused security log tests.

## Validation Results

Focused and standard validation passed:

- `npx tsx --test tests/security-log.test.ts` passed: 8 tests, 0 failures.
- `npx tsx --test tests/csp-report.test.ts` passed: 7 tests, 0 failures.
- `node scripts/boilabin-advisor-state.mjs` passed.
- `node scripts/boilabin-terminal-loop-state.mjs` passed.
- `npm run typecheck` passed.
- `npm run lint` passed with the existing Next `next lint` deprecation notice.
- `npm test` passed: 698 tests, 86 suites, 0 failures.
- `npm run build` passed.

Evidence:

- `audit-reports/374-security-log-url-userinfo-hardening/baseline-git-status.txt`
- `audit-reports/374-security-log-url-userinfo-hardening/pre-stage-git-status.txt`
- `audit-reports/374-security-log-url-userinfo-hardening/finding-note.txt`
- `audit-reports/374-security-log-url-userinfo-hardening/source-diff.patch`
- `audit-reports/374-security-log-url-userinfo-hardening/validation-diff-check.txt`
- `audit-reports/374-security-log-url-userinfo-hardening/validation-focused-tests.txt`
- `audit-reports/374-security-log-url-userinfo-hardening/validation-csp-report-tests.txt`
- `audit-reports/374-security-log-url-userinfo-hardening/validation-advisor-state-initial.txt`
- `audit-reports/374-security-log-url-userinfo-hardening/validation-terminal-loop-state-initial.txt`
- `audit-reports/374-security-log-url-userinfo-hardening/validation-advisor-state.txt`
- `audit-reports/374-security-log-url-userinfo-hardening/validation-terminal-loop-state.txt`
- `audit-reports/374-security-log-url-userinfo-hardening/validation-typecheck.txt`
- `audit-reports/374-security-log-url-userinfo-hardening/validation-lint.txt`
- `audit-reports/374-security-log-url-userinfo-hardening/validation-npm-test.txt`
- `audit-reports/374-security-log-url-userinfo-hardening/validation-build.txt`

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

Step 374 did not touch:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`
- media assets or upload folders
- private env files
- Prisma schema/migrations
- DB rows
- package files
- payment, tracking, seller, storefront visuals, or admin runtime behavior outside security log sanitization

No media action, seed, reset, db push, destructive SQL, migration, provider CLI, package update, or private env read was run.

## Files To Stage

Stage only:

- `src/backend/security/security-log.ts`
- `tests/security-log.test.ts`
- `audit-reports/374_SECURITY_LOG_URL_USERINFO_HARDENING.md`
- `audit-reports/374_NEXT_PROMPT_DRAFT.md`
- `audit-reports/374-security-log-url-userinfo-hardening/*`

Do not stage:

- `public/assets/icons/ui/categories/*.svg`
- `public/uploads/admin/banners/hero/`

## Remaining Risks

- The category SVG and admin hero upload decision remains blocked until the user explicitly approves keep, restore, remove, or promote.
- This step hardens security log sanitization only. It does not change auth providers, sessions, distributed rate limiting, payment/tracking/seller behavior, or media handling.

## Recommended Next Step

Either approve the pending media path from Step 321, or continue with another bounded non-media prelaunch closure task and push the completed commit to GitHub.
