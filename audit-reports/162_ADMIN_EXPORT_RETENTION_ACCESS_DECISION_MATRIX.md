# Step 162 - Admin Export Retention Access Decision Matrix

## Decision Matrix

| Topic | Recommended pre-launch default | Classification | Implementation blocked | Future tests needed |
| --- | --- | --- | --- | --- |
| Local retention | Disposable/local-only; no durable requirement | Safe default | No | No |
| Staging retention | Short retention with synthetic data only | OWNER_APPROVAL_REQUIRED before implementation | Yes | Yes |
| Production retention | `OWNER_APPROVAL_REQUIRED` | OWNER_APPROVAL_REQUIRED | Yes | Yes |
| Audit-log viewer access | No viewer UI yet; later dedicated permission | Safe default now, owner approval later | Yes | Yes |
| Audit-log export access | No audit-log export feature | Safe default | Yes for future export | Yes |
| Audit-log deletion | No deletion workflow until storage exists | OWNER_APPROVAL_REQUIRED | Yes | Yes |
| Backup behavior | Undefined until storage/provider chosen | OWNER_APPROVAL_REQUIRED | Yes | Yes |
| Legal hold | Not defined pre-launch | OWNER_APPROVAL_REQUIRED | Yes | Yes |
| Incident review access | Restrict to owner/security-approved roles later | OWNER_APPROVAL_REQUIRED | Yes | Yes |
| Support access | No default support access to audit logs | Safe default now, owner approval later | Yes | Yes |

## Practical Defaults

- Local logs are disposable.
- Staging should use synthetic data and short retention only after owner approval.
- Production retention is not chosen.
- No admin UI for audit logs should be added yet.
- No audit-log export should be added yet.
- Backups/legal hold/deletion require a storage decision first.

## Required Evidence Before Implementation

- Durable storage choice.
- Permission model.
- Retention period.
- Incident workflow.
- DB/auth-backed tests.
- No-PII audit log assertions.

## Recommended Next Loop

Proceed to Loop 163: permission defaults and escalation.
