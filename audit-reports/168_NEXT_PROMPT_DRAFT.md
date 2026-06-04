# Step 168 Next Prompt Draft

Chosen next step: bounded no-DB durable export audit adapter/interface design and tests, with no route integration.

Reason: Steps 159 through 167 recommend no-DB adapter/interface work as the safest implementation path. DB/auth QA and durable storage writes remain blocked by owner approval, fixture strategy, retention/access policy, and route execution approval.

## Recommended Next Step

Proceed to Step 169 as a bounded no-DB source/test batch for an admin export audit sink adapter interface. Do not integrate it into the live export route and do not write to the database.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce technical recovery workflow.

Latest completed state:

* Step 148 committed fail-open sanitized admin export audit logging.
* Steps 149 through 158 completed readiness planning.
* Steps 159 through 168 should have completed owner-decision/default-policy planning.
* Confirm from `audit-reports/167_ADMIN_EXPORT_POLICY_BATCH_SUMMARY.md` before doing anything else.

Goal:
Run a bounded no-DB source/test implementation batch for an admin export audit sink adapter/interface.

The adapter should prepare for future durable storage, but must not write to the database and must not integrate into the live export route in this step.

Allowed files:

* `src/backend/admin/export-audit-sink.ts`
* `tests/admin-export-audit-sink.test.ts`
* `audit-reports/169_ADMIN_EXPORT_AUDIT_SINK_INTERFACE.md`
* `audit-reports/170_ADMIN_EXPORT_AUDIT_SINK_TEST_HARDENING.md`
* `audit-reports/171_ADMIN_EXPORT_AUDIT_SINK_ROUTE_INTEGRATION_READINESS.md`
* `audit-reports/172_ADMIN_EXPORT_AUDIT_SINK_BATCH_SUMMARY.md`
* `audit-reports/173_NEXT_PROMPT_DRAFT.md`

Tasks:

1. Verify latest commit and clean worktree.
2. Read Steps 159 through 168 plus Step 148 source.
3. Add a dependency-free no-DB sink/interface module that:
   * accepts sanitized admin export security events only;
   * validates bounded result/status/error/report type fields;
   * exposes an in-memory/no-op sink for tests only;
   * exposes a future durable sink interface without implementing DB writes;
   * refuses or omits raw PII, CSV payloads, headers, cookies, raw errors, stacks, and private env values.
4. Add no-DB tests for the sink/interface.
5. Do not wire the sink into `src/app/api/admin/reports/export/route.ts`.
6. Create audit reports and one next prompt draft.

Strict guardrails:

* Do not run export routes.
* Do not query the database.
* Do not require authenticated admin credentials.
* Do not read private env files.
* Do not print secrets, full DB URLs, tokens, cookies, credentials, auth headers, payment secrets, private connection strings, customer/order PII, raw CSV rows, raw CSV payloads, or raw user data.
* Do not run migrations, database push, seed/reset, SQL, Docker, provider CLI, deployment, package updates, or remote-service commands.
* Do not change the live export route, CSV payloads, headers, status codes, admin access behavior, masking/redaction, role separation, or storage behavior.
* Do not touch payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile implementation, product lifecycle, footer, newsletter, payment-logo, PromoSection, category images, or visual/media assets.
* Do not restore removed Flash routes or features.
* Stage exact allowed files only.

Validation:

* `git diff --check -- src/backend/admin/export-audit-sink.ts tests/admin-export-audit-sink.test.ts audit-reports/169_ADMIN_EXPORT_AUDIT_SINK_INTERFACE.md audit-reports/170_ADMIN_EXPORT_AUDIT_SINK_TEST_HARDENING.md audit-reports/171_ADMIN_EXPORT_AUDIT_SINK_ROUTE_INTEGRATION_READINESS.md audit-reports/172_ADMIN_EXPORT_AUDIT_SINK_BATCH_SUMMARY.md audit-reports/173_NEXT_PROMPT_DRAFT.md`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `.\\node_modules\\.bin\\tsx --test tests\\admin-export-audit-sink.test.ts`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit:
If validation passes and only allowed files changed, stage exactly the allowed files that changed.

Commit message:

```text
feat: add no-db admin export audit sink interface
```

Stop conditions:

* Stop if route integration becomes necessary.
* Stop if DB writes, Prisma schema changes, route execution, credentials, private env access, migrations, SQL, Docker, provider CLI, deployment, package updates, secrets, PII, or prohibited visual/media work becomes necessary.

Final response format:

1. Summary of Step 169-173 batch
2. Files changed/staged/committed
3. Sink/interface result
4. Route integration status
5. Tests added/updated
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no prohibited files/actions occurred
9. Remaining risks
10. Recommended next step
```
