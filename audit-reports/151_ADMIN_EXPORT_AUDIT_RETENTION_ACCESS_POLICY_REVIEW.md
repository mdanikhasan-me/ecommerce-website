# Step 151 - Admin Export Audit Retention Access Policy Review

## Audit Log Retention Options

Potential future retention options:

- local development: disposable logs, cleared freely;
- staging: short retention for QA and incident rehearsal;
- production short retention: e.g. operational window only;
- production medium retention: balances investigation needs and data minimization;
- production long retention: only with explicit owner/legal/security approval.

No retention value is implemented in this batch.

## Recommended Default For Pre-Launch/Local/Staging

Recommended current policy:

- local: no durable retention requirement;
- staging: short retention with synthetic data only;
- production: undecided until owner approves provider, compliance posture, backup policy, and incident workflow.

## Production Policy Questions Needing Owner Decision

Before production durable audit storage:

- how long should admin export audit logs be retained;
- who owns review and deletion decisions;
- whether backups retain deleted audit records;
- whether legal hold is needed;
- whether audit logs may be exported;
- how incident reports should reference audit logs;
- who can access logs during support work.

## Who Can View Export Audit Logs

Recommended future default:

- not all admins;
- likely `SUPER_ADMIN` or a dedicated audit/security role;
- support access only through approved incident workflow.

## Who Can Export Audit Logs

Audit-log export should be stricter than report export.

Recommended future default:

- no audit-log export until access policy and masking are approved;
- if implemented, require a dedicated permission and audit that action too.

## PII Flags But Not PII Values

Audit logs can safely contain static classifications such as:

- contains customer PII: yes/no;
- contains business-sensitive data: yes/no;
- report type: allowlisted enum.

Audit logs must not contain actual PII values.

## Legal Hold, Deletion, And Backups

Future policy must decide:

- whether legal hold overrides deletion;
- whether backups include audit logs;
- how backup expiration aligns with retention;
- how deletion requests affect audit logs;
- how to avoid storing sensitive raw values in the first place.

## Incident Review Workflow

Future incident review should define:

- who can open an investigation;
- who can view logs;
- what fields can be shared;
- how screenshots or exported logs are handled;
- how findings are documented without exposing PII.

## Admin UI Exposure Risks

Admin UI exposure risks include:

- too many admins viewing audit logs;
- logs showing sensitive event context;
- audit logs becoming another export surface;
- lack of retention visibility;
- overconfidence that console logging equals compliance.

## Future Policy Implementation Requirements

Future implementation needs:

- role/permission model;
- route guards for audit log viewing;
- durable storage decision;
- retention cleanup plan;
- backup policy;
- no-PII logging tests;
- DB/auth-backed tests.

## Remaining Risks

- No owner-approved production retention window.
- No audit-log viewer permission model.
- No durable storage implementation.
- No incident workflow.

## Recommended Next Loop

Proceed to Loop 152: role-separated permission review.
