# Storage, Monitoring, And Email Decision Workbook

## Purpose

This workbook plans non-database production services before Boilabin launch: persistent media/uploads, CDN/static assets, monitoring/logging, alerting, and email/SMTP.

It does not configure any service, enable payment, enable tracking, or provide legal advice for Bangladesh compliance.

## Persistent Upload/Media Storage Requirements

- Hosted production must not rely on disposable local filesystem uploads unless provider persistence is fully understood and approved.
- Product, category, banner, brand, and admin-uploaded media need stable URLs.
- Media storage should support backups or recoverable object history.
- Access controls should prevent public listing of private or temporary objects.
- Upload validation must remain server-side before image processing.
- Media URLs should be stable enough for future iPhone and Android apps.
- Decide how local `/assets/**` and hosted `/uploads/**` map to production delivery.

## CDN/Static Asset Requirements

- Static category/banner/product assets should load quickly for Bangladesh users.
- CDN behavior should be verified manually with the chosen provider.
- Cache invalidation and rollback should be understood before launch.
- Image optimization behavior should be verified in staging.
- Avoid cache rules that expose private media or stale PII.
- Keep canonical media paths documented for future mobile apps.

## Product/Brand/Media Localization Dependency

- Remaining media localization is paused until approved source assets and licensing exist.
- Do not restore Baby & Kids artwork without a dedicated visual/media step.
- Do not undo Toys & Collectibles.
- Do not regenerate, scrape, or download media as a hosting decision side effect.
- Product seed images and remaining remote assets need a future approved media plan.
- Provider selection should account for eventual stable local or CDN-hosted assets.

## Monitoring/Error Tracking Requirements

- Capture server errors, API errors, DB connectivity failures, auth boundary failures, checkout errors, upload errors, and deploy failures.
- Avoid logging cookies, auth headers, tokens, payment data, full URLs with query strings, raw request bodies, delivery addresses, phone numbers, or customer PII.
- Restrict log access.
- Define retention and deletion policy.
- Ensure monitoring can separate staging and production.
- Verify monitoring does not require enabling tracking/analytics.

## Security Logging Requirements

- Use sanitized security events.
- Keep CSP report collection disabled unless logging/storage policy is approved.
- Do not store raw CSP reports with full URLs or sensitive fields.
- Do not paste production logs into public channels.
- Rotate secrets immediately if logs reveal sensitive values.
- Document who can access security logs.

## Alerting Requirements

- Build/deploy failure alerts.
- High server error rate alerts.
- Authentication failure spike alerts.
- Checkout failure alerts.
- Upload failure alerts.
- DB connectivity/capacity alerts.
- Backup failure alerts.
- Error monitoring silence alerts so broken alerting is noticed.

## Email/SMTP Requirements

- SMTP or transactional email provider is not production-ready yet.
- Do not store SMTP credentials in source files.
- Decide sender domain, reply-to address, bounce handling, and support ownership.
- Verify deliverability before production launch.
- Keep staging email behavior separate from production.
- Avoid sending real customer email from staging unless explicitly approved.

## Newsletter/Contact Form Requirements

- Contact and newsletter forms need an approved delivery/storage process.
- Newsletter sending, unsubscribe, consent, and list hygiene require a separate plan.
- Contact form forwarding must avoid exposing PII in logs.
- Rate limiting and request guards must remain enabled.
- This workbook is not legal advice; compliance questions need qualified review.

## Order Notification Requirements

- Decide which order events send email or notifications.
- Keep message templates free from unnecessary PII.
- Verify order notifications cannot be triggered by unauthorized users.
- Confirm failed email delivery handling.
- Avoid payment-status email promises until payment integration is approved.

## Bounce/Unsubscribe/Compliance Questions

- How are bounces processed?
- How are unsubscribe requests handled?
- How is consent recorded?
- What support address is monitored?
- What retention policy applies to email events?
- What Bangladesh-specific business/compliance expectations require qualified review?

## Payment Incident Placeholder

Online payment is not enabled. Payment incident handling should remain a placeholder until gateway initiation, webhook verification, reconciliation, refunds, settlement, and customer support procedures are approved.

## Tracking/PII Incident Placeholder

Tracking APIs remain disabled. Any future tracking or guest order lookup must have a PII-safe design, strict rate limiting, abuse prevention, and sanitized logging before launch.

## Future Mobile App Operational Requirements

- API origins should remain stable.
- Media URLs should be absolute and stable.
- Auth/session strategy should be mobile-compatible before mobile app implementation.
- Error response shapes should remain stable for app clients.
- Push notifications, deep links, mobile payment handoff, and app analytics require separate future decisions.
- Operational runbooks should distinguish web, iPhone, and Android clients later.

## Provider Questions To Ask

- How are uploads persisted across deploys?
- How are assets served and cached?
- How are cache invalidations performed?
- How are logs stored, searched, exported, and deleted?
- How are alerts delivered?
- How are SMTP credentials stored?
- How are bounces and unsubscribe events exposed?
- How can media and logs be exported during provider change?
- What current pricing, limits, and regional behavior apply? Verify manually.

## Go/No-Go Checklist

Go requires:

- Persistent media/upload plan approved.
- CDN/static asset behavior verified.
- Monitoring and alerting plan approved.
- Security log retention/access approved.
- Email/SMTP plan approved or production email intentionally deferred.
- Newsletter/contact handling approved.
- Backup/export for media and logs understood.
- Payment/tracking remain disabled unless separate approved steps complete.
- Future mobile media/API needs considered.

No-go if media persistence, logging privacy, email handling, or alert ownership is unclear.
