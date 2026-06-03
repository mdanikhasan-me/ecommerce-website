# Operations And Rollback Checklist

## Purpose

This checklist documents the operational decisions Boilabin needs before staging and production. It is not legal advice, does not enable payment or tracking, and does not authorize destructive database rollback.

## What Must Exist Before Staging

- Selected staging host/provider.
- Staging URL.
- Staging secret manager.
- Staging database decision.
- Staging noindex/protection plan.
- Staging auth callback configuration.
- Staging admin credential handoff plan.
- Staging monitoring/log access plan.
- Staging smoke test checklist owner.
- Payment and tracking disabled-state confirmation.
- Migration runbook if any staging migration will run.

## What Must Exist Before Production

- Production host/provider and DNS plan.
- Managed production PostgreSQL plan.
- Backup and restore policy.
- Monitoring and alerting.
- Sanitized log retention policy.
- Production secret manager.
- Production admin credential and rotation process.
- Production support/contact process.
- Final route/browser/mobile QA.
- Final SEO robots/sitemap/canonical QA.
- Legal/trust/business page review by qualified humans.
- Explicit go/no-go signoff.

## Monitoring And Error Reporting

- Track deploy status and rollback availability.
- Track server errors, API error rates, auth failures, checkout failures, image upload failures, and DB connectivity failures.
- Track Core Web Vitals and slow route indicators after staging.
- Track 404s for removed features such as `/deals` without treating removal as a staging failure.
- Do not log cookies, auth headers, full URLs with query strings, raw request bodies, delivery PII, payment data, or secrets.
- Restrict log access.

## Security Log Handling

- Use sanitized structured security events only.
- Keep CSP report collection disabled unless a logging/storage policy is approved.
- Do not paste production logs publicly.
- Mask or omit emails unless explicitly required for incident handling.
- Store logs according to retention and access-control policy.
- Escalate suspected secret leakage to immediate rotation.

## Backup And Restore Checklist

- Enable database backups before staging realistic QA.
- Enable production backups before production traffic.
- Document backup frequency and retention.
- Run a restore drill before production launch.
- Confirm restore access does not depend on one person.
- Include media/object storage backup strategy before persistent uploads are production-critical.
- Record how to verify restored data without exposing PII.

## Database Rollback Rules

- Prefer forward-fix migrations when safe.
- Do not run destructive SQL casually.
- Do not reset staging or production without explicit approval and backup confirmation.
- Do not run `prisma db push` for launch migration history.
- Before any migration, identify target environment, backup state, rollback option, and owner.
- Production migration rollback must be reviewed as a separate DB operations step.

## Code Rollback Rules

- Use provider-supported redeploy/rollback to the previous known-good commit or artifact.
- Keep commit hashes and deploy IDs in the incident timeline.
- Roll back environment variables only from a reviewed previous snapshot.
- After rollback, rerun route smoke checks and auth boundary checks.
- Do not reintroduce removed Flash Deals routes as a rollback shortcut.

## Media/Upload Rollback Rules

- Keep a list of canonical local storefront assets.
- Keep persistent upload storage backup before production.
- If a media deploy breaks storefront rendering, roll back to the last known-good asset paths or storage snapshot.
- Do not regenerate or replace category/banner/product media without approved source/licensing.
- Ensure future mobile apps receive stable absolute media URLs after hosting/CDN is selected.

## Admin Access And Rotation Checklist

- Create admin credentials through an approved secure channel.
- Keep staging and production admins separate.
- Rotate credentials before production launch.
- Remove unused admin accounts.
- Document who can create, suspend, or rotate admin access.
- Verify admin routes remain protected.
- Verify audit-log failure visibility remains safe and sanitized.

## Incident Response Checklist

- Assign incident owner.
- Classify severity.
- Preserve deploy ID, commit, timestamp, and environment.
- Stop further deployments unless needed for mitigation.
- Check logs without exposing sensitive values.
- Rotate secrets if exposure is suspected.
- Notify affected parties according to the approved policy.
- Run post-incident review and document follow-up actions.

## Payment Incident Placeholder

Online payment is not enabled. Do not create payment incident workflows that assume live gateways until gateway initiation, webhook verification, reconciliation, refund, and settlement behavior are implemented and approved.

## Tracking/PII Incident Placeholder

Public tracking APIs remain disabled. Any future tracking or guest order lookup must have a PII-safe design, rate limiting, abuse controls, and logging policy before launch.

## Customer Support/Order Issue Checklist

- Verify order status source of truth.
- Verify customer identity before discussing order details.
- Do not expose delivery PII through public links.
- Use generic responses when identity is not verified.
- Escalate payment, refund, return, or delivery disputes to an approved manual process until automated operations are ready.

## Bangladesh Business/Trust Page Review Reminder

- Review contact details, returns, shipping, privacy, terms, and business identity before launch.
- Confirm Bangladesh-specific customer expectations and support language.
- Review consumer trust copy with qualified humans.
- This checklist is not legal advice.

## Future Mobile App Operational Notes

- Keep API response contracts stable.
- Preserve auth/session decisions that can support mobile clients later.
- Use stable media URLs after hosting/CDN selection.
- Keep payment/tracking APIs disabled until mobile-safe contracts exist.
- Plan mobile app incident response separately once apps exist.
- Avoid web-only assumptions in backend operations.
