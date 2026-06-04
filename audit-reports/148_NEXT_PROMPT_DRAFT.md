# Step 149 Prompt Draft

```text
/plan

We are continuing the Boilabin pre-launch e-commerce technical recovery workflow.

Latest completed state:

* Step 148 should have completed bounded no-DB/source integration of sanitized admin export audit logging, or documented why it remained report-only.
* Confirm from `audit-reports/148_ADMIN_EXPORT_AUDIT_LOGGING_SOURCE_INTEGRATION.md` before doing anything else.
* Do not assume runtime DB/auth coverage exists unless Step 148 explicitly proves it.

Goal for Step 149:
Create a report-only DB/auth-backed QA readiness plan for admin export audit logging.

This is planning only. Do not execute export routes, query the database, require authenticated admin credentials, or add runtime changes.

Read first:

* `audit-reports/148_ADMIN_EXPORT_AUDIT_LOGGING_SOURCE_INTEGRATION.md`
* `audit-reports/147_ADMIN_EXPORT_AUDIT_ROUTE_INTEGRATION_READINESS.md`
* `src/app/api/admin/reports/export/route.ts`
* `src/backend/admin/export-audit-log.ts`
* `src/backend/security/security-log.ts`
* `tests/admin-reports.test.ts`

Allowed work:

* Read-only source/report review.
* Recommend future DB/auth-backed test scenarios, fixtures, assertions, and stop conditions.
* Create a report and one next prompt draft only.

Allowed files:

* `audit-reports/149_ADMIN_EXPORT_AUDIT_LOGGING_DB_AUTH_QA_READINESS.md`
* `audit-reports/149_NEXT_PROMPT_DRAFT.md`

Strict guardrails:

* Do not run export routes.
* Do not query the database.
* Do not require authenticated admin credentials.
* Do not read private env files.
* Do not print secrets, full DB URLs, tokens, cookies, credentials, auth headers, payment secrets, private connection strings, customer/order PII, raw CSV rows, or raw user data.
* Do not run migrations, database push, seed/reset, SQL, Docker, provider CLI, deployment, package updates, or remote-service commands.
* Do not change source files, tests, route behavior, CSV payloads, headers, status codes, admin access behavior, masking/redaction, role separation, or storage behavior.
* Do not touch payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle, footer, newsletter, payment-logo, PromoSection, category images, or visual/media assets.
* Never use broad staging.

Validation:

* `git diff --check -- audit-reports/149_ADMIN_EXPORT_AUDIT_LOGGING_DB_AUTH_QA_READINESS.md audit-reports/149_NEXT_PROMPT_DRAFT.md`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`

Report:
Create `audit-reports/149_ADMIN_EXPORT_AUDIT_LOGGING_DB_AUTH_QA_READINESS.md` with:

1. latest Step 148 verification
2. DB/auth-backed QA scope
3. required fixtures
4. route scenarios
5. assertions for response preservation
6. assertions for sanitized audit logging
7. prohibited data checklist
8. validation plan
9. remaining risks
10. recommended next step

Commit:
Stage only the exact allowed files that changed.

Commit message:

```text
docs: plan admin export audit logging db auth qa
```

Stop conditions:

* Stop if DB/auth route execution becomes necessary.
* Stop if secrets, env access, DB mutation, deployment, provider CLI, or prohibited source changes become necessary.
* Stop if Step 148 cannot be verified from report evidence.

Final response format:

1. Summary
2. Files changed/staged/committed
3. Step 148 verification result
4. DB/auth QA readiness result
5. Validation results
6. Commit hash/oneline, or reason no commit happened
7. Prohibited-action confirmation
8. Remaining risks
9. Recommended next step
```
