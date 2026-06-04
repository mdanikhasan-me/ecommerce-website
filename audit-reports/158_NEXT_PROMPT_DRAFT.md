# Step 158 Next Prompt Draft

Chosen next step: policy-only owner decision checkpoint.

Reason: durable storage, retention/access, role separation, masking/redaction, SKU sensitivity, and compliance claims all need owner decisions before implementation. DB/auth-backed QA is also useful later, but it should not run until route execution and fixture strategy are explicitly approved.

## Recommended Next Step

Proceed to Step 159 as an owner decision workbook for admin export audit logging policy. Keep it docs-only, do not execute export routes, and do not query the database.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce technical recovery workflow.

Latest completed state:

* Step 148 committed fail-open sanitized admin export audit logging.
* Steps 149 through 158 should have created a report-only readiness batch for DB/auth QA, durable storage, retention/access policy, role separation, masking/redaction, SKU sensitivity, compliance claims, and risk tracking.
* Confirm from `audit-reports/157_ADMIN_EXPORT_AUDIT_LOGGING_BATCH_SUMMARY.md` before doing anything else.

Goal:
Create an owner decision workbook for admin export audit logging policy before any durable storage or DB/auth-backed QA implementation.

This is report/docs only.

Read first:

* `audit-reports/149_ADMIN_EXPORT_AUDIT_LOGGING_DB_AUTH_QA_READINESS.md`
* `audit-reports/150_ADMIN_EXPORT_AUDIT_LOGGING_DURABLE_STORAGE_READINESS.md`
* `audit-reports/151_ADMIN_EXPORT_AUDIT_RETENTION_ACCESS_POLICY_REVIEW.md`
* `audit-reports/152_ADMIN_EXPORT_ROLE_SEPARATED_PERMISSION_REVIEW.md`
* `audit-reports/153_ADMIN_EXPORT_MASKING_REDACTION_COMPATIBILITY_REVIEW.md`
* `audit-reports/154_ADMIN_EXPORT_SKU_SENSITIVITY_DECISION_REVIEW.md`
* `audit-reports/155_ADMIN_EXPORT_AUDIT_COMPLIANCE_CLAIMS_BOUNDARY.md`
* `audit-reports/156_ADMIN_EXPORT_AUDIT_LOGGING_IMPLEMENTATION_RISK_REGISTER.md`
* `audit-reports/157_ADMIN_EXPORT_AUDIT_LOGGING_BATCH_SUMMARY.md`
* `src/app/api/admin/reports/export/route.ts`
* `src/backend/admin/export-audit-log.ts`

Allowed files:

* `audit-reports/159_ADMIN_EXPORT_AUDIT_OWNER_DECISION_WORKBOOK.md`
* `audit-reports/159_NEXT_PROMPT_DRAFT.md`

Tasks:

1. Verify latest commit and clean worktree.
2. Summarize the decision areas that block implementation:
   * durable storage path
   * fail-open vs fail-closed future policy
   * retention
   * audit-log access
   * audit-log export
   * role-separated report export permissions
   * masking/redaction
   * SKU sensitivity
   * DB/auth-backed QA fixture approval
   * compliance language
3. Create a decision table with recommended default, alternatives, tradeoffs, and owner decision needed.
4. Create a go/no-go checklist for:
   * no-DB durable adapter design
   * DB/auth-backed QA
   * durable storage implementation
   * role separation
   * masking/redaction
5. Draft exactly one next prompt based on the safest approved path.

Strict guardrails:

* Do not run export routes.
* Do not query the database.
* Do not require authenticated admin credentials.
* Do not read private env files.
* Do not print secrets, full DB URLs, tokens, cookies, credentials, auth headers, payment secrets, private connection strings, customer/order PII, raw CSV rows, raw CSV payloads, or raw user data.
* Do not run migrations, database push, seed/reset, SQL, Docker, provider CLI, deployment, package updates, or remote-service commands.
* Do not change source files, tests, route behavior, CSV payloads, headers, status codes, admin access behavior, masking/redaction, role separation, or storage behavior.
* Do not touch payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle, footer, newsletter, payment-logo, PromoSection, category images, or visual/media assets.
* Never use broad staging.

Validation:

* `git diff --check -- audit-reports/159_ADMIN_EXPORT_AUDIT_OWNER_DECISION_WORKBOOK.md audit-reports/159_NEXT_PROMPT_DRAFT.md`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit:
If validation passes and only allowed files changed, stage exactly:

* `audit-reports/159_ADMIN_EXPORT_AUDIT_OWNER_DECISION_WORKBOOK.md`
* `audit-reports/159_NEXT_PROMPT_DRAFT.md`

Commit message:

```text
docs: add admin export audit owner decision workbook
```

Stop conditions:

* Stop if any source/test/runtime file must be changed.
* Stop if route execution, DB queries, credentials, private env access, migrations, SQL, Docker, provider CLI, deployment, package updates, secrets, PII, or prohibited visual/media work becomes necessary.

Final response format:

1. Summary
2. Files changed/staged/committed
3. Decision workbook result
4. Go/no-go result
5. Validation results
6. Commit hash/oneline, or reason no commit happened
7. Confirmation no prohibited files/actions occurred
8. Remaining risks
9. Recommended next step
```
