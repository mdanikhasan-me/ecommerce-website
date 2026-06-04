# Step 161 - Admin Export Durable Storage Decision Matrix

## Storage Options

| Option | Benefits | Risks | Complexity | Migration need | DB/auth test need | Access policy need | Retention need | Pre-launch suitability |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Console/security logging only | Already active from Step 148; no schema change | Not durable, provider-dependent | Low | No | No | Yes later | Yes later | Good as temporary telemetry only |
| Existing admin audit log pathway | Existing DB-backed pattern may be reusable | Generic shape; DB write failure; may store wrong fields if not adapted | Medium | Maybe | Yes | Yes | Yes | Possible after policy review |
| Dedicated DB audit table | Purpose-built fields and indexes | Requires Prisma schema/migration and retention cleanup | High | Yes | Yes | Yes | Yes | Not ready |
| Provider log aggregation | No app schema change | Provider not chosen; retention/access uncertain | Medium | No | Yes | Yes | Yes | Not ready until hosting choice |
| External SIEM/log drain later | Strongest investigation path | Provider, cost, compliance, and ops overhead | High | No or maybe | Yes | Yes | Yes | Future only |

## Recommended Near-Term Path

Recommended near-term path:

1. keep Step 148 console/security logging as temporary fail-open telemetry;
2. design a no-DB durable audit adapter/interface and tests;
3. keep the live export route untouched during adapter design;
4. later decide whether the adapter writes to existing admin audit log, a dedicated DB table, or provider logging;
5. implement storage only after owner approval and DB/auth-backed tests.

## Why This Path Is Safest

- It separates interface design from storage commitment.
- It avoids premature Prisma schema changes.
- It avoids route behavior changes.
- It lets tests prove bounded event shape before DB writes exist.
- It preserves future provider flexibility.

## OWNER_APPROVAL_REQUIRED Items

- Whether storage should use DB, provider logs, or external service.
- Production retention period.
- Audit-log viewer/export access.
- Whether logging may become fail-closed.
- Backup and deletion behavior.

## Recommended Next Loop

Proceed to Loop 162: retention/access decision matrix.
