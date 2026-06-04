# Step 156 - Admin Export Audit Logging Implementation Risk Register

## Risk Register

| Risk | Area | Likelihood | Impact | Current mitigation | Future mitigation | Owner/decision needed | Blocked by |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Logging is not durable | Storage | High | High | Step 148 report states console logging is not durable | Durable audit storage design | Owner/security decision | Storage and retention policy |
| Logs inaccessible for investigation | Operations | Medium | High | Bounded security events exist | Provider/log access plan | Owner/ops decision | Hosting/provider choice |
| Logs store too much sensitive data | Privacy/security | Medium | High | Sanitizer and Step 148 bounded metadata | DB/auth tests and storage allowlist | Security review | Durable storage design |
| Logs store too little to be useful | Operations | Medium | Medium | Event includes result/status/report type | Correlation strategy and queryable fields | Ops/security decision | Storage design |
| Export behavior regression | Runtime | Low | High | Source tests and build pass | DB/auth-backed route tests | Engineering | Safe test fixtures |
| CSV payload regression | Export contract | Low | High | Step 148 did not change CSV builder | Fixture-based CSV contract tests | Engineering/product | DB/auth QA approval |
| Auth fixture risk | Testing | Medium | High | No DB/auth execution in this batch | Synthetic local auth fixtures | Engineering/security | Local DB/auth setup |
| Local DB/test data readiness | Testing | Medium | High | DB URL safety exists | Local service and fixture plan | Engineering | Local DB service confirmation |
| Role separation missing | Authorization | High | Medium | Current admin guard documented | Permission model design | Product/security | Role policy |
| Masking/redaction missing | Privacy | Medium | High | CSV unchanged and documented | Redaction policy and tests | Product/security | Policy decision |
| SKU policy unresolved | Business data | High | Medium | SKU marked unknown-needs-policy | SKU sensitivity decision | Product/ops | Seller marketplace planning |
| Production retention undecided | Compliance/ops | High | High | Reports avoid compliance claims | Retention/access policy | Owner/legal/security | Provider and policy choices |
| Admin audit UI/access undecided | Admin UX/security | Medium | Medium | No UI added | Dedicated audit-log access model | Product/security | Role policy |
| Remote DB/secrets risk | Environment | Medium | High | DB safety scripts and no secret printing | Continue exact env guardrails | Engineering | Local/staging setup |
| Overclaiming compliance | Documentation | Medium | High | Claims boundary report | Review docs before launch | Owner/security | Durable evidence missing |

## Summary

The highest-risk items are durable storage absence, retention/access decisions, DB/auth-backed testing, and overclaiming compliance.

The safest near-term implementation work remains no-DB adapter/test design until owner policy decisions and local DB/auth fixture readiness are confirmed.
