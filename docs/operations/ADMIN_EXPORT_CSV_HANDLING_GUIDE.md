# Admin Export CSV Handling Guide

Boilabin admin CSV exports may contain customer PII, order/payment-sensitive data, or business-sensitive inventory and sales data.

Use this guide for local and future staging/production operations. This is operational guidance, not legal advice.

## Handling Rules

- Treat downloaded admin CSV files as sensitive local files.
- Do not share CSV exports in public chats, public tickets, public docs, screenshots, or unapproved collaboration tools.
- Delete local CSV exports when they are no longer needed for the approved admin task.
- Do not store downloaded CSV exports in repo folders, source-control folders, shared asset folders, or audit-report folders.
- Do not paste raw CSV rows, customer names, customer emails, phone numbers, order identifiers tied to real customers, delivery details, or payment-related status data into docs or chats.
- Use sanitized summaries when discussing report outcomes.
- Approved shared storage, retention periods, and production handling rules require a future provider/security decision.

## Current Control Limits

- The admin reports page shows sensitivity labels and asks for browser confirmation before opening export links.
- The confirmation is a UI guard only; it is not route-level export permission enforcement.
- No export audit logging, masking/redaction, role-separated export permission, or persistent storage policy is implemented yet.

## Future Decisions Needed

- Whether SKUs are public catalog identifiers or internal business-sensitive inventory identifiers.
- Which admin roles may export orders, products, and customers.
- Whether customer/order CSV fields should be masked or redacted.
- Where approved staging/production exports may be stored.
- How long exports may be retained.
- How sanitized export audit logs should be stored and reviewed.
