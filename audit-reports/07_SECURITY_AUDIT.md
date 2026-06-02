# Security Audit

Security score: 67/100.

severity | exploit_scenario | affected_role | affected_files | evidence_ids | recommended_fix | must_fix_before_launch_yes_no
--- | --- | --- | --- | --- | --- | ---
P0 | Guess order number and view delivery PII on confirmation page. | guest/anyone | src/app/(store)/order/[orderNumber]/confirmation/page.tsx | E022 | Require auth + owner match or signed short-lived confirmation token. | yes
P1 | Cross-site mutation abuse if SameSite assumptions fail. | buyer/admin | custom mutation APIs | E060 | Add CSRF token or Origin/Referer allowlist helper. | yes
P1 | Bypass per-process/header-keyed rate limits. | guest/buyer | src/backend/security/rate-limit.ts | E008 | Use distributed limiter and trusted proxy/IP strategy. | yes
P1 | Spoof future payment callback without webhook verification. | external | payment config/admin payment route | E021;E043;E050 | Add signed webhook, replay defense, idempotency, immutable events. | yes before online payments
P1 | Large/exotic image payloads stress Sharp. | admin/future seller | image-processing/product-editor | E027 | Add MIME allowlist, decoded byte and pixel limits. | yes before seller uploads
P2 | Missing audit rows reduce forensics. | admin | admin-utils | E029 | Make audit failure observable; consider failing high-risk mutations. | no
P2 | Console logging leaks/noisy ops details. | operator | various routes/scripts | E042 | Centralize sanitized structured logging. | no
P2 | Temporary any shim hides Prisma drift. | developer | database/index.ts | E041 | Regenerate Prisma client and remove shim. | no
P2 | Broad ADMIN can export PII reports. | admin | backend/admin/reports.ts | E030 | Review export permission and audit exports. | consider
P2 | Seller role lacks seller ownership APIs. | future seller | schema/product editor | E003;E026;E031 | Add seller-scoped APIs before enabling seller role. | yes before marketplace

## OWASP Notes

- Broken access control: P0 on public order confirmation; admin/account owner checks otherwise appear in sampled files (E006, E007, E022, E023).
- Authentication/session: NextAuth is wired, but runtime cookie flags/OAuth redirects were not verified (E004, E054).
- Input validation: broad validator/test coverage exists, but custom CSRF/origin controls were not found (E034, E060).
- File upload: Sharp optimization exists; decoded-size/MIME hardening needed (E027).
- Secrets: values masked; .env ignored/not tracked (E009, E010).
