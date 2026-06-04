# Step 178 - Next Prompt Draft

Chosen next step: admin/vendor image upload optimization implementation batch.

Reason: the media pipeline already has Sharp validation and WebP output, but multi-vendor scale requires derived variants, clearer limits, storage policy, and stronger tests before UI/UX redesign or merchant feed work.

## Recommended Next Step

Proceed to Step 179 as a bounded implementation batch for media upload optimization guardrails. Keep it no-DB and do not change visual design.

```text
/plan

We are continuing the Boilabin pre-launch e-commerce technical recovery workflow.

Latest completed state:

* Step 148 added fail-open sanitized admin export audit logging.
* Steps 149 through 168 completed admin export audit readiness and owner/default policy planning.
* Steps 169 through 178 should have completed whole-site understanding, content quality, Search Everywhere, media performance, product/category schema, scale, and UI/UX boundary audits.
* Confirm from `audit-reports/177_BATCH_SUMMARY.md` before doing anything else.

Goal:
Run a bounded no-DB implementation batch for admin/vendor image upload optimization guardrails.

This batch should improve upload/media performance foundations without changing frontend visual design, route behavior, database schema, or production storage provider.

Allowed files:

* `src/backend/admin/image-processing.ts`
* `tests/image-upload-validation.test.ts`
* `tests/media-upload-readiness-policy.test.ts`
* `scripts/audit-media-upload-readiness.mjs`
* `docs/MEDIA_UPLOAD_POLICY.md`
* `audit-reports/179_MEDIA_UPLOAD_VARIANT_POLICY.md`
* `audit-reports/180_IMAGE_PROCESSING_GUARDRAIL_IMPLEMENTATION.md`
* `audit-reports/181_MEDIA_UPLOAD_TEST_HARDENING.md`
* `audit-reports/182_MEDIA_STORAGE_CDN_PROVIDER_BOUNDARY.md`
* `audit-reports/183_MEDIA_BATCH_SUMMARY.md`
* `audit-reports/184_NEXT_PROMPT_DRAFT.md`

Tasks:

1. Verify latest commit and clean worktree.
2. Read Steps 169 through 178 and current image upload code/tests.
3. Define a clear media upload policy for products, banners, categories, and future vendors.
4. Add no-DB image processing guardrails only if safe:
   * stricter helper-level upload profiles;
   * explicit output intent names;
   * tests for byte limit, decoded pixel limit, MIME mismatch, and WebP persistence;
   * no database access;
   * no production storage provider.
5. Do not implement CDN/object storage yet.
6. Do not change UI design.
7. Do not change product/category/banner route behavior beyond helper-level validation if explicitly covered by tests.
8. Create reports and a next prompt draft.

Strict guardrails:

* Do not change Prisma schema or migrations.
* Do not run migrations, db push, seed/reset, SQL, Docker, provider CLI, deployment, package updates, or remote-service commands.
* Do not query the database.
* Do not read private env files.
* Do not print secrets, full DB URLs, tokens, cookies, credentials, auth headers, private connection strings, customer/order PII, raw user data, or raw uploads.
* Do not change frontend visual design.
* Do not touch footer, newsletter, payment-logo assets, PromoSection, category media assets, Baby & Kids restoration, Toys rollback, Flash Deals restoration, payment, tracking, seller marketplace, CSP enforcement, distributed rate limiting, mobile app implementation, or product lifecycle migration.
* Do not restore `/deals` or `/api/admin/flash-sales`.
* Stage exact allowed files only.

Validation:

* `git diff --check -- src/backend/admin/image-processing.ts tests/image-upload-validation.test.ts tests/media-upload-readiness-policy.test.ts scripts/audit-media-upload-readiness.mjs docs/MEDIA_UPLOAD_POLICY.md audit-reports/179_MEDIA_UPLOAD_VARIANT_POLICY.md audit-reports/180_IMAGE_PROCESSING_GUARDRAIL_IMPLEMENTATION.md audit-reports/181_MEDIA_UPLOAD_TEST_HARDENING.md audit-reports/182_MEDIA_STORAGE_CDN_PROVIDER_BOUNDARY.md audit-reports/183_MEDIA_BATCH_SUMMARY.md audit-reports/184_NEXT_PROMPT_DRAFT.md`
* `node scripts/boilabin-terminal-loop-state.mjs`
* `node scripts/boilabin-advisor-state.mjs`
* `npm run db:url:safety`
* `node scripts/audit-media-upload-readiness.mjs`
* `.\\node_modules\\.bin\\tsx --test tests\\image-upload-validation.test.ts tests\\media-upload-readiness-policy.test.ts`
* `npm run typecheck`
* `npm run lint`
* `npm test`
* `npm run build`

Commit:
If validation passes and only allowed files changed, stage exactly the allowed files that changed.

Commit message:

```text
fix: harden media upload optimization guardrails
```

Stop conditions:

* Stop if route behavior changes become necessary.
* Stop if object storage/CDN/provider setup becomes necessary.
* Stop if DB access, migrations, private env, SQL, Docker, deployment, package updates, secrets, PII, or visual redesign becomes necessary.

Final response format:

1. Summary of Step 179-184 media batch
2. Files changed/staged/committed
3. Media policy result
4. Image processing guardrail result
5. Tests added/updated
6. Validation results
7. Commit hash/oneline, or reason no commit happened
8. Confirmation no prohibited files/actions occurred
9. Remaining risks
10. Recommended next step
```
